import { DynamoDB } from "aws-sdk";

// Create function to add alarm to dynamoDB
export async function logAlarmToDynamoDB(
  siteName: string,
  availability: number,
  latency: number
) {
  const dynamoDb = new DynamoDB.DocumentClient();
  const AVAILABILITY_THRESHOLD = 99.0;
  const DYNAMODB_TABLE_NAME = "DevOpsKiyoDB";

  const metricType = availability < AVAILABILITY_THRESHOLD ? "Availability" : "Latency";
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
  await dynamoDb.put(params).promise();
}
