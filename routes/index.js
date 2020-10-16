var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
require('dotenv').config();
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");
const googleTrends = require('google-trends-api');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

/* GET home page. */
router.get('/', function (req, res, next) {
  let trendingTopicsArray = new Array(16);
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
        trendingTopicsArray[topicsArrayCount] = trends.storySummaries.trendingStories[i].entityNames[0];
        //console.log(trends.storySummaries.trendingStories[i].entityNames[0])
        //console.log(trendingTopicsArray[topicsArrayCount]);
        //console.log(topicsArrayCount);
        topicsArrayCount++;
      }

      res.render('index', { title: 'Tweet Sentiment Analysis', trendingTopicsArray });
    }
  });

});

router.get('/twitter', function (req, res) {
  const query = req.query;
  const searchQuery = query['search'];
  console.log(process.env.TWITTER_ACCESS_TOKEN_KEY);
  client.get('search/tweets', { q: query['search'], lang: 'en', count: '100', result_type: "mixed" }, function (error, tweets, response) {
    const tweetsCount = tweets.statuses.length;
    let positiveTweets = 0;
    let negativeTweets = 0;
    let neutralTweets = 0;
    let positiveTweetsArray = new Array(2);
    let neutralTweetsArray = new Array(2);
    let negativeTweetsArray = new Array(2);
    let positiveArrayCount = 0;
    let neutralArrayCount = 0;
    let negativeArrayCount = 0;

    for (var i = 0; i < tweets.statuses.length; i++) {
      //console.log(tweets.statuses[i].text);

      var wordsArray = tweets.statuses[i].text.split(" ");
      sentimentScore = analyzer.getSentiment(wordsArray);

      //console.log(sentimentScore);

      if (sentimentScore > 0) {
        positiveTweets = positiveTweets + 1;
        positiveArrayCount++;
        if (positiveArrayCount < 4) {
          positiveTweetsArray[positiveArrayCount] = tweets.statuses[i].text;
        }
      }
      else if (sentimentScore === 0) {
        neutralTweets = neutralTweets + 1;
        neutralArrayCount++;
        if (neutralArrayCount < 4) {
          neutralTweetsArray[neutralArrayCount] = tweets.statuses[i].text;
        }
      }
      else {
        negativeTweets = negativeTweets + 1;
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

    res.render('sentimentAnalysis', {
      positiveTweetsPercentage, neutralTweetsPercentage, negativeTweetsPercentage, searchQuery,
      tweetsCount, positiveTweetsArray, neutralTweetsArray, negativeTweetsArray
    });
  });


});

module.exports = router;
