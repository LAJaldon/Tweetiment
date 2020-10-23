var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
require('dotenv').config();
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");
const googleTrends = require('google-trends-api');
const redis = require('redis');
const AWS = require('aws-sdk');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


// This section will change for Cloud Services
const redisClient = redis.createClient();

// Cloud Services Set-up
// Create unique bucket name
const bucketName = 'luigijaldon-wikipedia-store';

// For cloud Server
const redisClient = redis.createClient({
  host: 'n10000381-001.km2jzi.0001.apse2.cache.amazonaws.com',
  port: 6379
});

// redisClient.on('error', (err) => {
//   console.log("Error" + err);
// });

function getTweets(tweets, searchQuery) {
  const tweetsCount = tweets.statuses.length;
  let positiveTweets = 0;
  let negativeTweets = 0;
  let neutralTweets = 0;
  let positiveTweetsArray = [];
  let neutralTweetsArray = [];
  let negativeTweetsArray = [];
  let positiveArrayCount = 0;
  let neutralArrayCount = 0;
  let negativeArrayCount = 0;

  for (var i = 0; i < tweets.statuses.length; i++) {
    //console.log(tweets.statuses[i].text);
    //console.log(tweets.statuses[i]);

    var wordsArray = tweets.statuses[i].text.split(" ");
    sentimentScore = analyzer.getSentiment(wordsArray);

    //console.log(sentimentScore);

    if (sentimentScore > 0) {
      positiveTweets++;
      positiveArrayCount++;
      if (positiveArrayCount < 4) {
        positiveTweetsArray[positiveArrayCount] = tweets.statuses[i].text;
      }
    }
    else if (sentimentScore === 0) {
      neutralTweets++;
      neutralArrayCount++;
      if (neutralArrayCount < 4) {
        neutralTweetsArray[neutralArrayCount] = tweets.statuses[i].text;
      }
    }
    else {
      negativeTweets++;
      negativeArrayCount++;
      if (negativeArrayCount < 4) {
        negativeTweetsArray[negativeArrayCount] = tweets.statuses[i].text;
      }
    }
  }

  //console.log("Positive tweets: " + positiveTweets);
  //console.log("Neutral tweets " + neutralTweets);
  //console.log("Negative tweets " + negativeTweets);

  const positiveCalculation = (positiveTweets / tweetsCount) * 100;
  const neutralCalculation = (neutralTweets / tweetsCount) * 100;
  const negativeCalulation = (negativeTweets / tweetsCount) * 100;
  const positiveTweetsPercentage = positiveCalculation.toFixed(2);
  const neutralTweetsPercentage = neutralCalculation.toFixed(2);
  const negativeTweetsPercentage = negativeCalulation.toFixed(2);

  return {
    positiveTweetsPercentage, neutralTweetsPercentage, negativeTweetsPercentage,
    tweetsCount, positiveTweetsArray, neutralTweetsArray, negativeTweetsArray, searchQuery
  };

}

/* GET home page. */
router.get('/', function (req, res, next) {
  let trendingTopicsArray = [];
  let topicsArrayCount = 0;

  googleTrends.realTimeTrends({
    geo: 'AU',
    category: 'all',
  }, function (err, results) {
    if (err) {
      res.render('error');
    } else {
      const trends = JSON.parse(results);

      for (var i = 0; i < trends.storySummaries.trendingStories.length; i++) {
        for (var j = 0; j < trends.storySummaries.trendingStories[i].entityNames.length; j++) {
          trendingTopicsArray[topicsArrayCount] = trends.storySummaries.trendingStories[i].entityNames[j];
          //console.log(trends.storySummaries.trendingStories[i].entityNames[0])
          //console.log(trendingTopicsArray[topicsArrayCount]);
          //console.log(topicsArrayCount);
          topicsArrayCount++;
        }
      }

      res.render('index', { title: 'TWEETIMENT', trendingTopicsArray });
    }
  });

});

router.get('/twitter', function (req, res) {
  const query = req.query;
  const searchQuery = query['search'];

  const queryKey = `twitter:${searchQuery}`;

  //Check S3
  const params = { Bucket: bucketName, Key: queryKey };


  return redisClient.get(queryKey, (err, result) => {
    if (result) {
      const resultJSON = JSON.parse(result);
      //console.log('resultJSON is ' + resultJSON);
      console.log('data retrieved from redis');

      const values = getTweets(resultJSON, searchQuery)

      res.render('sentimentAnalysis', {
        ...values
      });
    }
    else {
      return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
        if (result) {
          //Serve from S3
          console.log("data retrieved from s3 bucket");
          const resultJSON = JSON.parse(result.Body);
          var values = getTweets(resultJSON, searchQuery);

          redisClient.setex(queryKey, 3600, JSON.stringify({ source: 'Redis Cache', ...resultJSON, }));

          res.render('sentimentAnalysis', {
            ...values
          });
        }
        else {
          client.get('search/tweets', { q: query['search'], lang: 'en', count: '100', result_type: "mixed" }, function (error, tweets, response) {
            var values = getTweets(tweets, searchQuery);
            const responseJSON = tweets;
            const body = JSON.stringify({ source: 'S3 Bucket', ...responseJSON });
            //console.log('response JSON is ' + responseJSON);
            const objectParams = { Bucket: bucketName, Key: queryKey, Body: body };
            const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
            uploadPromise.then(function (data) {
              console.log("Successfully uploaded data to " + bucketName + "/" + queryKey)
            });
            redisClient.setex(queryKey, 3600, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }));

            res.render('sentimentAnalysis', {
              ...values
            });
          });
        }
      })
    }
  });
});


module.exports = router;
