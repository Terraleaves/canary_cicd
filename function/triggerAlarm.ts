import { SNS } from "aws-sdk";

const AVAILABILITY_THRESHOLD = 99.0;
// const SNS_TOPIC_ARN = "arn:aws:sns:ap-southeast-2:325861338157:demo-ccp";

const sns = new SNS();

// Create SNS
export async function createSNSTopicAndSendMessage(): Promise<any> {
  try {
    // 1: Create an SNS topic
    const topicName = "DevOpsNotificationTopic";
    const createTopicResponse = await sns
      .createTopic({ Name: topicName })
      .promise();
    const topicArn = createTopicResponse.TopicArn;
    const email = "kiyohiro.0310@gmail.com"; // Email address to subscribe

    console.log(`SNS Topic ARN: ${topicArn}`);

    // 2: Subscribe the email to the topic
    const subscribeParams = {
      Protocol: "email", // Protocol for email
      TopicArn: topicArn!,
      Endpoint: email, // Email address to subscribe
    };

    // 3. Add subscriobe to topic
    const listSubscriptionsResponse = await sns
      .listSubscriptionsByTopic({ TopicArn: topicArn! })
      .promise();
    const subscriptions = listSubscriptionsResponse.Subscriptions || [];

    // 4. Check if the email is already subscribed
    const isSubscribed = subscriptions.some(
      (sub) => sub.Protocol === "email" && sub.Endpoint === email
    );

    if (isSubscribed) {
      console.log(`Email ${email} is already subscribed to the topic.`);
    } else {
      // 5. If not subscribed, create a new email subscription
      const subscribeResponse = await sns.subscribe(subscribeParams).promise();
      console.log(
        `Subscription request sent. Subscription ARN: ${subscribeResponse.SubscriptionArn}`
      );
      console.log(`An email has been sent to ${email} for confirmation.`);

      console.log(`SNS Topic created successfully: ${topicArn}`);

      console.log(`Message sent successfully to topic.`);
    }

    if (topicArn) return topicArn;
  } catch (error) {
    console.error("Error creating topic or sending message:", error);
  }
}

// Create alarm
export async function triggerAlarm(
  siteName: string,
  availability: number,
  latency: number
) {
  const message = `Website Health Alert of ${siteName} Availability: ${availability}% Latency: ${latency}ms`;

  const arn = await createSNSTopicAndSendMessage();
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
  await sns.publish(params).promise();
}
