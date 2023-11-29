const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const authRoute = require('./routes/authRoute');
const mealRoutes = require('./routes/mealRoutes')




const app = express()
dotenv.config()

const PORT = 5000

app.get('/', (req, res) => {
    res.send("Hello, world!")
})

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI, {
    // useNewUrlParser: true, déprécié
    // useUnifiedTopology: true, déprécié

})
    .then(() => console.log("Connecté à la base de données"))
    .catch((err) => console.log(err));

app.use('/auth', authRoute);
app.use('/api', mealRoutes);


app.listen(PORT, () => {
    console.log(`Le serveur a démarré sur le port ${PORT}`)
})