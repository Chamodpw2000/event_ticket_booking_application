import express from "express";
import "dotenv/config";
import { connectPrisma ,  disconnectPrisma } from "./lib/prismaClient.js";
import artistsRouter from "./routes/artistsRoutes.js";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get("/health", (req, res) => {
	res.status(200).json({ service: "artist_service", status: "ok" });
});

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Artist Service!" });
});

app.use("/artists", artistsRouter);


const startServer = async () => {
	try {
		console.log("Starting artist_service...");
            await connectPrisma();
		console.log("Database connected");

		app.listen(PORT, () => {
			console.log(`artist_service running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start artist_service", error);
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

