var express = require ('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var config = requrie('/config');
var user = requrie('/routes/user.js');
var config = requrie('/routes/expense.js');

var port = process.env.port || config.serverport;

mongoose.connect(config.database, function(err){
    if(err){
        console.log("Error connecting DB, please check if MongoDB is running");

    } else {
        console.log("Connected to MongoDB!!!");
    }
});

//body parser to get info from POST and/or URL parameters

app.use(bodyParser.urlencoded({ extended: true}));
app.use(require('body-parser').json({ type: '*/*'}));

//use morgan to log requests to the console

app.use(morgan('dev'));

//enable CORS from the client side

app.use(function(req,res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", 'PUT,GET,POST,DELETE,POST,OPTIONS');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Rquested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

//routes

app.get('/', function(req, res){
    res.send('Expense Dairy API is running at http://localhost:' + port + '/api');
});

app.post('/register', user.signup);

//express routes

var apiRoutes = express.Router();

app.use('/api', apiRoutes);

apiRoutes.post('/login', user.login);

apiRoutes.user(user.authenticate);

//authenticate routes

apiRoutes.get('/', function(req, res){
    res.status(201).json({ message:"Welcome to expense dairy API"});
});






