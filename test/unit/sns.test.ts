import * as cdk from 'aws-cdk-lib';
import { DevOpsStack } from '../../lib/devops-stack'; // Adjust the import according to your file structure
import { Template } from 'aws-cdk-lib/assertions';

describe('SNS Topic and subscription testing', () => {
  test('SNS Topic is created with the correct properties', () => {
    const app = new cdk.App();
    const stack = new DevOpsStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    // Assert that the SNS Topic is created with the specified display name
    template.hasResourceProperties('AWS::SNS::Topic', {
      DisplayName: 'Website Health Alarm Topic',
    });

    // Assert that the SNS Subscription is created with the specified email endpoint
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'kiyohiro.0310@gmail.com',
    });
  });
});
