import { Router } from "express";
import {
  createInventoryRecord,
  createInventoryHold,
} from "../controllers/inventoryController.js";

const inventoryRouter = Router();

// Create an inventory record for an event ticket type.
inventoryRouter.post("/records", createInventoryRecord);

// Create an inventory hold (reserve tickets temporarily).
inventoryRouter.post("/holds", createInventoryHold);

export default inventoryRouter;
