require("dotenv").config();
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
var keys = require("./keys.js");

var input = "";
var delim = "";

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);
// console.log("client=" + JSON.stringify(client));

// console.log("keys.twitter.consumer_key=" + keys.twitter.consumer_key)

// input [2] is the command that we will use
var command = process.argv[2]



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
    default:
        console.log("Error: must enter 'my-tweets', 'spotify-this-song', 'movie-this', or 'xxxx'");
    break;
}

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
    // starting at [3], loop through and build the input string when multiple entries for process.argv
    for (i=3; i < process.argv.length; i++) {
        input += delim + process.argv[i];
        delim = " ";
    };
    if (input.length == 0) { 
        input = "the sign ace of base";
    };
    spotify.search({ type: 'track', query: input, limit: 1 }, function(err, data) {
        
        if (err) {
            return console.log(err);
        }
            // console.log(data.tracks.items[0].artists); 
            console.log("Artist: " + data.tracks.items[0].artists[0].name); 
            console.log("Song: " + data.tracks.items[0].name); 
            console.log("Preview: " + data.tracks.items[0].external_urls.spotify); 
            console.log("Album: " + data.tracks.items[0].album.name); 

        });
};


function omdb() {
    // starting at [3], loop through and build the input string when multiple entries for process.argv
    for (i=3; i < process.argv.length; i++) {
        input += delim + process.argv[i];
        delim = "+";
    };
    if (input.length == 0) {
        input = "Mr.+Nobody";
    };
    // build omdb url
    var omdbUrl = "http://www.omdbapi.com/?t=" + input + "&y=&plot=short&apikey=trilogy";
    // omdb api
    request(omdbUrl, function(err, response, body) {
        if (!err && response.statusCode === 200) {
        console.log("Title: " + JSON.parse(body).Title);
        console.log("Year: " + JSON.parse(body).Year);
        console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
        console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
        console.log("Country: " + JSON.parse(body).Country);
        console.log("Language: " + JSON.parse(body).Language);
        console.log("Plot: " + JSON.parse(body).Plot);
        console.log("Actors: " + JSON.parse(body).Actors);
        }
        else {
            console.log("response.statusCode: " + response.statusCode)
            console.log(err)
    }
    });
};