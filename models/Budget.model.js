import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 }, // Track spending
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    alerts: { type: Boolean, default: true },
    threshold: { type: Number, default: 80 }, // Alerts at 80% usage
    currency: { type: String, default: "USD" }  // Currency for the budget (USD by default)
});

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
