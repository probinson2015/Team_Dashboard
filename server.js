//path module
var path = require("path");
//require express and create the express app
var express = require("express");
var app = express();



//require  and use bodyParser to handle post data
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of our db in mongodb -- this should match the name of the db you are going to use for your project.

// require mongoose and create the mongoose variable
var mongoose = require('mongoose');
//connect to the server!!
mongoose.connect('mongodb://localhost/Group');

//for one to many relationshipo, create schema from constructor
var Schema = mongoose.Schema;


var GroupSchema = new mongoose.Schema({
	name: String,
	created_at: Date,
	persons: [{type: Schema.Types.ObjectId, ref: 'Person'}]

});



var PersonSchema = new mongoose.Schema({
	_group: {type: Schema.Types.ObjectId, ref: 'Group'},
	name: String,
	created_at: Date
});



//make models from schema
var Group = mongoose.model("Group", GroupSchema);
var Person = mongoose.model("Person", PersonSchema);

//static content
app.use(express.static(path.join(__dirname, "./static")));

//setting up views folder and ejs
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');


//root route to render the index.ejs view
app.get('/', function(req,res){
	//get all messages then pass to view
	Group.find({}, function(err, groups){
		
		res.render("index", {groups: groups});
	})
})

//post route for adding a message
app.post('/add_group', function(req, res){
	console.log("Post data", req.body.name);
	
	// create a new quote with the name and quote corresponding to those from req.body

	var group = new Group({name: req.body.name});

	// try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.

	group.save(function(err){
		//if there is an error console.log something went wrong!
		if (err){
		console.log('there was an error adding group');
			
		} 
		else 
		{ //else console.log that success
			console.log('successfully added post');
			//redirect to the next page or root route
			res.redirect('/');

		}
	})	
});

app.get('/destroy_group/:id', function(req, res){
	// console.log(req.params.id);
	Group.remove({_id:req.params.id}, function(err){
		res.redirect('/')
	})
})

app.get('/destroy_person/:id', function(req, res){
	// console.log(req.params.id);
	Person.remove({_id:req.params.id}, function(err){
		res.redirect('/persons')
	})
})

//get group by id
app.get('/group_by_id/:id', function(req, res){
	Group.find({_id: req.params.id}, function(err, group){
		Person.find({_group: req.params.id}, function(err, persons)
		{
			console.log(persons);
			if(err){
				console.log('error getting group by id');
			}
			else
			{
				res.render('group_by_id', {group: group, persons: persons})
			}
		})
	})
})

//get all persons
app.get('/persons', function(req, res){
	Person.find({}, function(err, persons)
	{
		if(err){
			console.log("couldn't find persons")
		}
		else{

			res.render('persons', {persons: persons});
		}
	})
})

//add person
app.post('/add_person', function(req, res){
	// console.log(req.body.name);
	var person = new Person({name: req.body.name});
	person.save(function(err){
		if(err){
			console.log('error saving person');
		}
		else
		{
			res.redirect('/persons');
		}
	})

})

app.get('/person_by_id/:id', function(req, res){
	// console.log(req.params.id);
	Person.find({_id:req.params.id}, function(err, person){
		Group.find({}, function(err, groups){

			if(err)
			{
				console.log("couldn't find person");
			}
			else
			{
				res.render('person_by_id', {person: person, groups: groups})
			}
		})
	})
})

//add person to group
app.post('/assign_to_group/:id', function(req, res){
	console.log("person:" ,req.params.id);
	console.log("group id:",req.body.group);
	Group.findOne({_id: req.body.group}, function(err, group)
	{
		Person.findOne({_id: req.params.id}, function(err, person)
		{
			// console.log(group);
			person._group = group._id;
			group.persons.push(req.params.id);
			person.save(function(err){
				if (err){
					console.log("couldn't assign person to group");
				}
				group.save(function(err){
					if (err){
						console.log("couldn't save group!");
					}
					else {
						res.redirect('/');
					}
				})
			})
		})
	})

})

app.get('/json', function(req, res){
	Group.find({}, function(err, groups){
		Person.find({}, function(err, persons){
			// console.log(groups, persons)
			res.json({groups:groups, persons: persons})

		})
	})
})

app.get('/unassociate/:id', function(req,res){
	console.log(req.params.id);
	Person.findOne({_id: req.params.id}, function(err, person)
		{
			// console.log(group);
			Person.update({_id: req.params.id}, {$set:{_group: null}}, {new:true}, function(err, record){
				console.log(err)
				console.log(record)
			})

			res.redirect('/');	
		})
})
//tell the express app to listen on port 8000
var server = app.listen(8888, function(){
	console.log("listening on port 8888");
});
