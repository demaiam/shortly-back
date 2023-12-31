import { Router } from "express";
import { validateSchema } from "../middlewares/validate.schema.middleware.js";
import { schemaSignIn, schemaSignUp } from "../schemas/user.schemas.js";
import { validateAuth } from "../middlewares/validate.auth.middleware.js";
import { signIn, signUp, getUserInfo, getRanking } from "../controllers/users.controller.js";

const userRouter = Router();

userRouter.post("/signup", validateSchema(schemaSignUp), signUp);
userRouter.post("/signin", validateSchema(schemaSignIn), signIn);
userRouter.get("/ranking", getRanking);

userRouter.get("/users/me", validateAuth, getUserInfo);

export default userRouter;