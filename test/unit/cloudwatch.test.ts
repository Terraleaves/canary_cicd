import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { DevOpsStack } from "../../lib/devops-stack";

describe('DevOpsStack', () => {
  let stack: DevOpsStack;

  beforeEach(() => {
    const app = new cdk.App();
    stack = new DevOpsStack(app, 'TestStack');
  });

  test('should create a CloudWatch Dashboard with correct properties', () => {
    // Create a template from the stack
    const template = Template.fromStack(stack);

    // Check if the dashboard resource exists
    template.hasResourceProperties('AWS::CloudWatch::Dashboard', {
      DashboardName: 'DevOpsMonitoringDashboard',
    });
  });
});
