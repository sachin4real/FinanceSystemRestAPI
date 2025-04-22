import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, register); // Only logged-in users can create new users (Admins can create admins)
router.post("/login", login);

export default router;
