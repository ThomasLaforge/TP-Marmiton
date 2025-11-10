import cors from "cors";
import express, { Router } from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { recipesRouter } from "./routers/recipes.js";

export const db = await open({
  filename: "./marmiton.db",
  driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    difficulty INTEGER,
    price INTEGER,
    time INTEGER
  );
`);

const app = express();
app.use(cors());
app.use(express.json());

const apiRouter = Router()
apiRouter.use("/recipes", recipesRouter);
app.use("/api", apiRouter);

app.listen(1337, () => {
  console.log("Server is running on http://localhost:1337");
});