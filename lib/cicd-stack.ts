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

    const synthStep = new ShellStep("Synth", {
      input: CodePipelineSource.connection(
        "kiyohiro0310/devops_cicd",
        "master",
        {
          connectionArn:
            "arn:aws:codestar-connections:us-east-2:325861338157:connection/dc5275a2-85db-48f1-91e2-a1aac8496373",
        }
      ),
      commands: ["npm ci", "npm run build", "npx cdk synth"],
      primaryOutputDirectory: "cdk.out",
    });

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "DevOpsPipeline",
      synth: synthStep,
    });


    // Deploy stage
    const deployStage = pipeline.addStage(
      new MyPipelineAppStage(this, "Deploy", {
        env: {
          account: "325861338157",
          region: "ap-southeast-2",
        },
      })
    );

    deployStage.addPre(new ShellStep('Test', {
      commands: ["npm install", "node --max-old-space-size=4096 node_modules/.bin/jest"]
    }));

    deployStage.addPre(new ManualApprovalStep("approval"));
  }
}
