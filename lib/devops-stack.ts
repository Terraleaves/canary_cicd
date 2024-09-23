import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class DevOpsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda function
    const canaryFunction = new lambda.Function(this, "DevOpsCanaryFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, '../function')),
      timeout: cdk.Duration.seconds(60),
    });

    // Add admin access to do everything
    canaryFunction.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    // Create function to output url in console
    const canaryFunctionUrl = canaryFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // Output URL in console
    new cdk.CfnOutput(this, "myFunctionUrlOutput", {
      value: canaryFunctionUrl.url,
    });
  }
}