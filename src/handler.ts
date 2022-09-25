import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
  Expression,
} from "@aws-sdk/client-cost-explorer";

const client = new CostExplorerClient({});

export const hello = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
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
      End: `${year}-${month}-${day+1}`,
    },
    Metrics: ["BlendedCost"],
    Filter: filter,
  };

  const command = new GetCostAndUsageCommand(request);

  const result = await client.send(command);

  if (result.ResultsByTime) {
    console.log(result.ResultsByTime[0]);
  }
};
