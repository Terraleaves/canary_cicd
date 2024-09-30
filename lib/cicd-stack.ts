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
        "kiyohiro0310/devops_cicd",
        "master",
        {
          // Use CodeStar connection
          connectionArn:
            "arn:aws:codestar-connections:us-east-2:325861338157:connection/dc5275a2-85db-48f1-91e2-a1aac8496373",
        }
      ),
      // Install dependencies, build, and update pipeline
      commands: ["cd function", "npm ci", "cd ..", "npm ci", "npm run build", "npx cdk synth"],
      primaryOutputDirectory: "cdk.out",
    });

    // Create cicd pipeline
    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "DevOpsPipeline",
      synth: synthStep,
    });

    // UAT stage
    const uatStage = pipeline.addStage(
      new MyPipelineAppStage(this, "UAT", {
        env: {
          account: "325861338157",
          region: "ap-southeast-2",
        },
      })
    );

    // Add Testing step
    uatStage.addPre(
      new ShellStep("Test", {
        commands: [
          "npm ci",
          "node --max-old-space-size=4096 node_modules/.bin/jest",
        ],
      })
    );

    // Add approve step to proceed production deployment
    uatStage.addPost(new ManualApprovalStep("approval"));

    // Define deploy stage
    // Can be used to deploy multi regions
    const deployStage = pipeline.addStage(
      new MyPipelineAppStage(this, "Deploy", {
        env: {
          account: "325861338157",
          region: "ap-southeast-2",
        },
      })
    );
  }
}
