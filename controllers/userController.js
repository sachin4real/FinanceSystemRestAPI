import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Helper function to generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User (Only Admins can create Admin accounts)
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        if (role === "admin" && req.user?.role !== "admin") {
            return res.status(403).json({ message: "Only admins can create admin accounts" });
        }

        const user = await User.create({ name, email, password, role: role || "user" });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Login User
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.matchPassword(password); // Use the method to compare passwords
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
