import { handleApplicationErrors } from "./middlewares/error.handling.middleware.js";
import router from "./routes/index.routes.js";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use(handleApplicationErrors);
dotenv.config();

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});