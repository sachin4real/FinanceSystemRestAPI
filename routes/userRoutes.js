import express from "express";
import { register, login } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Protect the admin routes

const router = express.Router();

// Register route (Only Admin can create Admin accounts)
router.post("/register", protect, admin, register);

// Login route
router.post("/login", login);

export default router;
