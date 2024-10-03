import { CloudWatch } from "aws-sdk";

interface Website {
  url: string;
  name: string;
}

const cloudWatch = new CloudWatch({region: 'ap-southeast-2'});
const DASHBOARD_NAME = process.env.CW_DASHBOARD_NAME!;
const NAMESPACE = "WebsiteHealth";

// Create dashboard
export async function updateCWDashboardWithMetrics(
  websites: Website[]
): Promise<void> {


  // Create widgets for each website
  const widgets = websites.map((site, index) => ({
    type: "metric",
    x: 0,
    y: index * 12, // Stack widgets vertically to avoid overlap
    width: 12,
    height: 6,
    properties: {
      metrics: [
        [
          NAMESPACE,
          "Availability",
          "WebsiteName",
          site.name,
          { yAxis: "left" },
        ],
        [
          NAMESPACE,
          "Latency",
          "WebsiteName",
          site.name,
          { yAxis: "right" },
        ],
      ],
      view: "timeSeries",
      stacked: false,
      region: "ap-southeast-2",
      title: `Website Health - ${site.name}`,
      period: 300,
      stat: "Average",
      yAxis: {
        left: {
          label: "Availability (%)",
          min: 0,
          max: 100,
        },
        right: {
          label: "Latency (ms)",
          min: 0,
          max: 5000,
        },
      },
    },
  }));

  // Create the dashboard body
  const dashboardBody = JSON.stringify({ widgets });

  // Define parameters for putDashboard API call
  const params = {
    DashboardName: DASHBOARD_NAME,
    DashboardBody: dashboardBody,
  };

  try {
    // Attempt to update the dashboard
    await cloudWatch.putDashboard(params).promise();
    console.log("Dashboard updated successfully.");
  } catch (error: any) {
    if (error.code === "ResourceNotFoundException") {
      // Dashboard does not exist, create it
      await cloudWatch.putDashboard(params).promise();
      console.log("Dashboard created successfully.");
    } else {
      // Handle other errors
      console.error("Error creating or updating dashboard:", error);
    }
  }
}

// Send data immediately when cloudwatch dashboard is created
export async function sendMetricsToCloudWatch(
  websiteName: string,
  availability: number,
  latency: number
): Promise<void> {

  // Define parameters
  const params = {
    Namespace: NAMESPACE,
    MetricData: [
      {
        MetricName: "Availability",
        Dimensions: [
          {
            Name: "WebsiteName",
            Value: websiteName,
          },
        ],
        Value: availability,
        Unit: "Percent",
      },
      {
        MetricName: "Latency",
        Dimensions: [
          {
            Name: "WebsiteName",
            Value: websiteName,
          },
        ],
        Value: latency,
        Unit: "Milliseconds",
      },
    ],
  };

  try {
    //Send metric data to CloudWatch dashboard
    await cloudWatch.putMetricData(params).promise();
    console.log("Metrics sent to CloudWatch successfully.");
  } catch (error) {
    console.error("Error sending metrics to CloudWatch:", error);
  }
}
