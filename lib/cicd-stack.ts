import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { MyPipelineAppStage } from './pipeline-app-stage';
import { ComputeType } from 'aws-cdk-lib/aws-codebuild';
import { TestStage } from './test-app-stage';

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
      synth: synthStep,
      codeBuildDefaults: {
        buildEnvironment: {
          computeType: ComputeType.LARGE
        }
      }
    });

    // Test stage
    pipeline.addStage(new TestStage(this, "Test", {
      env: {
        account: '325861338157',
        region: 'ap-southeast-2'
      }
    }))

    // Deploy stage
    const deployStage = pipeline.addStage(new MyPipelineAppStage(this, "Deploy", {
      env: {
        account: '325861338157',
        region: 'ap-southeast-2'
      }
    }));

    deployStage.addPre(new ManualApprovalStep('approval'));

    const wave = pipeline.addWave('wave');
    wave.addStage(new MyPipelineAppStage(this, 'Deploy to EU', {
      env: { account: '325861338157', region: 'eu-west-1' }
    }));
    wave.addStage(new MyPipelineAppStage(this, 'Deployt to US', {
      env: { account: '325861338157', region: 'us-west-1' }
    }));

  }
}


