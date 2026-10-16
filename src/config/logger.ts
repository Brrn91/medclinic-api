import path from "node:path";
import winston from "winston";
import { env } from "./env";

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

const LOG_DIR = path.resolve(process.cwd(), "logs");

const consoleFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  colorize(),
  printf(({ timestamp, level, message, ...meta }) => {
    const extra =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${extra}`;
  }),
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.logLevel,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      format: fileFormat,
    }),
  ],
});
