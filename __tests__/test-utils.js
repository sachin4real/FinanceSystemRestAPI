import mongoose from "mongoose";
import User from "../models/User.model.js";

// This function will connect to a mock in-memory database
export const connectDB = async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testDB");
};

// Disconnect from the database after tests
export const disconnectDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
};

// Mocking a user to simulate register and login tests
export const createMockUser = async (userData) => {
    const user = new User(userData);
    await user.save();
    return user;
};
