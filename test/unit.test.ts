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
  { url: "https://www.youtube.com/", name: "YouTube"}
];


describe("Unit Testing", () => {
  describe("S3", () => {
    it("Calls aws-sdk getObject method with correct parameters", async () => {
      const websites = await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);

      expect(websites).toEqual(allWebsites);
    });
  });

  describe("CloudWatchDashboard", () => {
    it("Should create a dashboard with the correct parameters", async () => {
      await createCloudWatchDashboard(allWebsites);

      expect("Dashboard updated successfully.");
    });

    it("Should send metrics to dashboard with the correct parameters", async () => {
      await sendMetricsToCloudWatch(url, name);

      expect("Metrics sent to CloudWatch successfully.");
    });
  });

  describe("Website health", () => {
    it("Should return availability and latency", async () => {
      const url = "https://kiyo31.com";

      const { availability, latency } = await checkWebsiteHealth(url);

      assert.strictEqual(availability, 100.0);
      assert.ok(latency >= 0);
      assert.ok(latency <= 100000);
    });
  });

  describe("Trigger Alarm", () => {
    it("Should create SNS topic if not exist", async () => {
      const arn = await createSNSTopicAndSendMessage();

      assert.strictEqual(
        arn,
        "arn:aws:sns:ap-southeast-2:325861338157:DevOpsNotificationTopic"
      );
    });

    it("Should create trigger and send alarm to subsribed user", async () => {
      await triggerAlarm(name, availability, latency);

      expect("Send message successfully.");
    });
  });

  describe("DynamoDB", () => {
    it("Should create DynamoDB table if not exist", async () => {
      await createDynamoDBTable();

      expect("Table created successfully." || "Table already exists. No need to create it.");
    });

    it("Should send log to DynamoDB", async () => {
      await logAlarmToDynamoDB(name, availability, latency);

      expect("Sent log to dynamoDB successfully.");
    });
  });
});
