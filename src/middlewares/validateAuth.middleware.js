import { db } from "../database/database.connection.js";

export async function validateAuth(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).send({ message: "Invalid token" });

  try {
    const session = await db.query(`SELECT * FROM sessions WHERE token=$1;`, [token]);
    if (!session.rowCount) return res.status(401).send({ message: "Sign in to perform this action" });

    res.locals = session;

    next();
  } catch (err) {
    res.status(500).send(err.message)
  }
}