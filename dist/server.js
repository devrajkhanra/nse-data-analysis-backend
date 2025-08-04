"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const nifty50_1 = __importDefault(require("./src/routes/nifty50"));
const indice_1 = __importDefault(require("./src/routes/indice"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
// Basic route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Express TypeScript API!" });
});
// Mount the nifty50 router
app.use("/api", nifty50_1.default);
app.use("/api", indice_1.default);
// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
