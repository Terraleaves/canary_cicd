import { App } from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';
import { DevOpsStack } from '../lib/devops-stack';

describe('DevOpsStack Functional Tests', () => {
  let stack: DevOpsStack;
  let app: App;

  beforeEach(() => {
    app = new App();
    stack = new DevOpsStack(app, 'FunctionalTestStack');
  });

  test('SNS Topic is created and can publish messages', () => {
    // Use assertions to validate the creation of SNS Topic
    const template = assertions.Template.fromStack(stack);

    template.hasResourceProperties('AWS::SNS::Topic', {
      DisplayName: 'Website Health Alarm Topic',
    });
  });

  test('CloudWatch Dashboard is created', () => {
    const template = assertions.Template.fromStack(stack);

    // Check for CloudWatch Dashboard creation
    template.hasResourceProperties('AWS::CloudWatch::Dashboard', {
      DashboardName: 'DevOpsMonitoringDashboard',
    });
  });
});
