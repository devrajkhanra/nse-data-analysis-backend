import express, { Request, Response } from "express";
import dotenv from "dotenv";

import nifty50Router from "./src/routes/nifty50";
import indiceRouter from "./src/routes/indice";
import stockRouter from "./src/routes/stock";
import optionRouter from "./src/routes/option"; // Added option router import
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
// Enable CORS for all origins (easiest for local dev)
app.use(cors());
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Express TypeScript API!" });
});

// Mount routers
app.use("/api", nifty50Router);
app.use("/api", indiceRouter);
app.use("/api", stockRouter);
app.use("/api", optionRouter); // Mount option router here

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
