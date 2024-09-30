import {
  createCloudWatchDashboard,
  sendMetricsToCloudWatch,
} from "../function/cloudwatch";
import { createDynamoDBTable, logAlarmToDynamoDB } from "../function/dynamoDB";
import { getWebsitesFromS3 } from "../function/s3";
import {
  createSNSTopicAndSendMessage,
  triggerAlarm,
} from "../function/triggerAlarm";
import { checkWebsiteHealth } from "../function/websiteHealth";
import assert = require("assert");

// Configuration for integration test
const BUCKET_NAME = "kiyo-devops-demo-webpage";
const FILE_KEY = "websites.json";
const snsTopicArn =
  "arn:aws:sns:ap-southeast-2:325861338157:DevOpsNotificationTopic";

describe("Integration Testing", () => {
  it("Should complete the full process from S3 to CloudWatch to DynamoDB", async () => {
    // Get websites from S3
    const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);
    assert.ok(websites.length > 0, "Websites should be retrieved from S3");

    // Create CloudWatch dashboard
    await createCloudWatchDashboard(websites);
    console.log("Dashboard updated successfully.");

    for (const site of websites) {
      const { url, name } = site;

      // Check website health (availability and latency)
      const { availability, latency } = await checkWebsiteHealth(url);
      assert.strictEqual(availability, 100.0);
      assert.ok(latency >= 0);
      assert.ok(latency <= 100000);

      // Send metrics to CloudWatch
      await sendMetricsToCloudWatch(url, name);
      console.log("Metrics sent to CloudWatch successfully.");

      // Ensure SNS Topic is created
      const arn = await createSNSTopicAndSendMessage();
      assert.strictEqual(arn, snsTopicArn, "SNS Topic ARN should match");
      if (arn != undefined)
        assert.strictEqual(
          arn,
          "arn:aws:sns:ap-southeast-2:325861338157:DevOpsNotificationTopic"
        );
      else assert.strictEqual(arn, undefined);

      // Trigger SNS alarm if necessary
      await triggerAlarm(name, availability, latency);
      console.log("Send message successfully.");

      // Create DyanamoDB Table if not exist
      await createDynamoDBTable();
      console.log("Table created successfully." || "Table already existNo need to create it.");

      // Log alarm to DynamoDB
      await logAlarmToDynamoDB(name, availability, latency);
      expect("Sent log to dynamoDB successfully.");
    }
  }, 30000);

});