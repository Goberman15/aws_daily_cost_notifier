import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
  Expression,
} from "@aws-sdk/client-cost-explorer";
import {
  SNSClient,
  PublishCommand,
  PublishCommandInput,
} from "@aws-sdk/client-sns";

const ceClient = new CostExplorerClient({});
const snsClient = new SNSClient({});

export const costNotifier = async () => {
  const date = new Date();
  const endYear = date.getFullYear();
  const endMonth = (date.getMonth() + 1).toString().padStart(2, "0");
  const endDay = date.getDate();

  date.setDate(date.getDate() - 1);
  const startYear = date.getFullYear();
  const startMonth = (date.getMonth() + 1).toString().padStart(2, "0");
  const startDay = date.getDate();

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
      Start: `${startYear}-${startMonth}-${startDay}`,
      End: `${endYear}-${endMonth}-${endDay}`,
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
    Message: `
      Your Total Usage for ${startDay}-${startMonth}-${startYear} --> US$ ${dailyCost.toFixed(
      3
    )}`,
    TopicArn: process.env.TOPIC_ARN,
  };

  await snsClient.send(new PublishCommand(publishInput));
};
