import { createCloudWatchDashboard, sendMetricsToCloudWatch } from "./cloudwatch";
import { getWebsitesFromS3 } from "./s3";
import { checkWebsiteHealth } from "./websiteHealth";
import { triggerAlarm } from "./triggerAlarm";
import { createDynamoDBTable, logAlarmToDynamoDB } from "./dynamoDB";

// Configuration
const BUCKET_NAME = "kiyo-devops-demo-webpage";
const FILE_KEY = "websites.json";


exports.handler = async function (event: any) {
  try {
    console.log("Funciton creating...");
    // 1. Get all website data from JSON file which is stored in S3 bucket
    const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);

    // 2. Create dashboard
    await createCloudWatchDashboard(websites);

    // 3. Create for loop to check each website condition
    for (const site of websites) {
      // 4. Check website health
      const { availability, latency } = await checkWebsiteHealth(site.url);

      // 5. Send alarm if trigger condition is satisfied
      await triggerAlarm(site.name, availability, latency);

      // 6. Create DynamoDB table
      await createDynamoDBTable();

      // 7. Send alarm data to dynamoDB
      await logAlarmToDynamoDB(site.name, availability, latency);

      // 8. Send metrics to cloudwatch
      await sendMetricsToCloudWatch(site.url, site.name);
    }

  } catch (error) {
    console.error("Error in Lambda function: ", error);
  }
};


