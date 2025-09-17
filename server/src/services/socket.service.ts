import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

import { db } from "../utils/db";
import { BadRequestException } from "../utils/AppError";
import { APP_CONFIG } from "../config/app.config";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  workspaceId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Socket {
  id: string;
  userId?: string;
  workspaceId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  handshake: {
    auth: {
      userId?: string;
      workspaceId?: string;
    };
  };
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  to: (room: string) => {
    emit: (event: string, data: any) => void;
    except: (socketId: string) => {
      emit: (event: string, data: any) => void;
    };
  };
  disconnect: () => void;
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // workspaceId -> Set of socketIds
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: APP_CONFIG.CLIENT_BASE_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const userId = socket.handshake.auth.userId;
        const workspaceId = socket.handshake.auth.workspaceId;

        if (!userId || !workspaceId) {
          return next(new Error("Authentication required"));
        }

        // Verify user and workspace access
        const userWorkspace = await db.userWorkspace.findFirst({
          where: {
            userId: userId, // Use userId directly from auth
            workspaceId,
            status: "ACTIVE",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        if (!userWorkspace) {
          return next(new Error("Invalid user or workspace access"));
        }

        socket.userId = userWorkspace.user.id;
        socket.workspaceId = workspaceId;
        socket.user = userWorkspace.user;

        next();
      } catch (error) {
        console.error("❌ Socket authentication error:", error);
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(
        `🔌 User ${socket.user?.name} connected to workspace ${socket.workspaceId}`
      );

      // Join workspace room
      if (socket.workspaceId) {
        socket.join(`workspace:${socket.workspaceId}`);
        this.addUserToWorkspace(socket.workspaceId, socket.id);
        this.userSockets.set(socket.userId!, socket.id);

        // Emit user online status to workspace
        this.io.to(`workspace:${socket.workspaceId}`).emit("user_online", {
          userId: socket.userId,
          userName: socket.user?.name,
          timestamp: new Date(),
        });
      }

      // Handle notification read events
      socket.on(
        "notification_read",
        async (data: { notificationId: string }) => {
          try {
            if (!socket.userId) return;

            // Mark notification as read in database
            await db.notification.update({
              where: {
                id: data.notificationId,
                userId: socket.userId,
              },
              data: {
                isRead: true,
                status: "READ",
                readAt: new Date(),
              },
            });

            // Emit to user that notification was marked as read
            socket.emit("notification_marked_read", {
              notificationId: data.notificationId,
              timestamp: new Date(),
            });
          } catch (error) {
            console.error("❌ Error marking notification as read:", error);
            socket.emit("error", {
              message: "Failed to mark notification as read",
            });
          }
        }
      );

      // Handle typing indicators (for future chat features)
      socket.on("typing_start", (data: { channel: string }) => {
        socket.to(`workspace:${socket.workspaceId}`).emit("user_typing", {
          userId: socket.userId,
          userName: socket.user?.name,
          channel: data.channel,
        });
      });

      socket.on("typing_stop", (data: { channel: string }) => {
        socket
          .to(`workspace:${socket.workspaceId}`)
          .emit("user_stopped_typing", {
            userId: socket.userId,
            channel: data.channel,
          });
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(
          `🔌 User ${socket.user?.name} disconnected from workspace ${socket.workspaceId}`
        );

        if (socket.workspaceId) {
          this.removeUserFromWorkspace(socket.workspaceId, socket.id);
          this.userSockets.delete(socket.userId!);

          // Emit user offline status to workspace
          this.io.to(`workspace:${socket.workspaceId}`).emit("user_offline", {
            userId: socket.userId,
            userName: socket.user?.name,
            timestamp: new Date(),
          });
        }
      });
    });
  }

  // Public methods for sending notifications
  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit("new_notification", notification);
    }
  }

  public sendNotificationToWorkspace(
    workspaceId: string,
    notification: any,
    excludeUserId?: string
  ) {
    const room = `workspace:${workspaceId}`;

    if (excludeUserId) {
      // Send to all users in workspace except the excluded user
      this.io
        .to(room)
        .except(this.userSockets.get(excludeUserId) || "")
        .emit("new_notification", notification);
    } else {
      // Send to all users in workspace
      this.io.to(room).emit("new_notification", notification);
    }
  }

  public sendNotificationToMultipleUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  public getOnlineUsers(workspaceId: string): string[] {
    const userSet = this.connectedUsers.get(workspaceId);
    return userSet ? Array.from(userSet) : [];
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Private helper methods
  private addUserToWorkspace(workspaceId: string, socketId: string) {
    if (!this.connectedUsers.has(workspaceId)) {
      this.connectedUsers.set(workspaceId, new Set());
    }
    this.connectedUsers.get(workspaceId)!.add(socketId);
  }

  private removeUserFromWorkspace(workspaceId: string, socketId: string) {
    const userSet = this.connectedUsers.get(workspaceId);
    if (userSet) {
      userSet.delete(socketId);
      if (userSet.size === 0) {
        this.connectedUsers.delete(workspaceId);
      }
    }
  }

  // Get Socket.io instance for advanced usage
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let socketService: SocketService | null = null;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(server);
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new BadRequestException("Socket service not initialized");
  }
  return socketService;
};

export default SocketService;
