import { db } from "../database/database.connection.js";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

export async function signUp(req, res) {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) return res.status(422).send({ message: "Passwords do not match" });

  const hash = bcrypt.hashSync(password, 10);

  try {
    const user = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
    if (user.rowCount) return res.status(409).send({ message: "E-mail already in use" });

    await db.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3);`, [name, email, hash]);

    res.status(201).send({ message: "Signed up succesfully" });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function signIn(req, res) {
  const { email, password } = req.body;

  try {
    const user = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
    if (!user.rowCount) return res.status(401).send({ message: "User not found" });

    const isPasswordCorrect = bcrypt.compareSync(password, user.rows[0].password);
    if (!isPasswordCorrect) return res.status(401).send({ message: "Incorrect password" });

    await db.query(`DELETE FROM sessions WHERE "userId"=$1;`, [user.rows[0].id]);

    const token = uuid();
    await db.query(`INSERT INTO sessions ("userId", token) VALUES ($1, $2);`, [user.rows[0].id, token]);

    res.status(200).send({ token: token });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getUserInfo(req, res) {
  const token = res.locals.rows[0].token;

  try {
    const user = await db.query(`
      SELECT sessions."userId" AS id, users.name, CAST((SUM("visitCount") AS "visitCount") AS int)
        FROM sessions
        JOIN users ON sessions."userId" = users.id
        JOIN urls ON sessions."userId" = urls."userId"
        WHERE token=$1
        GROUP BY sessions."userId", users.name;`,
        [token]
    );

    if (!user.rowCount) return res.status(401).send({ message: "Failed to get user data" });

    const urls = await db.query(`
      SELECT urls.id, urls.url, urls."shortUrl", urls."visitCount" FROM urls WHERE urls."userId"=$1;`,
        [user.rows[0].userId]
    );

    const formattedObj = {
      ...user.rows[0],
      shortenedUrls: urls.rows.map(url => ({
        id: url.id,
        url: url.url,
        shortUrl: url.shortUrl,
        visitCount: url.visitCount
      }))
    };

    res.status(200).send(formattedObj);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getRanking(req, res) {
  try {
    const ranking = await db.query(`
      SELECT users.id, users.name, COUNT(urls) AS "linksCount", SUM("visitCount") AS "visitCount"
        FROM users
        LEFT JOIN urls ON users.id = urls."userId"
        GROUP BY users.id, users.name
        ORDER BY "visitCount" DESC
        LIMIT 10;`
    );

    res.status(200).send(ranking.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}