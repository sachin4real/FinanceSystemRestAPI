import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0 // Track how much the user has saved so far
    },
    currency: { type: String, default: "USD" },  // Currency for the goal (USD by default)
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String, 
        default: "No description"
    },
    category: {
        type: String, // e.g., "Car", "House", etc.
        required: true
    }
});

export default mongoose.model("Goal", GoalSchema);
