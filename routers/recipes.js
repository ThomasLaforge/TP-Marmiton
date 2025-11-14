import { Router } from "express";
import { db } from "../index.js";
import { checkToken } from "../middleware/checkToken.js";

export const recipesRouter = Router();

recipesRouter.get("/", async (req, res) => {
  const recipes = await db.all("SELECT * FROM recipes");
  res.json(recipes);
});

recipesRouter.post("/", checkToken, async (req, res) => {
  if(!req.body.data) {
    return res.status(400).json({ error: "Missing recipe data" });
  }
  const { title, difficulty, price, time } = req.body.data;
  const newDocumentId = crypto.randomUUID();
  const result = await db.run(
    "INSERT INTO recipes (documentId, title, difficulty, price, time) VALUES (?, ?, ?, ?, ?)",
    [newDocumentId, title, difficulty, price, time]
  );
  const newRecipe = await db.get("SELECT * FROM recipes WHERE id = ?", [
    result.lastID,
  ]);
  res.status(201).json(newRecipe);
});

recipesRouter.get("/:documentId", async (req, res) => {
  const { documentId } = req.params;
  const recipe = await db.get("SELECT * FROM recipes WHERE documentId = ?", [documentId ]);
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).json({ error: "Recipe not found" });
  }
});

// recipesRouter.put("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { title, difficulty, price, time } = req.body;
//   const result = await db.run(
//     "UPDATE recipes SET title = ?, difficulty = ?, price = ?, time = ? WHERE id = ?",
//     [title, difficulty, price, time, id]
//   );
//   if (result.changes > 0) {
//     const updatedRecipe = await db.get("SELECT * FROM recipes WHERE id = ?", [
//       id,
//     ]);
//     res.json(updatedRecipe);
//   } else {
//     res.status(404).json({ error: "Recipe not found" });
//   }
// });

// recipesRouter.patch("/:id", async (req, res) => {
recipesRouter.put("/:documentId", checkToken, async (req, res) => {
  const { documentId } = req.params;
  const fields = [];
  const values = [];

  const data = req.body.data;

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(documentId);

  const result = await db.run(
    `UPDATE recipes SET ${fields.join(", ")} WHERE documentId = ?`,
    values
  );

  if (result.changes > 0) {
    const updatedRecipe = await db.get("SELECT * FROM recipes WHERE documentId = ?", [
      documentId,
    ]);
    res.json(updatedRecipe);
  } else {
    res.status(404).json({ error: "Recipe not found" });
  }
});

recipesRouter.delete("/:documentId", checkToken, async (req, res) => {
  const { documentId } = req.params;
  const result = await db.run("DELETE FROM recipes WHERE documentId = ?", [documentId]);
  if (result.changes > 0) {
    res.status(204).end();
  } else {
    res.status(404).json({ error: "Recipe not found" });
  }
});