import { db } from "../database/database.connection.js";
import { nanoid } from "nanoid";

export async function postUrl(req, res) {
  const { url } = req.body;
  const session = res.locals; 

  const shortUrl = nanoid(8);

  try {
    await db.query(`INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3);`, [session.rows[0].userId, url, shortUrl]);
    
    const newUrl = await db.query(`SELECT * FROM urls WHERE url=$1;`, [url]);

    res.status(201).send({ id: newUrl.rows[0].id, shortUrl: newUrl.rows[0].shortUrl });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getUrlById(req, res) {
  const { id } = req.params;

  try {
    const url = await db.query(`SELECT * FROM urls WHERE id=$1;` [id]);
    if (!url.rowCount) return res.status(404).send({ message: "Url does not exist" });

    res.status(200).send({ id: url.rows[0].id, shortUrl: url.rows[0].shortUrl, url: url.rows[0].url });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function getOpenUrls(req, res) {
  const { shortUrl } = req.params;

  try {
    const url = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1;`, [shortUrl]);
    if (!url.rowCount) return res.status(404).send({ message: "Url does not exist" });

    await db.query(`UPDATE urls SET "visitCount"=$1 WHERE "shortUrl"=$2;`, [url.rows[0].visitCount + 1, shortUrl]);

    res.status(200).send({ message: "Updated url succesfully" }).redirect(url.rows[0].shortUrl);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function deleteUrl(req, res) {
  const { id } = req.params;
  const user = res.locals.user;

  try {
    const url = await db.query(`SELECT * FROM urls WHERE id=$1;`, [id]);
    if (!url.rowCount) return res.status(404).send("URL does not exist");
    if (url.rows[0].userId !== user) return res.status(401).send({ message: "URL does not belong to this user" });

    await db.query("DELETE from urls WHERE id=$1;", [id]);

    res.status(204).send({ message: "Deleted succesfully" });
  } catch (err) {
    res.status(500).send(err.message);
  }
}