require("dotenv").config();
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
var keys = require("./keys.js");
var fs = require("fs");

var input = "";
var delim = "";

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

function readInputs() {
    // starting at [3], loop through and build the input string when multiple entries for process.argv
    for (i=3; i < process.argv.length; i++) {
        input += delim + process.argv[i];
        delim = "+";
    };
    
    // run the function associated with the proper command 
    switch(command) {
        case "my-tweets":
            twitter();
        break;
        case "spotify-this-song":
            spotifyThisSong();
        break;
        case "movie-this":
            omdb();
        break;
        case "do-what-it-says":
            doWhatItSays();
        break;
        default:
            console.log("Invalid: must enter 'my-tweets', 'spotify-this-song', 'movie-this', or 'do-what-it-says'");
        break;
    };
};

function twitter() {
    // twitter api, for user MarkLech13 and a count to show the last 20 tweets
    client.get('search/tweets', {q: 'MarkLech13', count: 20}, function(err, tweets, response) {
        var tweetDispCount = 20;
        // check for errors or bad status codes
        if (!err && response.statusCode === 200) {
            // loop through and display each tweet
            for (var i=0; i < tweets.statuses.length; i++) {
                console.log("\nTWEET " + tweetDispCount + ": " + tweets.statuses[i].text);
                console.log("CREATED: " + tweets.statuses[i].created_at);
                tweetDispCount--;
            }
        }
        else {
             return console.log("response.statusCode: " + response.statusCode + "\n" + err)
        }
     });
};

function spotifyThisSong() {
    // if no song is entered by the user, populate with The Sign
    if (!input) { 
        input = "THE+SIGN";
    };
    spotify.search({ type: 'track', query: input }, function(err, data) {
        // check for errors
        if (err || data.tracks.items.length == 0) {
            return console.log("Error: " + err);
        }
        //the song title search in this API is NOT very accurate - it often returns multiple (and incorrect) entries - so to fix that, loop through every response and try to match the exact song name:        
        for ( var i = 0; i < data.tracks.items.length; i++) {
            songName = data.tracks.items[i].name.split(' ').join('+');
            songName = songName.toUpperCase();
            input = input.toUpperCase();
            //if the exact song name is matched from the object's name array, use it (and end the loop) - otherwise use the first item returned:
            var songIndex = 0;
            if (songName == input) {
                songIndex = i;
                i = data.tracks.items.length;
            } 
        }
        
        // display all of the song info from spotify api
        console.log("\nArtist: " + data.tracks.items[songIndex].artists[0].name);

        console.log("Song: " + data.tracks.items[songIndex].name); 
        
        //preview_url is often null or missing, so if it is empty, display the external_url instead:
        if (!data.tracks.items[songIndex].preview_url || data.tracks.items[songIndex].preview_url.length==0) {
            console.log("Preview: " + data.tracks.items[songIndex].external_urls.spotify); 
        }
        else {
            console.log("Preview: " + data.tracks.items[songIndex].preview_url);
        } 
        
        console.log("Album: " + data.tracks.items[songIndex].album.name); 
        
    });
};

function omdb() {
    // if no movie is entered by the user, populate with Mr. Nobody
    if (!input) {
        input = "Mr.+Nobody";
    };
    // build omdb url
    var omdbUrl = "http://www.omdbapi.com/?t=" + input + "&y=&plot=short&apikey=trilogy";
    // omdb api
    request(omdbUrl, function(err, response, body) {
        if (!err && response.statusCode === 200) {
            if (JSON.parse(body).Title == null){
                console.log("Error: Movie not found");
            }
            else {
                console.log("Title: " + JSON.parse(body).Title);
                console.log("Year: " + JSON.parse(body).Year);
                console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
                console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
                console.log("Country: " + JSON.parse(body).Country);
                console.log("Language: " + JSON.parse(body).Language);
                console.log("Plot: " + JSON.parse(body).Plot);
                console.log("Actors: " + JSON.parse(body).Actors);
            }
        }
        else {
            console.log("response.statusCode: " + response.statusCode)
            console.log("Error: " + err)
    }
    });
};

function doWhatItSays() {
    // read  <command>,"<input value>"  from random.txt file
    fs.readFile("random.txt", "utf8", function(error, data) {
        // check for errors
        if (error) {
          return console.log(error);
        }
        // split incoming file data by the comma and put in an array
        var dataArr = data.split(",");
        // populate the command
        command = dataArr[0]
        console.log("Command: " + command)
        // populate the input
        input = dataArr[1]
        console.log("Input: " + input)
        // readInputs will check which command it is, and then execute the proper functions
        readInputs();
      });
};

// input [2] is the command that we will use
var command = process.argv[2]
// check the inputs and run the rest of the code
readInputs()