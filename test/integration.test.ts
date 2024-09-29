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
      expect("Dashboard updated successfully.");

      for (const site of websites) {
        const { url, name } = site;

        // 3. Check website health (availability and latency)
        const { availability, latency } = await checkWebsiteHealth(url);
        assert.strictEqual(availability, 100.0);
        assert.ok(latency >= 0);
        assert.ok(latency <= 100000);

        // 4. Trigger SNS alarm if necessary
        await triggerAlarm(name, availability, latency);
        expect("Send message successfully.");

        // 5. Log alarm to DynamoDB
        await logAlarmToDynamoDB(name, availability, latency);
        expect("Sent log to dynamoDB successfully.");

        // 6. Send metrics to CloudWatch
        await sendMetricsToCloudWatch(url, name);
        expect("Metrics sent to CloudWatch successfully.");
      }

      // 7. Ensure SNS Topic is created
      const arn = await createSNSTopicAndSendMessage();
      assert.strictEqual(arn, snsTopicArn, "SNS Topic ARN should match");
      if (arn != undefined) assert.strictEqual(arn,"arn:aws:sns:ap-southeast-2:325861338157:DevOpsNotificationTopic");
      else assert.strictEqual(arn, undefined);
    });

    it("Should create DynamoDB table if it doesn't exist", async () => {
      await createDynamoDBTable();
      expect("Table created successfully." || "Table already exists. No need to create it.");
    });
  });
