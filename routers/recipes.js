import { Router } from "express";
import { db } from "../index.js";
import { checkToken } from "../middleware/checkToken.js";

export const recipesRouter = Router();

recipesRouter.get("/", async (req, res) => {
  const recipes = await db.all("SELECT * FROM recipes");
  res.json(recipes);
});

recipesRouter.post("/", checkToken, async (req, res) => {
  const { title, difficulty, price, time } = req.body;
  const result = await db.run(
    "INSERT INTO recipes (title, difficulty, price, time) VALUES (?, ?, ?, ?)",
    [title, difficulty, price, time]
  );
  const newRecipe = await db.get("SELECT * FROM recipes WHERE id = ?", [
    result.lastID,
  ]);
  res.status(201).json(newRecipe);
});

recipesRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const recipe = await db.get("SELECT * FROM recipes WHERE id = ?", [id]);
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
recipesRouter.put("/:id", checkToken, async (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(req.body)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);

  const result = await db.run(
    `UPDATE recipes SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  if (result.changes > 0) {
    const updatedRecipe = await db.get("SELECT * FROM recipes WHERE id = ?", [
      id,
    ]);
    res.json(updatedRecipe);
  } else {
    res.status(404).json({ error: "Recipe not found" });
  }
});

recipesRouter.delete("/:id", checkToken, async (req, res) => {
  const { id } = req.params;
  const result = await db.run("DELETE FROM recipes WHERE id = ?", [id]);
  if (result.changes > 0) {
    res.status(204).end();
  } else {
    res.status(404).json({ error: "Recipe not found" });
  }
});

