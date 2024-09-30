import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DevOpsStack } from "./devops-stack";

export class MyPipelineAppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    // Create Stack
    new DevOpsStack(this, "DevOpsStack");
  }
}

