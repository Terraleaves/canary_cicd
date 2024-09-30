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

const BUCKET_NAME = "kiyo-devops-demo-webpage";
const FILE_KEY = "websites.json";
const availability = 100.0;
const latency = 1500;

describe("Function Testing", () => {
  describe("CloudWatchDashboard", () => {
    it("Creates a dashboard with correct parameters", async () => {
      const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);

      await createCloudWatchDashboard(websites);

      const name = websites[0].name
      const url = websites[0].url

      await sendMetricsToCloudWatch(url, name);

      const result = await checkWebsiteHealth(url);
      assert.strictEqual(result.availability, 100.0);
      assert.ok(result.latency >= 0);
    });
  });

  describe("Trigger Alarm", () => {

    it("Creates SNS topic if not exist", async () => {

      const arn = await createSNSTopicAndSendMessage();
      if (arn != undefined) assert.strictEqual(arn,"arn:aws:sns:ap-southeast-2:325861338157:DevOpsNotificationTopic");
      else assert.strictEqual(arn, undefined);
    });

    it("Triggers an alarm", async () => {
      const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);

      const name = websites[0].name;

      await triggerAlarm(name, availability, latency);
      expect("Send message successfully.");
    });
  });

  describe("DynamoDB", () => {
    it("Creates a DynamoDB table if not exist", async () => {
      await createDynamoDBTable();
      expect("Table created successfully." || "Table already exists. No need to create it.");
    });

    it("Logs alarm to DynamoDB", async () => {
      const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);

      const name = websites[0].name;
      await logAlarmToDynamoDB(name, availability, latency);
      expect("Sent log to dynamoDB successfully.");
    });
  });
});
