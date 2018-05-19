import { last } from 'rxjs/operator/last';

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
        return res.status(422).json({ success:false, message:"Posted data is either incorrect or incomplete!"});
    }

    User.findOne({ username: username}, function(err, existingUser){
        if(err){ res.status(400).json({ success:false, message: 'Error processing request' + err}); }

        //user already exists
        if(existingUser) {
            return res.status(201).json({
                success: false,
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
            if(err){ res.status(400).json({success: false, message: 'Error processing the request' + err}); }

            res.status(201).json({
                success: true,
                message: "User created sucessfully, please login to access your account."
            });
        });
    });
}

//login function

exports.login = function(req, res, next){
    //find the user
    User.findOne({ username: req.body.username}, function(err, user){
        if(err){ res.status(400).json({ success:false, message: 'Error processing request' + err}); }

        if(!user){
            res.status(201).json({ success:false, message: "Incorrect login credentials"});
        } else if(user){
            user.comparePassword(req.body.password, function(err, isMatch){
                if(isMatch && !err){
                    var token = jwt.sign(user, config.secret, {
                        expiresIn: config.tokenexp
                    });

                    //login sucess update last login

                    user.lastlogin = new Date();

                    user.save(function(err){
                        if(err){ res.status(400).json({ success:false, message: 'Error processing request' + err}); }

                        res.status(201).json({
                            success: true,
                            message: { 'userid': user._id, 'username': user.username, 'firstname': user.firstname, 'lastlogin': user.lastlogin},
                            token: token
                        });
                    });
                } else {
                    res.status(201).json({ success: false, message: "Incorrect login credentials"});
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
                return res.status(201).json({ success:false, message: 'Authenticate token expired, please login again', encode: 'exp-token'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(201).json({
            success: false,
            message: 'Fatal error, Authenticate token not available',
            errcode: 'no-token'
        });
    }
}

// get user details

exports.getuserDetails = function(req, res, next){
    User.find({_id:req.params.id}).exect(function(err, user){
        if(err){ res.status(400).json({ success:false, message: 'Error processing request' + err}); }
        
        res.status(201).json({
            success: true,
            data:user
        });
    });
}

//udpate users

exports.updateUser = function(req, res, next){
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const userid = req.params.id;

    if(! firstname || !lastname || !email || !userid){
        return res.status(422).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    } else {
        User.findById(userid).exec(function(err, user){
            if(err){ res.status(400).json({ success:false, message: 'Error processing request' + err}); }

            if(user){
                user.firstname = firstname;
                user.lastname = lastname;
                user.email = email;
            }

            user.save(function(err){
                if(err){ res.status(400).json({ success:false, message: 'Error processing request' + err}); }
                res.status(201).json({
                    success: true,
                    message: 'User details updated sucessfully!'
                });  
            });
        });
    }
}

//update password

exports.updatePassword = function(req, res, next){
    const userid = req.params.id;
    const oldpassword = req.body.oldpassword;
    const password = req.body.password;

    if(!oldpassword || !password || !userid){
        return res.status(422).json({ success:false, message: 'Posted data is not correct or incompleted.'});
    } else {
        User.findOne({ _id:userid}, function(err, user){
            if(err){ res.status(400).json({ success:false, message: 'Error processing request' + err}); }
            if(user){
                user.comparePassword(oldpassword, function(err, isMatch){
                    if(isMatch && !err){
                        user.password = password;

                        user.save(function(err){
                            if(err){ res.status(400).json({ success:false, message: 'Error processing request' + err}); }
                            res.status(201).json({
                                success: true,
                                message: 'Password updated sucessfully!'
                            });
                        });
                    } else {
                       res.status(201).json({ success: false, message: 'Incorrect old password.'});
                    }
                });
            }
        });
    }
}


