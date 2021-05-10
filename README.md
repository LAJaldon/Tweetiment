# Tweetiment

This application uses the Google Trends API to retrieve the current trends/topics in Australia, and the Twitter API is used to retrieve a maxiumum of 100 recent tweets of a searched topic.
The general language facility Natural is then used to perform sentiment analysis on the retrieved tweets. A pdf which displays the user guide is attached in this repository.
Additionally, this application uses AWS ElasticCache to manage short-term data storage of all the tweets, AWS S3 bucket to store tweets for a longer period, AWS load balancer to make routing decisions,
and an AWS auto scaling group that allows the application to scale out or scale in.
