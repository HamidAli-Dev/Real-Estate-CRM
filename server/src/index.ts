import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { HTTPSTATUS } from "./config/http.config";
import { APP_CONFIG } from "./config/app.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(
  cors({
    origin: APP_CONFIG.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    message: "Welcome to the Real Estate CRM API",
    status: HTTPSTATUS.OK,
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

app.use(errorHandler);

app.listen(APP_CONFIG.PORT, () => {
  console.log(
    `Server is running on port ${APP_CONFIG.PORT} in ${APP_CONFIG.NODE_ENV} mode`
  );
});
