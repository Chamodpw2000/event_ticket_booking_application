import express from "express";
import "dotenv/config";
import { connectPrisma ,  disconnectPrisma } from "./lib/prismaClient.js";
import ticketsRouter from "./routes/ticketsRoutes.js";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get("/health", (req, res) => {
	res.status(200).json({ service: "ticket_service", status: "ok" });
});

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Ticket Service!" });
});

app.use("/tickets", ticketsRouter);



const startServer = async () => {
	try {
		console.log("Starting ticket_service...");
		await connectPrisma();
		console.log("Database connected");

		app.listen(PORT, () => {
			console.log(`ticket_service running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start ticket_service", error);
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

