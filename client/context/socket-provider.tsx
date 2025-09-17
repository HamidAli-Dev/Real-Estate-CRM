"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "./auth-provider";
import { useWorkspaceContext } from "./workspace-provider";
import { useQueryClient } from "@tanstack/react-query";
import { type Notification } from "@/types/api.types";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  onlineUsers: string[];
  sendNotificationRead: (notificationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const { currentWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !currentWorkspace) {
      // Disconnect if no user or workspace
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setConnectionStatus("disconnected");
        setOnlineUsers([]);
      }
      return;
    }

    // Create new socket connection
    const socket = io(
      process.env.NEXT_PUBLIC_API_MAIN_URL || "http://localhost:5000",
      {
        auth: {
          userId: user.id, // Send user ID separately
          workspaceId: currentWorkspace.workspace.id, // Correct path to workspace ID
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        withCredentials: true, // Include cookies for JWT authentication
      }
    );

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("🔌 WebSocket connected");
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      setOnlineUsers([]);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      setConnectionStatus("error");
      setIsConnected(false);
    });

    // Notification event handlers
    socket.on("new_notification", (notification: Notification) => {
      console.log("🔔 New notification received:", notification);

      // Update the notifications query cache
      queryClient.setQueryData(
        ["notifications", currentWorkspace.workspace.id],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return [notification];
          return [notification, ...oldData];
        }
      );

      // Update notification stats
      queryClient.setQueryData(
        ["notificationStats", currentWorkspace.workspace.id],
        (oldData: any) => {
          if (!oldData)
            return { total: 1, unread: 1, byCategory: {}, byPriority: {} };
          return {
            ...oldData,
            total: oldData.total + 1,
            unread: oldData.unread + 1,
          };
        }
      );

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: notification.id,
        });
      }
    });

    socket.on(
      "notification_marked_read",
      (data: { notificationId: string; timestamp: Date }) => {
        console.log("✅ Notification marked as read:", data.notificationId);

        // Update the notification in cache
        queryClient.setQueryData(
          ["notifications", currentWorkspace.workspace.id],
          (oldData: Notification[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map((notification) =>
              notification.id === data.notificationId
                ? {
                    ...notification,
                    isRead: true,
                    status: "READ" as const,
                    readAt: data.timestamp,
                  }
                : notification
            );
          }
        );

        // Update notification stats
        queryClient.setQueryData(
          ["notificationStats", currentWorkspace.workspace.id],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              unread: Math.max(0, oldData.unread - 1),
            };
          }
        );
      }
    );

    // User online/offline events
    socket.on(
      "user_online",
      (data: { userId: string; userName: string; timestamp: Date }) => {
        console.log(`👤 User ${data.userName} is online`);
        setOnlineUsers((prev) => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      }
    );

    socket.on(
      "user_offline",
      (data: { userId: string; userName: string; timestamp: Date }) => {
        console.log(`👤 User ${data.userName} is offline`);
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    );

    // Typing indicators (for future chat features)
    socket.on(
      "user_typing",
      (data: { userId: string; userName: string; channel: string }) => {
        console.log(`⌨️ ${data.userName} is typing in ${data.channel}`);
      }
    );

    socket.on(
      "user_stopped_typing",
      (data: { userId: string; channel: string }) => {
        console.log(`⌨️ User stopped typing in ${data.channel}`);
      }
    );

    // Error handling
    socket.on("error", (error: { message: string }) => {
      console.error("❌ Socket error:", error.message);
    });

    // Cleanup function
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionStatus("disconnected");
      setOnlineUsers([]);
    };
  }, [user, currentWorkspace, queryClient]);

  // Function to send notification read event
  const sendNotificationRead = (notificationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("notification_read", { notificationId });
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
    onlineUsers,
    sendNotificationRead,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
