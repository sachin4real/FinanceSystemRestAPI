import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reportRouter from './routes/reportRoutes.js'; 
import goalRoutes from './routes/goalRoutes.js'




dotenv.config();
connectDB();

const app = express();
app.use(express.json());


app.use("/api/auth", authRoutes);

app.use('/api', reportRouter); 

app.use('/api',goalRoutes);


app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);


app.get("/", (req, res) => res.send("API is running..."));

export default app;
