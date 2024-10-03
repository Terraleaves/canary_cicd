import { updateCWDashboardWithMetrics, sendMetricsToCloudWatch } from "./modules/cloudwatch";
import { getWebsitesFromS3 } from "./modules/s3";
import { checkWebsiteHealth } from "./modules/websiteHealth";
import { triggerAlarm } from "./modules/triggerAlarm";
import { logAlarmToDynamoDB } from "./modules/dynamoDB";

// Configuration
const BUCKET_NAME = "kiyo-devops-demo-webpage";
const FILE_KEY = "websites.json";


exports.handler = async function (event: any) {
  try {
    console.log("Function creating...");
    // 1. Get all website data from JSON file which is stored in S3 bucket
    const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);

    // 2. Update CloudWatch Dashboard
    await updateCWDashboardWithMetrics(websites);


    // 3. Create for loop to check each website condition
    for (const site of websites) {
      // 4. Check website health
      const { availability, latency } = await checkWebsiteHealth(site.url);

      // 5. Send metrics to cloudwatch
      await sendMetricsToCloudWatch(site.name, availability, latency);

      // 6. Send alarm if trigger condition is satisfied
      if (availability < 100 || latency > 10000) await triggerAlarm(site.name, availability, latency);

      // 7. Send alarm data to dynamoDB
      await logAlarmToDynamoDB(site.name, availability, latency);
    }

  } catch (error) {
    console.error("Error in Lambda function: ", error);
  }
};


