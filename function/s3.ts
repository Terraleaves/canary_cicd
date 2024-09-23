import { S3 } from "aws-sdk";

interface Website {
  url: string;
  name: string;
}

// Get website data from S3
export async function getWebsitesFromS3(
    bucket: string,
    key: string
  ): Promise<Website[]> {
    const s3 = new S3();
    const params = { Bucket: bucket, Key: key };
    const data = await s3.getObject(params).promise();

    return JSON.parse(data.Body?.toString("utf-8") || "[]") as Website[];
  }