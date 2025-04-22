// utils/allocateSavings.js

// Helper function to calculate savings (e.g., 10% of income)
export const calculateSavingsAmount = (incomeAmount, savingsPercentage = 10) => {
    // Ensure the savings percentage is a valid number between 0 and 100
    if (savingsPercentage < 0 || savingsPercentage > 100) {
        throw new Error("Savings percentage must be between 0 and 100");
    }

    // Calculate the savings amount based on the income and percentage
    const savingsAmount = (incomeAmount * savingsPercentage) / 100;

    return savingsAmount;
};
