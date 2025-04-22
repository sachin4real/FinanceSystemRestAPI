import express from 'express';
import { getFinancialReports } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🟢 1️⃣ Route to get financial reports
router.get('/reports', protect, getFinancialReports);

export default router;
