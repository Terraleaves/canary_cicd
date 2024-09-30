# COMP2029 DevOps CICD project
This repository include mainly 2 features:
1. Lambda function
   - Obtaining metrics(Availability, latency) for 3 URLs
   - Creating a monitoring service to monitor the metrics
   - Creating alarms on metrics
   - Send notification of each websites metrics
   - Create DynamoDB table and store alarm information
2. Set up CICD pipeline
    - Source
    - Build
    - Update Pipeline
    - Assets
    - Stage
    - Deploy

## Run app
Make sure you have created repository using aws cdk before pull this repository.
Once you've got repository, take following steps to run app
```
npm install
npm run build
cdk bootstrap (You might need to configure your account)
cdk synth
cdk deploy
```