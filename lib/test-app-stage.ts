import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ShellStep } from "aws-cdk-lib/pipelines";

export class TestStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
      super(scope, id, props);

      // Test step - runs npm test before deployment
      const testStep = new ShellStep('RunTests', {
        commands: [
          'npm ci',    // Ensure dependencies are installed
          'npm run build',  // (Optional) Build your project
          'npm test'   // Run your test command
        ]
      });
    }
  }