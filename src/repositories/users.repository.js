import { db } from "../database/database.connection.js";

async function getUser(email) {
  const result = await db.query(`
    SELECT * FROM users
    WHERE email=$1;`,
    [email]
  );
  return result;
}

async function signUp(name, email, hash) {
  const result = await db.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3);`,
    [name, email, hash]
  );
  return result;
}

async function deleteSession(userId) {
  const result = await db.query(`
    DELETE FROM sessions
    WHERE "userId"=$1;`,
    [userId]
  );
  return result;
}

async function signIn(userId, token) {
  const result = await db.query(`
    INSERT INTO sessions ("userId", token)
    VALUES ($1, $2);`,
    [userId, token]
  );
  return result;
}

async function getUserInfo(token) {
  const result = await db.query(`
    SELECT sessions."userId" AS id, users.name, CAST(SUM("visitCount") AS INT) AS "visitCount"
    FROM sessions
    JOIN users ON sessions."userId" = users.id
    JOIN urls ON sessions."userId" = urls."userId"
    WHERE token=$1
    GROUP BY sessions."userId", users.name;`,
    [token]
  );
  return result;
}

async function getRanking() {
  const result = await db.query(`
    SELECT users.id, users.name, COUNT(urls) AS "linksCount", SUM("visitCount") AS "visitCount"
    FROM users
    LEFT JOIN urls ON users.id = urls."userId"
    GROUP BY users.id, users.name
    ORDER BY "visitCount" DESC
    LIMIT 10;`
  );
  return result;
}

export const usersRepository = {
  getUser,
  signUp,
  deleteSession,
  signIn,
  getUserInfo,
  getRanking
}