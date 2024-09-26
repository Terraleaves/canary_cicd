import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ShellStep } from "aws-cdk-lib/pipelines";

export class TestStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
      super(scope, id, props);

      new cdk.Stack(this, 'TestStack');

      // Test step - runs npm test before deployment
      new ShellStep('RunTests', {
        commands: [
          'npm ci',
          'npm run build',
          'npm test'
        ]
      });
    }
  }