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
const name = "Kiyohiro Kambayashi";
const url = "https://kiyo31.com";
const availability = 100.0;
const latency = 1500;
const allWebsites = [
  { url: "https://kiyo31.com", name: "Kiyohiro Kambayashi" },
  { url: "https://google.com", name: "Google" },
];

describe("Function Testing", () => {
  describe("S3", () => {
    it("Retrieves websites from S3", async () => {
      const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);
      expect(websites).toEqual(allWebsites);
    });
  });

  describe("CloudWatchDashboard", () => {
    it("Creates a dashboard with correct parameters", async () => {
      await createCloudWatchDashboard(allWebsites);
      console.log("CloudWatch dashboard created successfully.");
    });

    it("Sends metrics to CloudWatch", async () => {
      await sendMetricsToCloudWatch(url, name);
      console.log("Metrics sent to CloudWatch successfully.");
    });
  });

  describe("Website health", () => {
    it("Checks website health for availability and latency", async () => {
      const result = await checkWebsiteHealth(url);
      assert.strictEqual(result.availability, 100.0);
      assert.ok(result.latency >= 0);
    });
  });

  describe("Trigger Alarm", () => {
    it("Creates SNS topic if not exist", async () => {
      const arn = await createSNSTopicAndSendMessage();
      assert.strictEqual(
        arn,
        "arn:aws:sns:ap-southeast-2:325861338157:DevOpsNotificationTopic"
      );
    });

    it("Triggers an alarm", async () => {
      await triggerAlarm(name, availability, latency);
      console.log("Alarm triggered successfully.");
    });
  });

  describe("DynamoDB", () => {
    it("Creates a DynamoDB table if not exist", async () => {
      await createDynamoDBTable();
      console.log("DynamoDB table created successfully.");
    });

    it("Logs alarm to DynamoDB", async () => {
      await logAlarmToDynamoDB(name, availability, latency);
      console.log("Alarm log saved to DynamoDB.");
    });
  });
});
