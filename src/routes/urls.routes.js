import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { schemaUrl } from "../schemas/url.schemas.js";
import { validateAuth } from "../middlewares/validateAuth.middleware.js";
import { postUrl, getUrlById, deleteUrl, getOpenUrls } from "../controllers/urls.controller.js";

const urlsRouter = Router();

urlsRouter.get("/urls/:id", getUrlById);
urlsRouter.get("/urls/open/:shortUrl", getOpenUrls);

urlsRouter.use(validateAuth);
urlsRouter.post("/urls/shorten", validateSchema(schemaUrl), postUrl);
urlsRouter.delete("/urls/:id", deleteUrl);

export default urlsRouter;