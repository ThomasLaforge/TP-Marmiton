import { Router } from "express";
import { db } from "../index.js";
import { checkToken } from "../middleware/checkToken.js";

export const usersRouter = Router();

usersRouter.get("/me", checkToken, async (req, res) => {
  const userId = req.user.id;
  const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
  if (user) {
    delete user.password;
    res.json(user);
  } else {
   res.status(404).json({ error: "User not found" });
 }
});