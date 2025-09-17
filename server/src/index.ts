import "dotenv/config";
import express, { Request, Response } from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";

import { HTTPSTATUS } from "./config/http.config";
import { APP_CONFIG } from "./config/app.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import {
  securityHeaders,
  apiRateLimit,
} from "./middlewares/security.middleware";
import passportConfig from "./config/passport.config";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import workspaceRoutes from "./routes/workspace.routes";
import propertyRoutes from "./routes/property.routes";
import leadRoutes from "./routes/lead.routes";
import pipelineRoutes from "./routes/pipeline.routes";
import roleRoutes from "./routes/role.routes";
import notificationRoutes from "./routes/notification.routes";
import { initializeSocketService } from "./services/socket.service";

const app = express();

// Security middleware
app.use(securityHeaders);
// app.use(apiRateLimit);

app.use(
  cors({
    origin: APP_CONFIG.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize passport
app.use(passport.initialize());
passportConfig();

app.get("/", (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    message: "Welcome to the Real Estate CRM API",
    status: HTTPSTATUS.OK,
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/workspace", workspaceRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/pipeline", pipelineRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1", notificationRoutes);

app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io service
initializeSocketService(server);

server.listen(APP_CONFIG.PORT, () => {
  console.log(
    `🚀 Server is running on port ${APP_CONFIG.PORT} in ${APP_CONFIG.NODE_ENV} mode`
  );
  console.log(`🔌 WebSocket server initialized for real-time notifications`);
});
