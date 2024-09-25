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
  const snsTopicArn = "arn:aws:sns:ap-southeast-2:325861338157:DevOpsNotificationTopic";

  describe("Integration Testing - Full Workflow", () => {
    it("Should complete the full process from S3 to CloudWatch to DynamoDB", async () => {
      // 1. Get websites from S3
      const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);
      assert.ok(websites.length > 0, "Websites should be retrieved from S3");

      // 2. Create CloudWatch dashboard
      await createCloudWatchDashboard(websites);
      console.log("CloudWatch dashboard created successfully");

      for (const site of websites) {
        const { url, name } = site;

        // 3. Check website health (availability and latency)
        const { availability, latency } = await checkWebsiteHealth(url);
        assert.strictEqual(availability, 100.0, `Website ${name} should be available`);
        console.log(`Website ${name} health checked successfully`);

        // 4. Trigger SNS alarm if necessary
        await triggerAlarm(name, availability, latency);
        console.log(`Alarm triggered for ${name}`);

        // 5. Log alarm to DynamoDB
        await logAlarmToDynamoDB(name, availability, latency);
        console.log(`Alarm log for ${name} saved to DynamoDB`);

        // 6. Send metrics to CloudWatch
        await sendMetricsToCloudWatch(url, name);
        console.log(`Metrics for ${name} sent to CloudWatch`);
      }

      // 7. Ensure SNS Topic is created
      const arn = await createSNSTopicAndSendMessage();
      assert.strictEqual(arn, snsTopicArn, "SNS Topic ARN should match");
      console.log("SNS topic created and message sent successfully");
    });

    it("Should create DynamoDB table if it doesn't exist", async () => {
      await createDynamoDBTable();
      console.log("DynamoDB table created or already exists");
    });
  });
