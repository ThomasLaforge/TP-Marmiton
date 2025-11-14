import 'dotenv/config';
import express, { Router } from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { authRouter } from "./routers/auth.js";
import { recipesRouter } from "./routers/recipes.js";
import { usersRouter } from './routers/users.js';

export const db = await open({
  filename: "./marmiton.db",
  driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documentId TEXT,
    title TEXT,
    difficulty INTEGER,
    price INTEGER,
    time INTEGER
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT
  );
`);

const app = express();
app.use(express.json());

const apiRouter = Router()
apiRouter.use("/recettes", recipesRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
app.use("/api", apiRouter);

app.listen(1337, () => {
  console.log("Server is running on http://localhost:1337");
});