# jakeshape-public

This repo is not comprehensive. It provides a general understanding of how jakeshape.com works. The actual repo for the site is private.

This site would not be possible without www.openpowerlifting.org. Make sure to check out the website.

Last Updated: 9/28/2023

### Tools

#### Meet Scout
##### [Check Meet Scout Cache](/backend/api/checkMeetScoutCache.py)
##### [Get Meet Scouting Report](/backend/api/getMeetScoutingReport.py)
##### [Edit Meet Scouting Report](/backend/api/editMeetScoutingReport.py)

![image](https://github.com/jschwartz55/jakeshape-public/assets/78443999/5ce6f1a4-1f77-48db-b949-ed901a0e02b6)

When a meet ID is inputted into the Meet Scout page, checkMeetScoutCache is called to check if the meet has been requested in the past 2 weeks. If so, it returns the cached meet scouting report. If not, the Sagemaker prediction endpoints are warmed. getMeetScoutingReport is called and a request is made to liftingcast.com. If the meet ID exists, the data is processed to get information on each lifter. Then, the open powerlifting database is queried for the matching lifter name. If the lifter is found, predictions are made for the upcoming meet. If the lifter is not found, they will be included in the table but must have the open powerlifting ID entered manually. If the open powerlifting ID is entered, editMeetScoutingReport is called and checks for the matching lifter ID in the open powerlifting database. If found, the predictions are returned for that lifter. Once a valid meet has been requested, the scouting report will be stored in a cache for two weeks to prevent liftingcast.com from being bombarded with requests.

checkMeetScoutCache is a separate function from getMeetScoutingReport because CloudWatch has a hard limit of 30 seconds per request. The Sagemaker serverless endpoints take about 10 seconds to warm up. With larger meets, it can take up to 30 seconds to process, even longer. Therefore, warming up the endpoint and processing all athletes in the meet had a high chance of timing out in one API call. 

The lambda function will continue running in the background if a timeout occurs. An error message will appear telling the user to try again. The lambda function has a timeout of 180 seconds so if the meet is processed in that time, it will be cached. When the user attempts to get the report again, hopefully, the lambda function will be finished processing and they will get the cached data. The timeouts would not be an issue if the Sagemaker endpoints had provisioned compute. However, that is a lot more expensive :).

#### Performance Predictor
##### [Get Performance Prediction](/backend/api/getPerformancePrediction.py)

![image](https://github.com/jschwartz55/jakeshape-public/assets/78443999/004c5629-37ac-4dc0-af12-2c9d125ff557)

When a request is made to get a prediction, getPerformancePrediction is called. The predictions are made by an XGBoost model. You can see details in the /backend/predictionModels folder. getPerformancePrediction checks the open powerlifting database for the open powerlifting ID. If found, all previous meets for that lifter are retrieved. Some feature engineering is performed and sent to the Sagemaker prediction endpoints. The predictions are then returned.

#### Power Percentiles
##### [Get Power Percentiles](/backend/api/getPowerPercentiles.py)

![image](https://github.com/jschwartz55/jakeshape-public/assets/78443999/f48cf8a5-e89c-44b5-babd-754346cd4e5c)

When a request is made to get a power percentile, a parquet file is read from s3 which contains all of the lifting results from Open Powerlifting. I initially wanted to store the data in DynamoDB. However, I would need to scan every entry in the database which is an expensive operation. Instead, the parquet format can save all the relevant data in under 20MB. Loading this much data is not too expensive and pretty fast. The longest a prediction takes is about 10 seconds with this method. Once we have all the data, we can filter, sort, and return the percentile of each lift.

### Games
#### Weight Whiz
##### [Get Weight Whiz Leaderboards](/backend/api/getWeightWhizLeaderboards.py)

![image](https://github.com/jschwartz55/jakeshape-public/assets/78443999/f0d320a1-3fbe-45d9-bb83-810a33c21d78)

Weight Whiz retrieves the leaderboards for each game mode upon page load. A database stores the top 10 scores for each game mode. When a score is submitted, it is compared against the current leaderboards. The logic for the game is randomized on the front end. 

### Data Updates
##### [Get Open Powerlifting Data](/backend/dataUpdates/getOpenPowerliftingData.py)
##### [Import Open Powerlifting Data To DynamoDB](/backend/dataUpdates/importOpenPowerliftingDataToDynamoDB.py)
##### [Cleanup Open Powerlifting Data](/backend/dataUpdates/cleanupOpenPowerliftingData.py)

![image](https://github.com/jschwartz55/jakeshape-public/assets/78443999/357271a2-7b8d-4ea3-a4cb-ed1fa790f1a6)

Every month cloud formation triggers the getOpenPowerliftingData function. getOpenPowerliftingData retrieves the CSV file from openpowerlifing.org containing all data on Open Powerlifting. The file is processed and stored as an open-powerlifting.csv file in an s3 bucket. The file is also modified and saved as a parquet file for the Performance Predictor tool. The creation of a new file triggers the importOpenPowerliftingDataToDynamoDB function. This will trigger DynamoDB to transform the open-powerlifting.csv to a DynamoDB table. ImportOpenPowerliftingDataToDynamoDB will then activate an EventBridge scheduler which will trigger 20 minutes later (enough time for the CSV file to be uploaded to Dynamo DB. The EventBridge scheduler triggers the cleanupOpenPowerlifitngData function which will ensure the S3 bucket file versions and the DynamoDB versions are in sync. It will then delete any old file and database versions.
