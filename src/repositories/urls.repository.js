import { db } from "../database/database.connection.js";

async function postUrl(url, shortUrl, userId) {
  return await db.query(`
    INSERT INTO urls ("userId", url, "shortUrl")
    VALUES ($1, $2, $3);`,
    [userId, url, shortUrl]
  );
}

async function getUrlId(url) {
  return await db.query(`
    SELECT * FROM urls
    WHERE url=$1;`,
    [url]
  );
}

async function getUrlById(id) {
  return await db.query(`
    SELECT * FROM urls WHERE id=$1;`,
    [id]
  );
}

async function getOpenUrls(shortUrl) {
  return await db.query(`
    SELECT * FROM urls
    WHERE "shortUrl"=$1;`,
    [shortUrl]
  );
}

async function updateVisitCount(visitCount, shortUrl) {
  return await db.query(`
    UPDATE urls
    SET "visitCount"=$1
    WHERE "shortUrl"=$2;`,
    [visitCount + 1, shortUrl]
  );
}

async function deleteUrl(urlId) {
  return await db.query(`
    DELETE from urls WHERE id=$1;`,
    [urlId]
  );
}

async function getUrlData(userId) {
  const result = await db.query(`
    SELECT urls.id, urls.url, urls."shortUrl", urls."visitCount"
    FROM urls
    WHERE urls."userId"=$1;`,
    [userId]
  );
  return result;
}

export const urlsRepository = {
  postUrl,
  getUrlId,
  getUrlById,
  getOpenUrls,
  updateVisitCount,
  deleteUrl,
  getUrlData
}