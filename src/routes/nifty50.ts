import { Router } from "express";
import { readAndEnsureDataDirectory } from "../utils/directoryHelper";
import { readNifty50List } from "../utils/nifty50Reader";

const router = Router();

router.get("/nifty50", async (req, res) => {
  try {
    await readAndEnsureDataDirectory(); // Ensure directory and nifty50list.csv exist
    const stocks = await readNifty50List();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
