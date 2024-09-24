import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { DevOpsStack } from './devops-stack';

export class CicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const synthStep = new ShellStep('Synth', {
      input: CodePipelineSource.connection('kiyohiro0310/devops_cicd', 'master', {
        connectionArn: "arn:aws:codestar-connections:us-east-2:325861338157:connection/dc5275a2-85db-48f1-91e2-a1aac8496373"
      }),
      commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      primaryOutputDirectory: 'cdk.out'
    })

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'DevOpsPipeline',
      synth: synthStep
    });

    // Unit testing stage

    // Functionality testing stage

    // Integration testing stage

    // Deploy stage
    pipeline.addStage(new DeployStage(this, "Deploy", {
      env: {
        account: '325861338157',
        region: 'ap-southeast-2'
      }
    }));
  }
}

export class DeployStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const devopsStack = new DevOpsStack(this, 'DevOpsStack');
  }
}