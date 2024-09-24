import { S3 } from "aws-sdk";
import { getWebsitesFromS3 } from "../function/s3";

const mockS3Instance = {
  getObject: jest.fn().mockReturnThis(),
  promise: jest.fn().mockReturnThis(),
  catch: jest.fn(),
};

const BUCKET_NAME = "kiyo-devops-demo-webpage";
const FILE_KEY = "websites.json";

jest.mock("aws-sdk", () => {
    return { S3: jest.fn(() => mockS3Instance) }
});

describe("S3", () => {
    it('calls aws-sdk copyObject method with correct parameters', async () => {
        await getWebsitesFromS3(BUCKET_NAME, FILE_KEY);

        expect(mockS3Instance.getObject).toHaveBeenCalledWith({
          Bucket: 'some-bucket',
          CopySource: 'some-bucket/some/path/myfile.json',
          Key: 'some-bucket/some/other/path/myfile.json',
        })
        expect(mockS3Instance.getObject).toHaveBeenCalledTimes(1)
     })
})