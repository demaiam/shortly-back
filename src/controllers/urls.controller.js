import { urlsService } from "../services/urls.service.js";
import httpStatus from "http-status";

export async function postUrl(req, res) {
  const { url } = req.body;
  const session = res.locals;

  const newUrl = await urlsService.postUrl(url, session.rows[0].userId);

  return res.status(httpStatus.CREATED).send(newUrl)
}

export async function getUrlById(req, res) {
  const { id } = req.params;

  const url = await urlsService.getUrlById(id);

  return res.status(httpStatus.OK).send(url);
}

export async function getOpenUrls(req, res) {
  const { shortUrl } = req.params;

  const url = await urlsService.getOpenUrls(shortUrl);

  return res.status(httpStatus.OK).redirect(url.rows[0].shortUrl);
}

export async function deleteUrl(req, res) {
  const { id } = req.params;
  const session = res.locals;

  await urlsService.deleteUrl(id, session.rows[0].userId);

  return res.status(httpStatus.NO_CONTENT).send({ message: "Deleted succesfully" });
}