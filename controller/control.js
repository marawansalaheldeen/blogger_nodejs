var stringify = require('json-stringify');
var mysql = require('mysql');
var bodyparser = require('body-parser');
var dateformat = require('dateformat');
var urlencodedparser = bodyparser.urlencoded({extended:true});
var expressvalidator = require('express-validator');
var passport = require('passport');
var bcrypt = require('bcrypt');
const saltRounds = 10;  //var LocalStrategy = require('passport-local').Strategy;
var now = new Date();



const siteTitle = "Event APP";
const baseurl = "http://localhost:3000";
const connection = mysql.createConnection({
	host:'Localhost',
	user:'root',
	password:'test',
	database:'mydb',
	port:'3306'
	});

module.exports.connection;

module.exports = function(app){
//routes

app.get('/',authenticationMiddleware,function(req,res){

		connection.query("SELECT * FROM e_events ",function(err,result){
			
			
			
			connection.query("SELECT u_id FROM e_events ",function(err,results){
				var eveuid = results;
				var userrid = req.user.u_id;
				console.log(eveuid)	;
				console.log(userrid)	;
			
			res.render('pages/index',{
			siteTitle : siteTitle,
			pageTitle : "Event-list",
			basurl	  : baseurl,
			eveuid	  : eveuid,
			userrid   : userrid,
			items     : result
			});
		});
	});		
});
app.get('/profile',authenticationMiddleware,function(req,res){
			
			connection.query("SELECT * FROM e_events WHERE u_id = ?",[req.user.u_id],function(err,result){
			res.render('pages/profile',{
			siteTitle : siteTitle,
			pageTitle : "Event-list",
			basurl	  : baseurl,
			items     : result
			});
			});
});
app.get('/loginpage/',function(req,res){
		req.logout();
		req.session.destroy();
		res.render('pages/login',{
			siteTitle : siteTitle,
			pageTitle : "Eventus",
			basurl	  : baseurl,
			items     : ''
			});
	
});
app.post('/loginpage/',passport.authenticate('local', {
	 successRedirect: '/profile',	
	 failureRedirect: '/loginpage'
	}));  

app.get('/newuser/',function(req,res){
		res.render('pages/newuser',{
			siteTitle : siteTitle,
			pageTitle : "Eventus",
			basurl	  : baseurl,
			items     : ''
			
			});
});

app.post('/newuser/',urlencodedparser,function(req,res){
					
		req.checkBody('u_name','Username field cannot be empty').notEmpty();
		req.checkBody('u_name','Username must be 4-20 charactar long').len(4,20);
		req.checkBody('u_email','The email you entered is invalid,try again').isEmail();
		req.checkBody('u_email','Email must be between 4-100 charactars long').len(4,100);
		req.checkBody('u_pass','password must be more than 8 charactar').len(8,100);
		req.checkBody('u_pass','password must include one lowercase charactar,one uppercase charactar,number,sympol').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
		req.checkBody('c_pass', 'Password must be between 8-100 characters long.').len(8, 100);
		req.checkBody('c_pass', 'Passwords do not match, please try again.').equals(req.body.u_pass);
		
		
		
		const errors = req.validationErrors();
		if(errors){
			console.log(errors);
			var error = stringify(errors);
			console.log(error);
			
			res.render('pages/newuser',{
			siteTitle : siteTitle,
			pageTitle : "Eventus......registration error",
			basurl	  : baseurl,
			items	  : errors
		
			});
		}else{
		var name = req.body.u_name;
		var email = req.body.u_email;
		var password = req.body.u_pass;
		

			bcrypt.hash(password,saltRounds,function(err,hash){
				var sql = {
						u_name:name,
						u_email:email,
						u_pass:hash
					}
				connection.query("INSERT INTO users SET ? ",sql,function(err,result){
					console.log(result);
						connection.query('SELECT LAST_INSERT_ID() as u_id',function(err,result){
							if(err) throw err;
							console.log(result[0]);
							let user_id = result[0];
							req.login(user_id,function(err){
								res.redirect(baseurl);
							 });	
						});
				});
						
					
			});
		};
});	

//crud	
app.get('/event/add/',function(req,res){
			res.render('pages/add-eve',{
			siteTitle : siteTitle,
			pageTitle : "Event-list",
			basurl	  : baseurl,
			items     : ''
			});
	});
	
app.post('/event/add/',urlencodedparser,function(req,res){
		var name = req.body.e_name;
		var startdate = dateformat(req.body.e_start_date,"yyyy-mm-dd");
		var enddate = dateformat(req.body.e_end_date,"yyyy-mm-dd");
		var desc = req.body.e_desc;
		var loc = req.body.location;
		console.log(name,startdate,enddate,desc,loc);
				
		var sql = {
				e_name:name,
				e_start_date:startdate,
				e_end_date:enddate,
				e_desc:desc,
				location:loc,
				u_id: req.user.u_id
			}
		connection.query("INSERT INTO e_events SET ? ",sql,function(err,result){
				console.log(result);
				res.redirect(baseurl);

		});
});

app.get('/event/edit/:event_id',function(req,res){
	connection.query("SELECT * FROM e_events WHERE e_id='"+req.params.event_id+"'",function(err,result){
		result[0].e_start_date = dateformat(result[0].e_start_date,"yyyy-mm-dd");
		result[0].e_end_date = dateformat(result[0].e_end_date,"yyyy-mm-dd");
		res.render('pages/edit-eve',{
				siteTitle:siteTitle,
				pageTitle:"Editing event : "+result[0].e_name,
				basurl:baseurl,
				item:result,
				dt_s:result[0].e_start_date,
				dt_e:result[0].e_end_date,
			});
		});
});
app.post('/event/edit/:event_id',urlencodedparser,function(req,res){
		var name = req.body.e_name;
		var startdate = dateformat(req.body.e_start_date,"yyyy-mm-dd");
		var enddate = dateformat(req.body.e_end_date,"yyyy-mm-dd");
		var desc = req.body.e_desc;
		var loc = req.body.location;
		console.log(name,startdate,enddate,desc,loc);
				
		var sql = {
				e_name:name,
				e_start_date:startdate,
				e_end_date:enddate,
				e_desc:desc,
				location:loc
			}
		connection.query("UPDATE e_events SET ? WHERE e_id='"+req.params.event_id+"'",sql,function(err,result){
				console.log(result);
				res.redirect(baseurl);

		});
	
	
	});

app.get('/event/delete/:event_id',function(req,res){

		
		connection.query("DELETE FROM e_events WHERE e_id='"+req.params.event_id+"'",function(err,result){
				if(result.affectedRows){
						res.redirect(baseurl)
					}
				
			});
});

passport.serializeUser(function art(user,done){
			var userid = user.u_id;
			console.log(userid);
			done(null,user);	

});

passport.deserializeUser(function(user,done){
	done(null,user);
});

function authenticationMiddleware(req,res,next){
			if(req.isAuthenticated()){
					
					next();
			}else{
					res.redirect('/loginpage');
					
			}; 	
	};	
};
