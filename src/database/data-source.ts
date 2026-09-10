import "reflect-metadata";
import { DataSource } from "typeorm";

import { env } from "../config/env";
import { User } from "../entities/User";

export const AppDataSource: DataSource = new DataSource({
  type: "postgres",
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  entities: [User],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  synchronize: false,
  logging: false,
});
