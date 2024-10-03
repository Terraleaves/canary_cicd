import { SNS } from "aws-sdk";

const AVAILABILITY_THRESHOLD = 99.0;

const sns = new SNS({region: "ap-southeast-2"});


// Send alarm
export async function triggerAlarm(
  siteName: string,
  availability: number,
  latency: number
) {
  const message = `Website Health Alert of ${siteName} Availability: ${availability}% Latency: ${latency}ms`;

  // Get arn
  const arn = process.env.TOPIC_ARN;

  const params = {
    Message: message,
    TopicArn: arn,
    MessageAttributes: {
      metricType: {
        DataType: "String",
        StringValue:
          availability < AVAILABILITY_THRESHOLD ? "Availability" : "Latency",
      },
    },
  };

  // Send message to all subscribed email
  await sns.publish(params).promise();
  console.log("Send message successfully.");
}
