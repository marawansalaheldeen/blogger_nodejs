var mysql = require('mysql');



const siteTitle = "Swastika";
const brand = "Swastika";
const baseurl = "http://localhost:8000";

const connection = mysql.createConnection({
	host:'Localhost',
	user:'root',
	password:'test',
	database:'mydb',
	port:'3306'
});

var options = {
	host:'Localhost',
	user:'root',
	password:'test',
	database:'mydb',
	port:'3306'
	};
module.exports = {
	siteTitle:siteTitle,	
	brand:brand,
	baseurl:baseurl,
	options:options,
	connection:connection
}


