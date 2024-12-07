const validator = require('validator');
const User = require('../model/UserModel.js');
const CustomError = require('../util/CustomError.js');
const asyncErrorHandler = require('../util/asyncErrorHandler.js');
const {
    createToken
} = require('../util/JWT.js');
const {
    comparePassword,
    hashPassword
} = require('../util/bcrypt.js');
const { authenticateUser } = require('../util/raduis.js');


const login = asyncErrorHandler(async (req, res, next) => {
    const {
        identifier,
        password
    } = req.body;
    // Check if the identifier and password are provided
    if (!identifier || !password || 
        validator.isEmpty(identifier.toString()) || validator.isEmpty(password.toString())
    ) {
        return next(new CustomError('Tout les champs doivent être remplis', 400));
    }

    const result = await authenticateUser(identifier, password);    
    if (!result.success) {
        return res.status(401).json(result);
    }
    // Create a token
    //const token = createToken(existingUser.id);
    res.status(200).json(result);
});

const register = asyncErrorHandler(async (req, res, next) => {
    const {
        username,
        fullname,
        password,
    } = req.verifiedData;
    // Check if the required fields are provided
    if (!username || !fullname || !password) {
        return next(new CustomError('Tout les champs doivent être remplis', 400));
    }
    // Check if the user already exists with the same phone number or username
    const existingUser = await User.findOne({
        where: {
            username: username
        }
    });
    if (existingUser) {
        return next(new CustomError('L\'utilisateur existe déjà', 400)); 
    }
    // Hash the password
    const hashedPassword = await hashPassword(password);
    // Create a new user
    const newUser = await User.create({
        username,
        fullname,
        password: hashedPassword,
    });
    if(!newUser){
        return next(new CustomError('Error while creating new user', 500));
    }
    res.status(200).json({
        status: true,
        message: 'Utilisateur créé avec succès'
    });
});


module.exports = {
    login,
    register,
};
