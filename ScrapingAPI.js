/**********************************************/
/**** Scraping API ****************************/
/**********************************************/

var https = require('https');
var assert = require('assert');
var db;
var curColl;

//Information for the REST call
var header = {"X-Apptweak-Key": "QS5NiFFrLERBRML_ptL208cJoWc"};
var options = {
	hostname: "api.apptweak.com",
	port: 443,
	path: "/",
	"rejectUnauthorized": false,
	method:"GET",
	headers: header
};

module.exports = {
	/**
	 * Requesting scraped data from AppTweak. If successful,
	 * it'll drop the old collection of data if any, and then 
	 * insert the new scraped data.
	 */ 
	requestToAppTweak(datapath, database, collection) {
		db = database;
		curColl = collection;
		var date = new Date();
		var time = date.getTime();

		switch(datapath)
		{
			case "/ios/categories/6014/top.json":
				curColl = "IOS_TopFree_" + time; break;
			case "/ios/categories/6014/top.json?type=paid":
				curColl = "IOS_TopPaid_" + time; break;
			case "/ios/categories/6014/top.json?type=grossing":
				curColl = "IOS_TopGrossing_" + time; break;
			case "/android/categories/game/top.json":
				curColl = "Android_TopFree_" + time; break;
			case "/android/categories/game/top.json?type=paid":
				curColl = "Android_TopPaid_" + time; break;
			case "/android/categories/game/top.json?type=grossing":
				curColl = "Android_TopGrossing_" + time; break;
			default:
				return;
		}

		options.path = datapath;
		console.log(options);
		req = https.request(options, function(res) {
			var responseBody =""; 
			console.log("> Response from server started."); 
			console.log(`> Server Status: ${res.statusCode}`); 
			console.log("> Response Headers: %j", res.headers);
			res.setEncoding("UTF-8"); 
			//retrieve the data in chunks
			res.on("data", function(chunk) {
				responseBody += chunk;
			});

			res.on("end", function(){
				//Once completed we parse the data in JSON format
				data = JSON.parse(responseBody);
				//Deleting old records to avoid overlaps
				// db.collection("data").drop();
				//Inserting scraped data 
				insertNewData();
			});
		});
		
		req.on("error", function(err) {
			console.log(`problem with request: ${err.message}`);
		});
		req.end();
	},
	getColl() {
		return curColl;
	}
	
}


function insertNewData() {
	db.collection(curColl).insertMany(data.content, function(err,result) {
		assert.equal(err, null);
	});	
	modifyDataAndUpdate();
}

function modifyDataAndUpdate() {
	db.collection(curColl).find().each(function(err, doc) {
		assert.equal(err, null);
		if(doc != null) {
			if(doc.price == "$0.00") {
				var query = {_id: doc._id};
				var update = {$set : {price: "Free"}};
				db.collection(curColl).update(query, update);
			}
		
			for(var i=0; i < doc.genres.length; i++) { 
				// console.log("genre > ", doc.genres[i]);
				var cat;
				switch(doc.genres[i]) {
					case 0:
						cat = "All"; break;
					case 6000:
						cat = "Business"; break;
					case 6001:
						cat = "Weather"; break;
					case 6002:
						cat = "Utilities"; break;
					case 6003:
						cat = "Travel"; break;
					case 6004:
						cat = "Sports"; break;
					case 6005:
						cat = "Social Networking"; break;
					case 6006:
						cat = "Reference"; break;
					case 6007:
						cat = "Productivity"; break;
					case 6008:
						cat = "Photo & Video"; break;
					case 6009:
						cat = "News"; break;
					case 6010: 
						cat = "Navigation"; break;
					case 6011:
						cat = "Music"; break;
					case 6012:
						cat = "Lifestyle"; break;
					case 6013:
						cat = "Health & Fitness"; break;
					case 6014:
						cat = "Games"; break;
					case 6015:
						cat = "Finance"; break;
					case 6016:
						cat = "Entertainment"; break;
					case 6017:
						cat = "Education"; break;
					case 6018:
						cat = "Books"; break;
					case 6020:
						cat = "Medical"; break;
					case 6021:
						cat = "Newsstand"; break;
					case 6022:
						cat = "Catalogs"; break;
					case 6023:
						cat = "Food & Drink"; break;
					case 7001:
						cat = "Action"; break;
					case 7002:
						cat = "Adventure"; break;
					case 7003:
						cat = "Arcade"; break;
					case 7004:
						cat = "Board"; break;
					case 7005:
						cat = "Card"; break;
					case 7006:
						cat = "Casino"; break;
					case 7007:
						cat = "Dice"; break;
					case 7008:
						cat = "Educational"; break;
					case 7009:
						cat = "Family"; break;
					case 7010:
						cat = "Kids"; break;
					case 7011:
						cat = "Music"; break;
					case 7012:
						cat = "Puzzle"; break;
					case 7013:
						cat = "Racing"; break;
					case 7014:
						cat = "Role Playing"; break;
					case 7015:
						cat = "Simulation"; break;
					case 7016:
						cat = "Sports"; break;
					case 7017:
						cat = "Strategy"; break;
					case 7018:
						cat = "Trivia"; break;
					case 7019:
						cat = "Word"; break;
					default:
						cat = "";
				}
				var genresIndex = "genres."+i;
				var query = {_id: doc._id};
				var update = {$set : {[genresIndex]: cat}};
				db.collection(curColl).update(query, update);
			}
		} 
	});
}
