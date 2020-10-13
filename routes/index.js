var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
require('dotenv').config();
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");

var client = new Twitter({
  consumer_key: 'knQr4ZDXfO6gMQUjPc1249l2Q',
  consumer_secret: '0z7kf3sfAwo71nK9BuSbOzakRRkvoZP3Ax9ib0VmORbeYDEasn',
  access_token_key: '1309335867861823488-w4rSthuWv7ARhCg1Tmxu12OrenHp7t',
  access_token_secret: '0zQ002iyBIjs3lkbNvtoopz3qEOW9y8J0GecS9Aq3uDrx'
});

/*
  TWITTER_CONSUMER_KEY = knQr4ZDXfO6gMQUjPc1249l2Q;
  TWITTER_CONSUMER_SECRET =  0z7kf3sfAwo71nK9BuSbOzakRRkvoZP3Ax9ib0VmORbeYDEasn;
  TWITTER_ACCESS_TOKEN_KEY =  1309335867861823488-w4rSthuWv7ARhCg1Tmxu12OrenHp7t;
  TWITTER_ACCESS_TOKEN_SECRET = 0zQ002iyBIjs3lkbNvtoopz3qEOW9y8J0GecS9Aq3uDrx; 

  consumer_key: 'knQr4ZDXfO6gMQUjPc1249l2Q',
  consumer_secret: '0z7kf3sfAwo71nK9BuSbOzakRRkvoZP3Ax9ib0VmORbeYDEasn',
  access_token_key: '1309335867861823488-w4rSthuWv7ARhCg1Tmxu12OrenHp7t',
  access_token_secret: '0zQ002iyBIjs3lkbNvtoopz3qEOW9y8J0GecS9Aq3uDrx'
*/

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/twitter', function (req, res) {
  const query = req.query;
  //let positiveTweets = 0;
  //let negativeTweets = 0;
  //let neutralTweets = 0;

  /*client.stream('statuses/filter', { track: query['search'], language: 'en' }, function (stream) {
    stream.on('data', function (tweet) {
      console.log(tweet.text);
      var wordsArray = tweet.text.split(" ");
      sentimentScore = analyzer.getSentiment(wordsArray);
      console.log(sentimentScore);
      if (sentimentScore > 0) {
        positiveTweets = positiveTweets + 1;
      }
      else if (sentimentScore === 0) {
        neutralTweets = neutralTweets + 1;
      }
      else {
        negativeTweets = negativeTweets + 1;
      }
      res.render('sentimentAnalysis', { positiveTweets, neutralTweets, negativeTweets });
    });

    stream.on('error', function (error) {
      console.log(error);
    });
  });
  */



  client.get('search/tweets', { q: query['search'], lang: 'en', count: '100' }, function (error, tweets, response) {
    for (var i = 0; i < tweets.statuses.length; i++) {
      console.log(tweets.statuses[i].text);
    }

    let positiveTweets = 0;
    let negativeTweets = 0;
    let neutralTweets = 0;

    for (var i = 0; i < tweets.statuses.length; i++) {
      console.log(tweets.statuses[i].text);
      var wordsArray = tweets.statuses[i].text.split(" ");
      sentimentScore = analyzer.getSentiment(wordsArray);
      console.log(sentimentScore);
      if (sentimentScore > 0) {
        positiveTweets = positiveTweets + 1;
      }
      else if (sentimentScore === 0) {
        neutralTweets = neutralTweets + 1;
      }
      else {
        negativeTweets = negativeTweets + 1;
      }
    }

    console.log("Positive tweets: " + positiveTweets);
    console.log("Neutral tweets " + neutralTweets);
    console.log("Negative tweets " + negativeTweets);

    res.render('sentimentAnalysis', { positiveTweets, neutralTweets, negativeTweets });
  });


});

module.exports = router;
