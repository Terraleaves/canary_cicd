import * as cdk from 'aws-cdk-lib';
import { DevOpsStack } from '../lib/devops-stack'; // Adjust the import path
import { Template } from 'aws-cdk-lib/assertions'; // Use the assertions module

describe('DevOpsStack Integration Test', () => {
  let stack: DevOpsStack;

  beforeAll(() => {
    const app = new cdk.App();
    stack = new DevOpsStack(app, 'DevOpsStackIntegrationTest');
  });

  test('SNS Topic is created with the correct properties', () => {
    const template = Template.fromStack(stack);

    // Check if the SNS topic exists
    template.hasResourceProperties('AWS::SNS::Topic', {
      DisplayName: 'Website Health Alarm Topic',
    });
  });

  test('CloudWatch Dashboard is created', () => {
    const template = Template.fromStack(stack);

    // Check if the CloudWatch dashboard exists
    template.hasResourceProperties('AWS::CloudWatch::Dashboard', {
      DashboardName: 'DevOpsMonitoringDashboard',
    });
  });
});
