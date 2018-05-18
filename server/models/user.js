var mongoose = require( 'mongoose' );
var bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    firstname: {type:String},
    lastname: {type:String},
    email: {type:String},
    username: {type:String},
    password: {type:String},
    lastlogin: {type:Date},
});

// to save user's hash password to database

UserSchema.pre('save', function(next){
    const users = this;
    SALT_FACTOR = 5;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});


// method to compare password for login

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if(err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('users', UserSchema, 'users');

