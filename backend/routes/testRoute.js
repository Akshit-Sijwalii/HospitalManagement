import express from "express";
import { bookTest, getAllTests, cancelTest, getTestsByPatientId  } from "../controllers/testController.js";

const router = express.Router();

router.post("/book", bookTest);
router.get("/all", getAllTests);
router.delete("/cancel/:id", cancelTest);
router.get("/test/:id", getTestsByPatientId);


export default router;
