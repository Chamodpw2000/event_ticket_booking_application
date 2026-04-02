import { Router } from "express";
import { createPayment, getPayments } from "../controllers/paymentsController.js";

const paymentsRouter = Router();

paymentsRouter.post("/", createPayment);
paymentsRouter.get("/", getPayments);

export default paymentsRouter;