# Finance Tracking System

A comprehensive finance tracking system built with **Node.js**, **Express.js**, and **MongoDB** that allows users to track their transactions, budgets, goals, and view detailed financial reports through an intuitive dashboard interface.

## Features

- **User Authentication** with JWT (JSON Web Token)
- **Transaction Management** with full CRUD operations
- **Budget Planning and Tracking**
- **Financial Goal Setting**
- **Detailed Financial Reports**
- **User Dashboard** with financial visualizations
- **Admin Dashboard** for system oversight

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Configuration**: dotenv for environment variables

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/finance-tracking-system.git
   ```

2. Navigate to the project directory:
   ```
   cd finance-tracking-system
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=mongodb:
   JWT_SECRET=your_secure_jwt_secret_key
   PORT=8000
   NODE_ENV=.env

5. Start the application:
   ```
   npm start
   ```

The server will run on `http://localhost:8000` by default.

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user (admin access only)
- `POST /api/auth/login` - Authenticate user and receive JWT token

### Transaction Endpoints

- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions` - Retrieve all user transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Budget Endpoints

- `POST /api/budgets` - Create a new budget
- `GET /api/budgets` - Get all user budgets
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget
- `GET /api/budgets/recommendations` - Get budget recommendations

### Financial Goal Endpoints

- `POST /api/goals` - Create a new financial goal
- `PUT /api/goals/progress` - Update goal progress
- `GET /api/goals` - Get all user goals

### Report Endpoints

- `GET /api/reports/reports` - Generate financial reports

### Dashboard Endpoints

- `GET /api/dashboard/user` - Get user dashboard data
- `GET /api/dashboard/admin` - Get admin dashboard (admin only)
- `GET /api/dashboard/transactions` - Get dashboard transaction data

## Security

- All routes accessing or modifying user data are protected with JWT authentication
- Admin-specific routes require verification of admin privileges
- Passwords are hashed using bcryptjs before storage

