import * as AWS from 'aws-sdk';

const lambda = new AWS.Lambda();

export const handler = async (event: any) => {
  const functionName = process.env.FUNCTION_NAME || 'MyLambdaFunction';

  // Get all versions of the Lambda function
  const versions = await lambda.listVersionsByFunction({ FunctionName: functionName }).promise();

  // Get the last two versions (current and previous)
  const latestVersion = versions.Versions?.pop();
  const previousVersion = versions.Versions?.pop();

  if (!previousVersion || !latestVersion) {
    console.error('No previous version found for rollback');
    return;
  }

  console.log(`Rolling back to version ${previousVersion.Version}`);

  // Rollback to the previous version by updating the alias to point to the previous version
  await lambda.updateAlias({
    FunctionName: functionName,
    Name: 'live', // Alias name
    FunctionVersion: previousVersion.Version!,
  }).promise();

  console.log(`Successfully rolled back to version ${previousVersion.Version}`);
};