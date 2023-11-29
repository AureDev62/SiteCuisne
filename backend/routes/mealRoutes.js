const express = require('express');
const mealController = require('../controllers/mealControllers');

const router = express.Router();

router.get('/meals/:mealId', async (req, res) => {
    const { mealId } = req.params;

    try {
        const meal = await mealController.getMealById(mealId);
        res.json({ meal });
    } catch (error) {
        res.status(500).json({ erreur: 'Erreur interne du serveur' });
    }
});

router.get('/meals', async (req, res) => {
    try {
        const allMeals = await mealController.getAllMeals();
        res.json({ allMeals });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
