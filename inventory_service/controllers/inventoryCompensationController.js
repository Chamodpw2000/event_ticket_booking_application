import { prisma } from "../lib/prismaClient.js";

const parsePositiveInt = (value) => {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		return null;
	}

	return parsed;
};

// Release an inventory hold after payment fails / booking is cancelled.
// This restores EventInventory quantities (available +qty, reserved -qty)
// and transitions the hold from ACTIVE -> RELEASED.
export const releaseInventoryHold = async (req, res) => {
	const holdId = parsePositiveInt(req.params.holdId);

	if (!holdId) {
		return res.status(400).json({ message: "holdId must be a positive integer" });
	}

	try {
		const result = await prisma.$transaction(async (tx) => {
			const hold = await tx.inventoryHold.findUnique({
				where: { id: holdId },
			});

			if (!hold) {
				throw new Error("HOLD_NOT_FOUND");
			}

			if (hold.status !== "ACTIVE") {
				throw new Error("HOLD_NOT_ACTIVE");
			}

			const released = await tx.inventoryHold.updateMany({
				where: { id: holdId, status: "ACTIVE" },
				data: { status: "RELEASED" },
			});

			if (released.count === 0) {
				throw new Error("HOLD_NOT_ACTIVE");
			}

			const inventory = await tx.eventInventory.update({
				where: { id: hold.inventoryId },
				data: {
					availableQuantity: { increment: hold.quantity },
					reservedQuantity: { decrement: hold.quantity },
				},
			});

			const updatedHold = await tx.inventoryHold.findUnique({
				where: { id: holdId },
			});

			return { hold: updatedHold, inventory };
		});

		return res.status(200).json({
			holdId: result.hold.id,
			status: result.hold.status,
			expiresAt: result.hold.expiresAt,
			inventory: {
				id: result.inventory.id,
				eventId: result.inventory.eventId,
				ticketTypeId: result.inventory.ticketTypeId,
				totalQuantity: result.inventory.totalQuantity,
				availableQuantity: result.inventory.availableQuantity,
				reservedQuantity: result.inventory.reservedQuantity,
			},
		});
	} catch (error) {
		if (error.message === "HOLD_NOT_FOUND") {
			return res.status(404).json({ message: "Inventory hold not found" });
		}

		if (error.message === "HOLD_NOT_ACTIVE") {
			return res.status(409).json({ message: "Inventory hold is not ACTIVE" });
		}

		console.error("Failed to release inventory hold", error);
		return res.status(500).json({ message: "Failed to release inventory hold" });
	}
};
