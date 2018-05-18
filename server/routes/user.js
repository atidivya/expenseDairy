var mongoose = require( 'mongoose' );
var User = require('../models/user');
var jwt = require('jsonwebtoken'); 
var config = require('../config');

// sign up function

exports.signup = function (req, res, next) {
    //sign up validations
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    if(! firstname || !lastname || !email || !username || !password) {
        return res.status(422).json({ sucess:false, message:"Posted data is either incorrect or incomplete!"});
    }

    User.findOne({ username: username}, function(err, existingUser){
        if(err){ res.status(400).json({ sucess:false, message: 'Error processing request' + err}); }

        //user already exists
        if(existingUser) {
            return res.status(201).json({
                sucess: false,
                message: 'Username already exists.'
            });
        }

        //if no error, proceed creating the account
        let oUser = new User({
            firstname: firstname,
            lastname: lastname,
            email: email,
            username: username,
            password: password
        });

        oUser.save(function(err, oUser){
            if(err){ res.status(400).json({sucess: false, message: 'Error processing the request' + err}); }

            res.status(201).json({
                sucess: true,
                message: "User created sucessfully, please login to access your account."
            });
        });
    });
}

//login function

exports.login = function(req, res, next){
    //find the user
    User.findOne({ username: req.body.username}, function(err, user){
        if(err){ res.status(400).json({ sucess:false, message: 'Error processing request' + err}); }

        if(!user){
            res.status(201).json({ sucess:false, message: "Incorrect login credentials"});
        } else if(user){
            user.comparePassword(req.body.password, function(err, isMatch){
                if(isMatch && !err){
                    var token = jwt.sign(user, config.secret, {
                        expiresIn: config.tokenexp
                    });

                    //login sucess update last login

                    user.lastlogin = new Date();

                    user.save(function(err){
                        if(err){ res.status(400).json({ sucess:false, message: 'Error processing request' + err}); }

                        res.status(201).json({
                            sucess: true,
                            message: { 'userid': user._id, 'username': user.username, 'firstname': user.firstname, 'lastlogin': user.lastlogin},
                            token: token
                        });
                    });
                } else {
                    res.status(201).json({ sucess: false, message: "Incorrect login credentials"});
                }
            });
        }
    });
}

//authenticate the token

exports.authenticate = function(req, res, next){
    //check header or ul parameters or the post parameters for the token
    var token = req.body.token || req.query.token || req.headers['authorization'];

    if(token){
        jwt.verify(token, config.secret, function(Err, decoded){
            if(err){
                return res.status(201).json({ sucess:false, message: 'Authenticate token expired, please login again', encode: 'exp-token'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(201).json({
            sucess: false,
            message: 'Fatal error, Aithenticate token not available',
            errcode: 'no-token'
        });
    }
}



