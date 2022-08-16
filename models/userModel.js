const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//Structure of our User 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please tell us your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        // select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    }
});

userSchema.pre('save', async function (next) {
    //only run this function if password field was actually modified
    if (!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the passwordConfrim field from DB user document
    this.passwordConfirm = undefined;
    next();
});


// instance method which will be available on all documents on a certain collection.
// the goal of this function is to return true or false. TRUE (if password is correct) and FALSE (if password incorrect)
// userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//     //since we have password select to false this.password will not work and we will do this instead : 
//     return await bcrypt.compare(candidatePassword, userPassword)
// }
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// User model
const User = mongoose.model('User', userSchema);


module.exports = User;
