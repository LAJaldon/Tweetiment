var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
require('dotenv').config();

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
  client.stream('statuses/filter', { track: 'twitter', language: 'en' }, function (stream) {
    stream.on('data', function (tweet) {
      console.log(tweet.text);
    });

    stream.on('error', function (error) {
      console.log(error);
    });
  });


  /*client.get('search/tweets', { q: 'lebron', lang: 'en' }, function (error, tweets, response) {
    console.log(tweets);
  });
  */
});

module.exports = router;
