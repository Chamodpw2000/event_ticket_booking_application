import { Router } from "express";
import {
  createInventoryRecord,
} from "../controllers/inventoryController.js";
import {
  createInventoryHold,
  confirmInventoryHoldForBooking,
} from "../controllers/inventoryBookingController.js";
import {
  releaseInventoryHold,
  releaseInventoryHolds,
} from "../controllers/inventoryCompensationController.js";

const inventoryRouter = Router();

// Create an inventory record for an event ticket type.
inventoryRouter.post("/records", createInventoryRecord);

// Create an inventory hold (reserve tickets temporarily).
inventoryRouter.post("/holds", createInventoryHold);

// Confirm an inventory hold after booking/payment succeeds.
inventoryRouter.patch("/holds/:holdId/confirm", confirmInventoryHoldForBooking);

// Release multiple holds in one call.
inventoryRouter.patch("/holds/release", releaseInventoryHolds);

// Release an inventory hold (payment failed / cancel).
inventoryRouter.patch("/holds/:holdId/release", releaseInventoryHold);

export default inventoryRouter;
