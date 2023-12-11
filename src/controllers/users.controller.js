import { db } from "../database/database.connection.js";

import httpStatus from "http-status";

export async function signUp(req, res) {
  const { name, email, password, confirmPassword } = req.body;

  await usersService.signUp(name, email, password, confirmPassword);

  return res.status(httpStatus.CREATED).send({ message: 'Signed up succesfully'});
}

export async function signIn(req, res) {
  const { email, password } = req.body;

  const token = await usersService.signIn(email, password);

  return res.status(httpStatus.OK).send(token);
}

export async function getUserInfo(req, res) {
  const token = res.locals.rows[0].token;

  try {
    const user = await db.query(`
      SELECT sessions."userId" AS id, users.name, CAST(SUM("visitCount") AS INT) AS "visitCount"
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
        [user.rows[0].id]
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