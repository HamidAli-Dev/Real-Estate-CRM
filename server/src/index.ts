import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { HTTPSTATUS } from "./config/http.config";
import { APP_CONFIG } from "./config/app.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    message: "Welcome to the Real Estate CRM API",
    status: HTTPSTATUS.OK,
  });
});

app.use(errorHandler);

app.listen(APP_CONFIG.PORT, () => {
  console.log(
    `Server is running on port ${APP_CONFIG.PORT} in ${APP_CONFIG.NODE_ENV} mode`
  );
});
