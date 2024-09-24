import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as Cicd from "../lib/cicd-stack";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

test("Lambda function Created", () => {
  const app = new cdk.App();

  const stack = new Cicd.CicdStack(app, "TestStack", {
    env: {
      region: 'ap-southeast-2',  // Set the region explicitly here
    },
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::Lambda::Function", {
    runtime: lambda.Runtime.NODEJS_20_X,
    handler: "index.handler",
    code: lambda.Code.fromAsset(path.join(__dirname, "../function")),
    timeout: cdk.Duration.seconds(60),
  });
});
