import Transaction from "../models/Transaction.model.js";
import Goal from "../models/Goal.model.js";
import { calculateSavingsAmount } from "../utils/allocateSavings.js";  // Import the helper function from utils

// Create a new transaction (income or expense)
export const createTransaction = async (req, res) => {
    try {
        const { type, category, amount, date, tags, isRecurring, recurrence, goalId } = req.body;

        // Validate required fields
        if (!type || !category || !amount || !date) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Create and save the transaction
        const transaction = new Transaction({
            user: req.user.id,
            type,
            category,
            amount,
            date,
            tags,
            isRecurring,
            recurrence: isRecurring ? recurrence : null,
            goalId,  // Store the goalId in the transaction
        });

        await transaction.save();
        console.log(`✅ Transaction created: ${category}, Amount: ${amount}`);

        // If the transaction is income and a goal is set, allocate savings to the goal
        if (type === "income" && goalId) {
            const goal = await Goal.findById(goalId);
            if (goal) {
                // Calculate the savings to be allocated
                const savingsAmount = calculateSavingsAmount(amount); // Call the helper function to calculate savings
                await updateGoalProgress(goalId, savingsAmount);  // Update the goal progress with savings
            } else {
                console.error("Goal not found for savings allocation");
            }
        }

        res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            transaction
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Helper function to update the goal progress
const updateGoalProgress = async (goalId, savingsAmount) => {
    try {
        const goal = await Goal.findById(goalId);
        if (!goal) {
            console.error("Goal not found for savings allocation");
            return;
        }

        // Add the savings to the goal's currentAmount
        goal.currentAmount += savingsAmount;

        // Ensure that the currentAmount does not exceed the targetAmount
        if (goal.currentAmount > goal.targetAmount) {
            goal.currentAmount = goal.targetAmount;
        }

        await goal.save();
        console.log(`✅ Goal progress updated: Goal ID: ${goalId}, Saved: ${savingsAmount}`);
    } catch (err) {
        console.error("❌ Error updating goal progress:", err);
    }
};

// Get all transactions for the logged-in user
export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get a single transaction by ID
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        // Ensure the transaction belongs to the logged-in user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        res.status(200).json({ success: true, transaction });
    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update a transaction (recalculate budget, etc.)
export const updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const oldCategory = transaction.category;
        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Recalculate the budget or handle related logic here (if necessary)

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            transaction
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete a transaction (and update the budget if necessary)
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const category = transaction.category;
        await transaction.deleteOne();

        console.log(`❌ Transaction deleted: Category: ${category}, Amount: ${transaction.amount}`);

        // Optionally, update the budget or handle any related logic here

        res.status(200).json({ success: true, message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
