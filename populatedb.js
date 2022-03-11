#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var User = require('./models/user')
var Message = require('./models/message')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = []
var messages = []

function userCreate(first_name, last_name, email, member_status, cb) {
    var userdetail = {
        firstName: first_name,
        lastName: last_name,
        email: email,
        memberStatus: member_status
    }; 

    var user = new User(userdetail);
       
    user.save(function (err) {
        if (err) {
        cb(err, null);
        return;
        }
        console.log('New User: ' + user);
        users.push(user)
        cb(null, user);
    }   );
}

function messageCreate(title, timestamp, text, user, cb) {
  var messagedetail = { 
    title: title,
    timestamp: timestamp,
    text: text,
    user: user
  }
    
  var message = new Message(messagedetail);  
    
  message.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Message: ' + message);
    messages.push(message)
    cb(null, message)
  }  );
}


function createUsers(cb) {
    async.series([
        function(callback) {
          userCreate('Patrick', 'Rothfuss', '123@gmail.com', 'No', callback);
        },
        function(callback) {
          userCreate('James', 'Brothel', 'brothellova1@gmail.com', 'Yes', callback);
        },
        function(callback) {
          userCreate('CEO', 'Entrepreneur', 'jeffreybezos@gmail.com', 'Yes', callback);
        },
        function(callback) {
          userCreate('Homeless', 'Man', 'emailbutnohome@gmail.com', 'No', callback);
        },
        function(callback) {
          userCreate('Vinsopn', 'The Great', 'owner@gmail.com', 'Yes', callback);
        },
        function(callback) {
          userCreate('Patrick', 'Sissy', '12345@gmail.com', 'Yes', callback);
        },
        ],
        // optional callback
        cb);
}


function createMessages(cb) {
    async.parallel([
        function(callback) {
          messageCreate('The Name of the Wind (The Kingkiller Chronicle, #1)', '1973-06-06', 'I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.', users[0], callback);
        },
        function(callback) {
          messageCreate("The Wise Man's Fear (The Kingkiller Chronicle, #2)", '1975-06-13', 'Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.', users[3], callback);
        },
        function(callback) {
          messageCreate("The Slow Regard of Silent Things (Kingkiller Chronicle)", '1999-06-06', 'Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.', users[2], callback);
        },
        function(callback) {
          messageCreate("Apes and Angels", '2001-09-20', "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...", users[3], callback);
        },
        function(callback) {
          messageCreate("Death Wave", '2016-01-01', "In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...", users[1], callback);
        },
        function(callback) {
          messageCreate('Test Book 1', '2020-03-13', 'Summary of test book 1', users[2], callback);
        },
        function(callback) {
          messageCreate('Test Book 2', '2021-03-02', 'Summary of test book 2', users[0], callback)
        }
        ],
        // optional callback
        cb);
}



async.series([
	createUsers,
	createMessages
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('DONE AND DONE');
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
