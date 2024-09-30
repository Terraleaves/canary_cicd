import { DynamoDB } from "aws-sdk";
import { CreateTableCommand, DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

export async function createDynamoDBTable() {
  const client = new DynamoDBClient({ region: "ap-southeast-2"});

  try {
    // Check if the table exists
    const describeTableCommand = new DescribeTableCommand({ TableName: "DevOpsAlarmLog" });
    await client.send(describeTableCommand);
    console.log(`Table already exists. No need to create it.`);

  } catch (error: any) {
    // If the table does not exist, create it
    if (error.name === "ResourceNotFoundException") {
      console.log(`Table does not exist. Creating...`);
      const command = new CreateTableCommand({
        TableName: "DevOpsAlarmLog",
        AttributeDefinitions: [
          { AttributeName: "websiteName", AttributeType: "S" },
          { AttributeName: "timestamp", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "websiteName", KeyType: "HASH" },
          { AttributeName: "timestamp", KeyType: "RANGE" },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      });

      await client.send(command);
      console.log("Table created successfully.");
    }
    else {
      console.error("An error occurred while checking the table:", error);
      throw error;

  }
}
}

// Create function to add alarm to dynamoDB
export async function logAlarmToDynamoDB(
  siteName: string,
  availability: number,
  latency: number
) {
  // Define DynamoDB client with region
  const dynamoDb = new DynamoDB.DocumentClient({ region: "ap-southeast-2"});

  // Set condition of availiabity
  const AVAILABILITY_THRESHOLD = 99.0;
  const DYNAMODB_TABLE_NAME = "DevOpsAlarmLog";

  // If availability is under condition, define metric type is availability to be stored in database table
  const metricType = availability < AVAILABILITY_THRESHOLD ? "Availability" : "Latency";

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
