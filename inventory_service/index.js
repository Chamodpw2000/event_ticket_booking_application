import express from "express";
import "dotenv/config";
import { connectPrisma ,  disconnectPrisma } from "./lib/prismaClient.js";

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());

app.get("/health", (req, res) => {
	res.status(200).json({ service: "inventory_service", status: "ok" });
});

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Inventory Service!" });
});







const startServer = async () => {
	try {
		console.log("Starting inventory_service...");
		await connectPrisma();
        console.log("Database connected");

		app.listen(PORT, () => {
			console.log(`inventory_service running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start inventory_service", error);
		process.exit(1);
	}
};

startServer();
const shutdown = async () => {
    await disconnectPrisma();
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

