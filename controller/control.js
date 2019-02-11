var stringify = require('json-stringify');

var bodyparser = require('body-parser');
var dateformat = require('dateformat');
var urlencodedparser = bodyparser.urlencoded({extended:true});
var expressvalidator = require('express-validator');
var passport = require('passport');
var bcrypt = require('bcrypt');
const saltRounds = 10;  //var LocalStrategy = require('passport-local').Strategy;
var now = new Date();



var model = require('../models/dbcon');

var connection = model.connection;
var baseurl = model.baseurl;
var brand = model.brand;
var siteTitle = model.siteTitle;
	
module.exports = function(app){

//Home page
app.get('/',authenticationMiddleware,function(req,res){
		connection.query("SELECT u_name FROM users WHERE u_id = ?",[req.user.u_id],function(err,results){
			var resu = results[0].u_name;
			console.log(resu);
			
			res.render('pages/index',{
			siteTitle : siteTitle,
			pageTitle : brand,
			basurl	  : baseurl,
			username  :	resu
			});
		});			
});
app.get('/blogs',authenticationMiddleware,function(req,res){
			connection.query("SELECT * FROM blogs ",function(err,result){
			res.render('pages/blogs',{
			siteTitle : siteTitle,
			pageTitle : brand,
			basurl	  : baseurl,
			userid    : req.user.u_id,	
			items     : result
			});
    });			
});
app.post('/blogs',urlencodedparser,function(req,res){

		connection.query("SELECT u_name FROM users WHERE u_id = ?",[req.user.u_id],function(err,result){
			var username = result[0].u_name;
		    var b_name = req.body.blog_name;
		    var b_body = req.body.blog_body;
			var sql = {
				B_name:b_name,
				B_body:b_body,
				u_name:username,
				u_id: req.user.u_id
			}
			console.log(sql);
		connection.query("INSERT INTO  blogs SET ? ",sql,function(err,result){
				console.log(result);
				res.redirect(baseurl+"/blogs");
			});
	});
});





//Events
app.get('/Events',authenticationMiddleware,function(req,res){
	connection.query("SELECT * FROM e_events ",function(err,result){				
			res.render('pages/Events',{
			siteTitle : siteTitle,
			pageTitle : brand,
			basurl	  : baseurl,
			userid    : req.user.u_id,	
			items     : result
			});	
	});	
});
app.get('/profil',authenticationMiddleware,function(req,res){
				
			connection.query("SELECT * FROM users WHERE u_id = ?",[req.user.u_id],function(err,result){
			res.render('pages/profile',{
			siteTitle : siteTitle,
			pageTitle : "Swastika",
			basurl	  : baseurl,
			items     : result
			});
			});
});
//app.get('/profil/:userid',function(req,res){
//			console.log("theuserid"+req.params.userid);
//			res.redirect(baseurl+"/loginpage");
//			connection.query("DELETE FROM users WHERE u_id= 57",function(err,result){
//					console.log(result);
//					if(result.affectedRows>0){
//						res.redirect(baseurl+"/loginpage");
//						console.log('account deleted succesffuly');
//					}
//			});
//});
app.get('/profil/MyEvents',function(req,res){
			connection.query("SELECT * FROM e_events WHERE u_id = ? ",[req.user.u_id],function(err,result){				
						connection.query("SELECT * FROM users WHERE u_id = ?",[req.user.u_id],function(err,results){
						res.render('pages/profileve',{
						siteTitle : siteTitle,
						pageTitle : "Swastika",
						basurl	  : baseurl,
						iitems    : results, 
						items     : result
						});
				});
			});
});
app.get('/profil/MyBlogs',function(req,res){
			connection.query("SELECT * FROM blogs WHERE u_id = ? ",[req.user.u_id],function(err,result){				
					connection.query("SELECT * FROM users WHERE u_id = ?",[req.user.u_id],function(err,results){
					res.render('pages/profileblog',{
					siteTitle : siteTitle,
					pageTitle : "Swastika",
					basurl	  : baseurl,
					iitems    : results,
					userid    : req.user.u_id,
					items     : result
					});
				});	
			});
});
//Logining in
app.get('/loginpage/',function(req,res){
		
		req.logout();
		req.session.destroy();
		res.render('pages/login',{
			siteTitle : siteTitle,
			pageTitle : "Swastika",
			basurl	  : baseurl,
			items     : ''
			});
	
});

app.post('/loginpage/',passport.authenticate('local',{	
			successRedirect: '/',
			failureRedirect: '/loginpage'
}));  
	
//Creating new user
app.get('/newuser/',function(req,res){
		res.render('pages/newuser',{
			siteTitle : siteTitle,
			pageTitle : "Swastika",
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
			pageTitle : "Swastika......registration error",
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

//Add-Event
app.get('/event/add/',function(req,res){
			res.render('pages/add-eve',{
			siteTitle : siteTitle,
			pageTitle : "Swastika",
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
				res.redirect(baseurl+"/Events");

		});
});
//Edit-Event
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
//Delete-Event
app.get('/event/delete/:event_id',function(req,res){

		
		connection.query("DELETE FROM e_events WHERE e_id='"+req.params.event_id+"'",function(err,result){
				console.log(result);
				if(result.affectedRows){
						res.redirect(baseurl+"/Events");
					}
				
			});
});
//Authentication
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
