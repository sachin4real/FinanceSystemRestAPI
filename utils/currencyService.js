import axios from 'axios';

// API to fetch real-time exchange rates
const API_KEY = "8bcbc18d3fc9918b8f891007";  // Replace with your actual API key
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

// Get exchange rates for a given base currency
const getExchangeRates = async (baseCurrency = "USD") => {
    try {
        const response = await axios.get(`${BASE_URL}${baseCurrency}`);
        return response.data.conversion_rates; // Returns exchange rates for the base currency
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        throw new Error("Failed to fetch exchange rates");
    }
};

// Convert an amount from one currency to another
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    const rates = await getExchangeRates(fromCurrency);
    const exchangeRate = rates[toCurrency];
    if (!exchangeRate) {
        throw new Error(`Unable to find exchange rate for ${fromCurrency} to ${toCurrency}`);
    }
    return amount * exchangeRate; // Convert the amount to the target currency
};

export { convertCurrency, getExchangeRates };
