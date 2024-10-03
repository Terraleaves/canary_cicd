import { DynamoDB } from "aws-sdk";

// Create function to add alarm to dynamoDB
export async function logAlarmToDynamoDB(
  siteName: string,
  availability: number,
  latency: number
) {
  // Define DynamoDB client with region
  const dynamoDb = new DynamoDB.DocumentClient({ region: "ap-southeast-2" });

  // Set condition of availiabity
  const AVAILABILITY_THRESHOLD = 99.0;
  const DYNAMODB_TABLE_NAME = process.env.DB_TABLE!;

  // If availability is under condition, define metric type is availability to be stored in database table
  const metricType =
    availability < AVAILABILITY_THRESHOLD ? "Availability" : "Latency";

  // Parameters to add data
  const params = {
    TableName: DYNAMODB_TABLE_NAME,
    Item: {
      websiteName: siteName,
      timestamp: new Date().toISOString(),
      metricType: metricType,
      availability: availability,
      latency: latency,
    },
  };

  // Add parameter data to table
  await dynamoDb.put(params).promise();
  console.log("Sent log to dynamoDB successfully.");
}
