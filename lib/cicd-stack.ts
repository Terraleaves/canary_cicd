import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep,
} from "aws-cdk-lib/pipelines";
import { MyPipelineAppStage } from "./pipeline-app-stage";

export class CicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define shell step to fetch source
    const synthStep = new ShellStep("Synth", {
      input: CodePipelineSource.connection(
        "Terraleaves/canary_cdk",
        "master",
        {
          // Use CodeStar connection
          connectionArn:
            "arn:aws:codeconnections:ap-southeast-2:116981789059:connection/40bc72e5-4f17-4152-99b1-1b1e86c06876",
        }
      ),
      // Install dependencies, build, and update pipeline
      commands: ["cd function", "npm ci", "cd ..", "npm ci", "npm run build", "npx cdk synth"],
      primaryOutputDirectory: "cdk.out",
    });

    // Create cicd pipeline
    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "DevOpsPipeline",
      synth: synthStep
    });

    // Define deploy stage
    // Can be used to deploy multi regions
    const deployStage = pipeline.addStage(
      new MyPipelineAppStage(this, "Deploy", {
        env: {
          account: "116981789059",
          region: "ap-southeast-2",
        },
      })
    );

    deployStage.addPre(
      new ShellStep("Test", {
        commands: [
          "npm ci",
          "node --max-old-space-size=4096 node_modules/.bin/jest",
        ],
      })
    );

    // Add approve step to proceed production deployment
    deployStage.addPre(new ManualApprovalStep("approval"));
  }
}
