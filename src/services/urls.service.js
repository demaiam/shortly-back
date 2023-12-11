import { urlsRepository } from "../repositories/urls.repository.js";

import { nanoid } from "nanoid";

async function postUrl(url, userId) {
  const shortUrl = nanoid(url, 8);

  await urlsRepository.postUrl(url, shortUrl, userId);

  const newUrl = urlsRepository.getUrlId(url);

  return {
    id: newUrl.rows[0].id,
    shortUrl: newUrl.rows[0].shortUrl
  };
}

async function getUrlById(urlId) {
  const url = await urlsRepository.getUrlById(urlId);
  if (!url.rowCount) throw notFoundError('Url');

  return {
    id: url.rows[0].id,
    shortUrl: url.rows[0].shortUrl, 
    url: url.rows[0].url
  };
}

async function getOpenUrls(shortUrl) {
  const urls = await urlsRepository.getOpenUrls(shortUrl);
  if (!urls.rowCount) throw notFoundError('Url');

  await urlsRepository.updateVisitCount(urls.rows[0].visitCount, shortUrl);

}

async function deleteUrl(urlId, userId) {
  const url = await urlsRepository.getUrlById(urlId);
  if (!url.rowCount) throw notFoundError('URL');
  if (url.rows[0].userId !== userId) throw unauthorizedError('URL does not belong to this user');

  await urlsRepository.deleteUrl(urlId);
}

export const urlsService = {
  postUrl,
  getUrlById,
  getOpenUrls,
  deleteUrl
}