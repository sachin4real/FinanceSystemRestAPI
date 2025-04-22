import express from "express";
import { protect } from "../middleware/authMiddleware.js";  // Assuming you have auth middleware for user protection
import {
    createGoal,
    updateGoalProgress,
    getUserGoals
} from "../controllers/goalController.js";

const router = express.Router();

// Create a new financial goal
router.post("/goals", protect, createGoal);

// Update the user's progress towards a goal (by adding savings)
router.patch("/goals/:goalId", protect, updateGoalProgress);

// Get all goals for the logged-in user
router.get("/goals", protect, getUserGoals);

export default router;
