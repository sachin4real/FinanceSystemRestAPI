import Transaction from "../models/Transaction.model.js";
import mongoose from "mongoose";

export const getFinancialReports = async (req, res) => {
    try {
        // Extract filters from query parameters
        const { startDate, endDate, category, tags } = req.query;

        let filter = { user: req.user.id };

        if (startDate && endDate) {
            // Ensure the dates are valid
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);
            
            if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
                return res.status(400).json({ success: false, message: "Invalid date format" });
            }

            filter.date = { $gte: parsedStartDate, $lte: parsedEndDate };
        }

        if (category) {
            filter.category = category;
        }

        if (tags) {
            const tagsArray = tags.split(',');
            filter.tags = { $in: tagsArray };
        }

        console.log('Debug Filter:', filter); // Added for debugging

        // 🔹 1. Calculate Total Income and Expenses
        const summary = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        console.log('Summary:', summary); // Debugging total income and expenses

        let totalIncome = 0;
        let totalExpenses = 0;

        summary.forEach((item) => {
            if (item._id === "income") {
                totalIncome = item.totalAmount;
            } else if (item._id === "expense") {
                totalExpenses = item.totalAmount;
            }
        });

        // 🔹 2. Spending Trends Over Time (Monthly Breakdown)
        const spendingTrends = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                    totalSpent: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        console.log('Spending Trends:', spendingTrends); // Debugging spending trends

        // 🔹 3. Category-wise Expense Breakdown
        const categoryBreakdown = await Transaction.aggregate([
            { $match: { ...filter, type: "expense" } },
            {
                $group: {
                    _id: "$category",
                    totalSpent: { $sum: "$amount" }
                }
            },
            { $sort: { totalSpent: -1 } } // Highest spending first
        ]);

        console.log('Category Breakdown:', categoryBreakdown); // Debugging category breakdown

        res.status(200).json({
            success: true,
            totalIncome,
            totalExpenses,
            netSavings: totalIncome - totalExpenses,
            spendingTrends,
            categoryBreakdown
        });
    } catch (error) {
        console.error("❌ Error generating financial report:", error.stack); // Improved error logging
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
