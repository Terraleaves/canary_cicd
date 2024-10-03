import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep,
} from "aws-cdk-lib/pipelines";
import { MyPipelineAppStage } from "./pipeline-app-stage";
import { DevOpsStack } from './devops-stack';

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
      crossAccountKeys: true
    });

    const uat = new MyPipelineAppStage(this, "Stage", {
      env: {
        account: "325861338157",
        region: "ap-southeast-2",
      },
    })

    // Add validation
    const uatStage = pipeline.addStage(uat, {
      post: [
        new ShellStep('Validation', {
          commands: [
            'curl -Ssf $ENDPOINT_URL'
          ],
          envFromCfnOutputs: {
            ENDPOINT_URL: uat.urlOutput
          }
        })
      ]
    }

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
          region: "us-west-2",
        },
      })
    );

    // Automatically rollback if deployment fails
    deployStage.addPost(new ShellStep("Rollback", {
      commands: [
        // Log message for rollback
        'echo "Rolling back..."',

         // Command to rollback
        'aws cloudformation rollback-stack --stack-name DevOpsStack'
      ],
    }));
  }
}
