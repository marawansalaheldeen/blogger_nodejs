var express = require('express');
var http = require('http');
var expressValidator = require("express-validator");
var session = require('express-session');
var passport = require('passport');
var stringify = require('json-stringify');
var MySQLStore = require('express-mysql-session')(session);
var LocalStrategy = require('passport-local').Strategy;
var bodyparser = require('body-parser');
var bcrypt = require('bcrypt');
var flash = require('connect-flash');
var app = express();

var con = require('./models/dbcon');
var connection = con.connection;
var options = con.options;

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
var econtrol = require('./controller/control');
//usages

app.use('/js',express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js',express.static(__dirname + '/node_modules/jquery/dist/js'));
app.use('/css',express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(expressValidator());
app.use(flash());
app.set('view engine','ejs');




	
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
	console.log(username);
	console.log(password);	
	connection.query("SELECT u_id,u_pass FROM users WHERE u_name = ? ",[username],function(err,results){
		console.log(results);
		if(err) {
			 return done(err);
			};
		if(results.length === 0){
			return done(null,false);
			};
			
		const hash = results[0].u_pass;
		var uid = results[0].u_id;
		
		console.log(hash);
		bcrypt.compare(password,hash,function(err,response){
			if(response === true){
					return done(null,{u_id:results[0].u_id});
			}else{
					return done(null,false);
			}
		});
		
	});
  }
));

 

// Starting server
// Starting server
econtrol(app);
var server = app.listen(3000,function(){
	console.log('app listening on port 3000....');
})
	





