// controllers/mealController.js
const axios = require('axios');

const MEAL_API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

async function getAllMeals() {
    try {
        const response = await axios.get(`${MEAL_API_BASE_URL}/search.php?s=`);
        return response.data.meals;
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les repas :', error.message);
        throw error;
    }
}

async function getMealById(mealId) {
    try {
        const response = await axios.get(`${MEAL_API_BASE_URL}/lookup.php?i=${mealId}`);
        return response.data.meals;
    } catch (error) {
        console.error('Erreur lors de la récupération du repas :', error.message);
        throw error;
    }
}

module.exports = { getMealById, getAllMeals };
