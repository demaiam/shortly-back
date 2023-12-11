import { Router } from "express";
import { validateSchema } from "../middlewares/validate.schema.middleware.js";
import { schemaUrl } from "../schemas/url.schemas.js";
import { validateAuth } from "../middlewares/validate.auth.middleware.js";
import { postUrl, getUrlById, deleteUrl, getOpenUrls } from "../controllers/urls.controller.js";

const urlsRouter = Router();

urlsRouter.get("/urls/:id", getUrlById);
urlsRouter.get("/urls/open/:shortUrl", getOpenUrls);

urlsRouter.post("/urls/shorten", validateAuth, validateSchema(schemaUrl), postUrl);
urlsRouter.delete("/urls/:id", validateAuth, deleteUrl);

export default urlsRouter;