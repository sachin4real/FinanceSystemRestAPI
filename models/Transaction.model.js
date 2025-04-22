import mongoose from "mongoose";
import Goal from "../models/Goal.model.js"; // Goal model for progress tracking

// Define the schema for the transaction
const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },  // Currency for the transaction (USD by default)
    date: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    
    // 🔹 Recurring Transaction Fields
    isRecurring: { type: Boolean, default: false },
    recurrence: {
        frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: null },
        endDate: { type: Date, default: null } // Stop recurrence after this date
    },
    
    // 🔹 Goal Field for Automatic Savings Allocation
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", default: null } // Reference to the goal
});

// 🔹 Pre-save Hook for Validation and Goal Progress Update
transactionSchema.pre("save", async function (next) {
    try {
        // If the transaction is recurring, check the validity of recurrence
        if (this.isRecurring) {
            // Ensure recurrence frequency is set
            if (!this.recurrence.frequency) {
                return next(new Error("Recurrence frequency must be provided for recurring transactions"));
            }

            // If recurrence is enabled, ensure that the endDate is valid
            if (this.recurrence.endDate && this.date > this.recurrence.endDate) {
                return next(new Error("End date must be after the transaction date"));
            }
        }

        // Ensure the transaction date is not in the future
        if (this.date > new Date()) {
            return next(new Error("Transaction date cannot be in the future"));
        }

        // If the transaction is income, automatically allocate savings to the goal
        if (this.type === "income" && this.goalId) {
            const goal = await Goal.findById(this.goalId);
            if (goal) {
                const savingsAmount = calculateSavingsAmount(this.amount); // Calculate savings
                goal.currentAmount += savingsAmount;

                // Ensure currentAmount doesn't exceed the targetAmount
                if (goal.currentAmount > goal.targetAmount) {
                    goal.currentAmount = goal.targetAmount;
                }

                await goal.save(); // Save the updated goal progress
            } else {
                console.error("Goal not found for savings allocation");
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

// 🔹 Virtual field to calculate next transaction date for recurring transactions
transactionSchema.virtual("nextTransactionDate").get(function () {
    if (!this.isRecurring || !this.recurrence.frequency) {
        return null;
    }

    const nextDate = new Date(this.date);
    switch (this.recurrence.frequency) {
        case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        default:
            return null;
    }

    // If there is an end date for the recurrence, ensure it does not exceed that date
    if (this.recurrence.endDate && nextDate > this.recurrence.endDate) {
        return null; // No further transactions after endDate
    }

    return nextDate;
});

// 🔹 Helper Function: Calculate Savings Amount (e.g., 10% of income)
const calculateSavingsAmount = (incomeAmount, savingsPercentage = 10) => {
    // Default savings percentage is 10%. You can pass a different percentage when required.
    return (incomeAmount * savingsPercentage) / 100;
};

// Create the model based on the schema
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
