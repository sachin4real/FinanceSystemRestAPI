
import Transaction from "../models/Transaction.model.js";
import Goal from '../models/Goal.model.js';

// Create a new financial goal
export const createGoal = async (req, res) => {
    try {
        const { targetAmount, startDate, endDate, category, description } = req.body;

        if (!targetAmount || !startDate || !endDate || !category) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const newGoal = new Goal({
            user: req.user.id,
            targetAmount,
            startDate,
            endDate,
            category,
            description,
        });

        await newGoal.save();
        res.status(201).json({ success: true, goal: newGoal });
    } catch (error) {
        console.error("❌ Error creating goal:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update user's progress towards a goal (by adding savings)
export const updateGoalProgress = async (req, res) => {
    try {
        const { goalId, savingsAmount } = req.body;
        if (!goalId || !savingsAmount) {
            return res.status(400).json({ success: false, message: "Please provide goalId and savingsAmount" });
        }

        const goal = await Goal.findById(goalId);
        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }

        // Update current savings towards the goal
        goal.currentAmount += savingsAmount;
        if (goal.currentAmount > goal.targetAmount) {
            goal.currentAmount = goal.targetAmount; // Cap the savings to the target amount
        }

        await goal.save();

        res.status(200).json({
            success: true,
            message: "Goal progress updated",
            goal,
        });
    } catch (error) {
        console.error("❌ Error updating goal progress:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all goals for the logged-in user
export const getUserGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id });
        res.status(200).json({ success: true, goals });
    } catch (error) {
        console.error("❌ Error fetching goals:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
