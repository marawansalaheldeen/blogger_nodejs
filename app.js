var express = require('express');
var http = require('http');
var mysql = require('mysql');
var expressValidator = require("express-validator");
var session = require('express-session');
var passport = require('passport');

var MySQLStore = require('express-mysql-session')(session);
var LocalStrategy = require('passport-local').Strategy;
var bodyparser = require('body-parser');
var app = express();



app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
var econtrol = require('./controller/control');
//usages

app.use('/js',express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js',express.static(__dirname + '/node_modules/jquery/dist/js'));
app.use('/css',express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(expressValidator());
app.set('view engine','ejs');





var options = {
	host:'Localhost',
	user:'root',
	password:'test',
	database:'mydb',
	port:'3306'
	};
	
var sessionStore = new MySQLStore(options);


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  store	: sessionStore,
  saveUninitialized: true,
  //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(function(username, password, done) {
	
	return done(null,false);
	}
));
//Database connection




 
//defroute
econtrol(app);

 
//creating server 
var server = app.listen(3000,function(){
	console.log('app listening on port 3000....');
})
	





