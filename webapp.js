var express = require('express');
var mongodb = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var assert = require('assert'); // Unit Testing
var passwordHash = require('password-hash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var schedule = require('node-schedule');
var Scraping = require('./ScrapingAPI');

var app = express();
var app_port = 3000;
var db_url = 'mongodb://localhost/appdb';
var db;
var data; // JSON data fetch from AppTweak
var req; // HTTPS request for AppTweak
var curColl = ""; // Current used collection
var sched; // Schedule/frequency of fetching data

app.use(bodyParser.json());
app.use(express.static('static'));
app.use(session({
	secret: 'K33p1tS3cr3t',
	//cookie: { maxAge: 2628000000 },
	store: new MongoStore({
		url: db_url,
		collection: 'mySessions',
	}),
	resave: false,
	saveUninitialized: true
}));



/**********************************************/
/**** Scraping API ****************************/
/**********************************************/

//Route to display the information on the table -> filtering is work in progress
app.get('/api/bugs', function(req,res){
	// console.log("Query string", req.query);
	var filter = {};
	if(req.query.title)
		filter.title = {"$in": [new RegExp(req.query.title,"i")]};
	if(req.query.developer)
		filter.developer = {"$in" : [new RegExp(req.query.developer,"i")]};

	db.collection(curColl).find(filter).toArray(function(err,docs) {
		res.json(docs); 
	});
});

//POST request from demo -> Not in use currently
app.post('/api/bugs/', function(req, res) {
	console.log("Req body:", req.body);
	var newBug = req.body;
	newBug.id = bugData.length + 1;
	bugData.push(newBug);
	res.json(newBug);
});

function requestAPI() {
	// For every minute: '*/1 * * * *'
	// Scheduled a minute apart to prevent race conditions
	/* sched = schedule.scheduleJob('1 0 * * *', function() {
		requestToAppTweak("/ios/categories/6014/top.json");
	});
	sched = schedule.scheduleJob('2 0 * * *', function() {
		requestToAppTweak("/ios/categories/6014/top.json?type=paid");
	});
	sched = schedule.scheduleJob('3 0 * * *', function() {
		requestToAppTweak("/ios/categories/6014/top.json?type=grossing");
	});
	sched = schedule.scheduleJob('4 0 * * *', function() {
		requestToAppTweak("/android/categories/game/top.json");
	});
	sched = schedule.scheduleJob('5 0 * * *', function() {
		requestToAppTweak("/android/categories/game/top.json?type=paid");
	});
	sched = schedule.scheduleJob('6 0 * * *', function() {
		requestToAppTweak("/android/categories/game/top.json?type=grossing");
	}); */
	
	// Use these for testing only.git 
	Scraping.requestToAppTweak("/ios/categories/6014/top.json", db, curColl);
	// requestToAppTweak("/ios/categories/6014/top.json?type=paid");
	// requestToAppTweak("/ios/categories/6014/top.json?type=grossing");
	// requestToAppTweak("/android/categories/game/top.json");
	// requestToAppTweak("/android/categories/game/top.json?type=paid");
	// requestToAppTweak("/android/categories/game/top.json?type=grossing");
	
	curColl = Scraping.getColl();
	console.log(">>>>>>This is curColl = ", curColl);
}


/**********************************************/
/**** Login Authentication ********************/
/**********************************************/

// Sends back the user's role from the session
app.post('/api/getRole', function(req, res) {
	res.json({"role": req.session.role});
});

// Inserts a user into the "users" collection db
// user: username, password, role
// @param {req} form.username, form.password
app.post('/api/signup/', function(req, res) {
	var username = { "username" : req.body.username };
	var newUser = {
		"username" : req.body.username,
		"password" : passwordHash.generate(req.body.password),
		"role" : "user"
	}; 
	// Checking if there's duplicate username
	db.collection("users").find(username).next(function(err, doc) {
		assert.equal(null, err);
		if(doc == null) { // Valid user
			// Inserting the user into the database
			db.collection("users").insertOne(newUser, function(err, doc) {
				assert.equal(null, err);
				res.json(newUser);
			});
		} else { // null => found duplicate
			res.json(null);
		}
	});
	
});

// Checks if the username and password is in the database and logs the user in 
// if its in the database.
// @param {req} form.username, form.password
app.post('/api/login/', function(req, res) {
	var username = req.body.username;
	var username_query = { "username" : username};
	
	db.collection("users").find(username_query).next(function(err, doc) {
		assert.equal(null, err);
		if(doc != null && passwordHash.verify(req.body.password, doc.password)) {
			req.session.username = doc.username;
			req.session.role = doc.role;
			res.json(doc);
		} else {
			res.json(null); // No username found or password does not match
		}
		
	});
});

// Logs out the logged user and destroys the session
app.post('/api/logout',function(req,res){
	req.session.destroy();
	res.end();
});

// Relogs an user that hasn't logout and it's in the session
app.post('/api/relog', function(req, res) {
	var session = {
		"username": req.session.username,
		"role": req.session.role
	};
	if(req.session.username != null) {
		res.json(session);
	} else {
		res.json(null);
	}	
});



/**********************************************/
/**** Admin Content ***************************/
/**********************************************/

app.get('/api/users', function(req,res){
	// console.log("Query string", req.query);
	var filter = {};
	if(req.query.username)
		filter.username = req.query.username;

	db.collection("users").find(filter).toArray(function(err,docs) {
		res.json(docs); 
	});
});

app.post('/api/switchRole', function(req, res) {
	var query = {};
	query.username = req.body.username;
	
	var update = {$set : {role: req.body.role}};
	db.collection("users").update(query, update);
	res.end();
});



/**********************************************/
/**** Server **********************************/
/**********************************************/
	
// Connecting to the database
mongodb.connect(db_url, function(err, dbConnection) {
	assert.equal(null, err);
	db = dbConnection;	
	requestAPI();
	
	var server = app.listen(app_port, function() {
		console.log('> Application listening on port ' + app_port + '!');
	});
});
