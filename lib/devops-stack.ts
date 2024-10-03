import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as cloudwatchDashboards from "aws-cdk-lib/aws-cloudwatch";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

export class DevOpsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // 1. Create an SNS Topic and add email subscription to the SNS topic
    const alarmTopic = this.createSNSTopic();

    // 2. Create CloudWatch Dashboard
    const dashboard = this.createCWDashBoard();

    // 3. Crete dynamoDB table
    const dynammoDBTable = this.createDynamoDBTable();

    // 4. Create Lambda function
    const canaryFunction = this.createLambdaFunction(
      alarmTopic,
      dashboard,
      dynammoDBTable
    );

    // 5. Provide permission to canary
    this.grantPermissions(canaryFunction, dynammoDBTable);

    // 6. Create event rule of lambda execution
    this.createEventRule(canaryFunction);
  }



  // Create an SNS Topic and add email subscription to the SNS topic
  private createSNSTopic(): sns.Topic {
    const alarmTopic = new sns.Topic(this, "DevOpsNotificationTopic", {
      displayName: "Website Health Alarm Topic",
    });
    alarmTopic.addSubscription(
      new snsSubscriptions.EmailSubscription("kiyohiro.0310@gmail.com")
    );
    return alarmTopic;
  }

  // Create CloudWatch Dashboard
  private createCWDashBoard(): cloudwatchDashboards.Dashboard {
    return new cloudwatchDashboards.Dashboard(this, "DevOpsDashboard", {
      dashboardName: "DevOpsMonitoringDashboard",
    });
  }

  // Crete dynamoDB table
  private createDynamoDBTable(): dynamodb.Table {
    const table = new dynamodb.Table(this, "DevOpsAlarmLog", {
      partitionKey: {
        name: "websiteName",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "timestamp", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    table
      .autoScaleWriteCapacity({ minCapacity: 5, maxCapacity: 20 })
      .scaleOnUtilization({
        targetUtilizationPercent: 70,
      });

    return table;
  }

  // Create Lambda function
  private createLambdaFunction(
    alarmTopic: sns.Topic,
    dashboard: cloudwatchDashboards.Dashboard,
    table: dynamodb.Table
  ): lambda.Function {
    const canaryFunction = new lambda.Function(this, "DevOpsCanaryFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../function")),
      timeout: cdk.Duration.seconds(60),
      environment: {
        TOPIC_ARN: alarmTopic.topicArn,
        DB_TABLE: table.tableName,
        CW_DASHBOARD_NAME: dashboard.dashboardName,
      },
    });

    return canaryFunction;
  }

  private grantPermissions(
    canaryFunction: lambda.Function,
    table: dynamodb.Table
  ): void {
    // Add admin access to do everything
    canaryFunction.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
    );

    // Grant write access to DynamoDB
    table.grantWriteData(canaryFunction);
  }

  // Create event rule of lambda execution
  private createEventRule(canaryFunction: lambda.Function): void {
    // Invoke canary function evenry minute
    const rule = new events.Rule(this, "CanaryFuncitonScheduleRule", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
    });

    // Add rule to canary function
    rule.addTarget(new targets.LambdaFunction(canaryFunction));
  }
}
