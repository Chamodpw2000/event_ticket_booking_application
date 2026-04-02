import { Router } from "express";
import { createUser, getUsers, loginUser } from "../controllers/usersController.js";

const usersRouter = Router();

usersRouter.post("/", createUser);
usersRouter.get("/", getUsers);
usersRouter.post("/login", loginUser);

export default usersRouter;
