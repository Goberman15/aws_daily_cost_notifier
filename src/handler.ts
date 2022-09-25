import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
  Expression,
} from "@aws-sdk/client-cost-explorer";
import {
  SNSClient,
  PublishCommand,
  PublishBatchCommandInput,
  PublishCommandInput,
} from "@aws-sdk/client-sns";

const ceClient = new CostExplorerClient({});
const snsClient = new SNSClient({});

export const hello = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate();

  const filter: Expression = {
    Not: {
      Dimensions: {
        Key: "RECORD_TYPE",
        Values: ["Credit"],
      },
    },
  };

  const request: GetCostAndUsageCommandInput = {
    Granularity: "DAILY",
    TimePeriod: {
      Start: `${year}-${month}-${day}`,
      End: `${year}-${month}-${day + 1}`,
    },
    Metrics: ["BlendedCost"],
    Filter: filter,
  };

  const command = new GetCostAndUsageCommand(request);

  const result = await ceClient.send(command);

  if (!result.ResultsByTime) {
    return;
  }

  const dailyCost = Number(result.ResultsByTime[0].Total?.BlendedCost.Amount);

  const publishInput: PublishCommandInput = {
    Message: `Total Usage --> US$ ${dailyCost.toFixed(3)}`,
    TopicArn: process.env.TOPIC_ARN,
  };

  await snsClient.send(new PublishCommand(publishInput));
};
