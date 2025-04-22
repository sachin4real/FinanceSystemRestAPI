import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
} from "../controllers/transactionController.js";

const router = express.Router();

// Create a new transaction
router.post("/", protect, createTransaction);

//  Get all transactions for the logged-in user
router.get("/", protect, getTransactions);

//  Get a single transaction by ID
router.get("/:id", protect, getTransactionById);

//  Update a transaction
router.put("/:id", protect, updateTransaction);

// Delete a transaction
router.delete("/:id", protect, deleteTransaction);

export default router;
