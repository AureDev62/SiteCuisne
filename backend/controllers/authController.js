const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Durée d'expiration du token (une journée)/Token expiration duration (one day)
const expirationDuration = 24 * 60 * 60;
// Fonction qui crée un token JWT en utilisant l'identifiant passé en argument
//Function that creates a JWT token using the provided ID
const createToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: expirationDuration
    });
};

async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: "Nom d'utilisateur incorrect" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Adresse mail invalide" });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Mot de passe incorrect" });
        }

        const trimUserName = username.trim();
        const trimEmail = email.trim();
        const trimPassword = password.trim();

        // Vérification si l'utilisateur existe déjà avec le même username
        const existingUsername = await User.findOne({ username: trimUserName });
        if (existingUsername) {
            console.log('username déjà utilisé');
            return res.status(400).json({ error: 'Un utilisateur avec ce nom d\'utilisateur existe déjà.' });
        }

        // Vérification si l'utilisateur existe déjà avec le même email
        const existingEmail = await User.findOne({ email: trimEmail });
        if (existingEmail) {
            console.log('email déjà utilisé');
            return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(trimPassword, salt);
        const user = new User({
            username: trimUserName,
            email: trimEmail,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        console.log('Utilisateur crée avec succès');
        res.status(200).json(savedUser);
    } catch (err) {
        console.log("Erreur lors de l'enregistrement");

        res.status(500).json({ error: err.message });
    }
};

// async function login(req, res) {
//     const user = await User.findOne({ username: req.body.username });
//     if (!user) return res.status(400).send('Nom d\'utilisateur ou mot de passe incorrect');

//     const validPassword = await bcrypt.compare(req.body.password, user.password);
//     if (!validPassword) return res.status(400).send('Nom d\'utilisateur ou mot de passe incorrect');

//     const token = jwt.sign(
//         { username: user.username, email: user.email, role: user.role },
//         process.env.TOKEN_SECRET
//     );
//     res.header('Authorization', token).send('Connexion réussie');
// }



async function login(req, res) {
    try {
        const { username, password } = req.body;
        // Vérification de la syntaxe de l'adresse e-mail
        //// Check the syntax of the e-mail address
        const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json("Nom d'utilisateur incorrect");
        }
        //on applique la fonction trim pour supprimer les espaces en début et fin de chaînes
        //Trim spaces at the beginning and end strings
        const trimUserName = username.trim()
        const trimPassword = password.trim();

        // Vérification de l'utilisateur s'il existe dans la base de données/Check if the user exists in the database using the username
        const user = await User.findOne({ username: trimUserName });
        if (!user) {
            // Si aucun utilisateur correspondant n'est trouvé, renvoie d'une erreur/If no matching user is found, return an error
            return res.status(400).json("Identifiant incorrect");
        }

        // Vérification si le mot de passe est correct/Check if the password is correct
        const passwordMatch = await bcrypt.compare(trimPassword, user.password);
        if (!passwordMatch) {
            // Si les mots de passe ne correspondent pas, renvoie d'une erreur
            return res.status(400).json("Mot de passe incorrect");
        }
        //mise a jour de la date de dernière connexion/Update the last login date
        user.lastLogin = new Date();
        await user.save();
        // console.log("Utilisateur connecté:", user);

        // Générer un nouveau token pour l'utilisateur authentifié/Generate a new token for the authenticated user
        const generateToken = createToken(user._id);

        // Enregistrement du token dans le local storage/Save the token to the local storage
        res.cookie('token', generateToken, { httpOnly: true, expires: new Date(Date.now() + expirationDuration * 1000) });

        // On renvoie la réponse avec l'utilisateur sans le mot de passe et le token
        //Return the response with the user (without the password) and the token
        const { password: omitPassword, ...userData } = user;
        res.status(200).json({ user: user, token: generateToken });
    } catch (err) {
        // En cas d'erreur lors de la connexion, renvoyer une réponse avec un code d'erreur 500 (Internal Server Error) et l'objet d'erreur
        // In case of an error during login, return a response with the 500 (Internal Server Error) code and the error object
        res.status(500).json(err);
    }
};

module.exports = { register, login };
