import Budget from "../models/Budget.model.js";
import Transaction from "../models/Transaction.model.js";
import mongoose from "mongoose";

// 🟢 1️⃣ Create a new budget
export const createBudget = async (req, res) => {
    try {
        const { category, amount, startDate, endDate, alerts, threshold } = req.body;

        if (!category || !amount || !startDate || !endDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const budget = new Budget({
            user: req.user.id,
            category,
            amount,
            startDate,
            endDate,
            alerts,
            threshold
        });

        await budget.save();
        res.status(201).json({ success: true, message: "Budget created successfully", budget });
    } catch (error) {
        console.error("❌ Error creating budget:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 🟢 2️⃣ Get all budgets with spending details
export const getBudgets = async (req, res) => {
    try {
        let budgets = await Budget.find({ user: req.user.id });

        for (let budget of budgets) {
            const spent = await Transaction.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(req.user.id),
                        category: budget.category,
                        date: { $gte: new Date(budget.startDate), $lte: new Date(budget.endDate) }
                    }
                },
                { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
            ]);

            const spentAmount = spent.length ? spent[0].totalSpent : 0;
            budget.spentAmount = spentAmount; // ✅ Update spentAmount in memory
            await budget.save(); // ✅ Save updated spentAmount in the database

            if (budget.alerts && budget.spentAmount >= budget.amount) {
                console.log(`🚨 Alert: Budget exceeded for ${budget.category}`);
            }
        }

        res.status(200).json({ success: true, budgets });
    } catch (error) {
        console.error("❌ Error retrieving budgets:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 🟢 3️⃣ Update a budget
export const updateBudget = async (req, res) => {
    try {
        let budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: "Budget not found" });

        if (budget.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: "Budget updated", budget });
    } catch (error) {
        console.error("❌ Error updating budget:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 🟢 4️⃣ Delete a budget
export const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: "Budget not found" });

        if (budget.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await budget.deleteOne();
        res.json({ success: true, message: "Budget deleted" });
    } catch (error) {
        console.error("❌ Error deleting budget:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 🟢 5️⃣ Get Budget Recommendations
export const getBudgetRecommendations = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });

        let recommendations = [];

        for (let budget of budgets) {
            // 🔹 Get Total Spending in the Current Month
            const spent = await Transaction.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(req.user.id),
                        category: budget.category,
                        date: { $gte: new Date(budget.startDate), $lte: new Date(budget.endDate) }
                    }
                },
                { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
            ]);

            const spentAmount = spent.length ? spent[0].totalSpent : 0;
            const remaining = budget.amount - spentAmount;

            // 🔹 Analyze Spending Trend (Last 3 Months)
            const pastSpending = await Transaction.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(req.user.id),
                        category: budget.category,
                        date: { 
                            $gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) // Last 3 months
                        }
                    }
                },
                { 
                    $group: { 
                        _id: { $month: "$date" },
                        monthlySpent: { $sum: "$amount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Calculate the **average spending trend** over the last 3 months
            const totalSpentPastMonths = pastSpending.reduce((sum, month) => sum + month.monthlySpent, 0);
            const averageMonthlySpending = totalSpentPastMonths / (pastSpending.length || 1); // Avoid division by zero

            // 🔹 Provide Smart Recommendations Based on Trends
            if (spentAmount >= budget.amount) {
                recommendations.push({
                    category: budget.category,
                    suggestion: `⚠️ Reduce spending! You have exceeded your ${budget.category} budget by $${spentAmount - budget.amount}. Consider increasing it.`
                });
            } else if (remaining < budget.amount * 0.2) {
                recommendations.push({
                    category: budget.category,
                    suggestion: `🔹 Warning! Only $${remaining} left in your ${budget.category} budget.`
                });
            } else if (spentAmount > averageMonthlySpending) {
                recommendations.push({
                    category: budget.category,
                    suggestion: `⚠️ Your spending on ${budget.category} is increasing! You spent $${spentAmount} this month, compared to an average of $${averageMonthlySpending.toFixed(2)} in the last 3 months. Consider adjusting your budget.`
                });
            } else {
                recommendations.push({
                    category: budget.category,
                    suggestion: `✅ You are on track with your ${budget.category} budget. Your average monthly spending trend is stable.`
                });
            }
        }

        res.status(200).json({ success: true, recommendations });
    } catch (error) {
        console.error("❌ Error generating recommendations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

