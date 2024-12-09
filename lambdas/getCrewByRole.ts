import { DynamoDB } from "aws-sdk";

const ddb = new DynamoDB.DocumentClient();
const { CREW_TABLE_NAME } = process.env;

export const handler = async (event: any) => {
  const { role, movieId } = event.pathParameters;
  const { name } = event.queryStringParameters || {};

  if (!role || !movieId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Role and Movie ID are required." }),
    };
  }

  try {
    const result = await ddb
      .query({
        TableName: CREW_TABLE_NAME!,
        KeyConditionExpression: "movieId = :movieId AND crewRole = :role",
        ExpressionAttributeValues: {
          ":movieId": Number(movieId),
          ":role": role,
        },
      })
      .promise();

    // New Functionality to filter by name for Q2 B
    let filteredItems = result.Items || [];
    if (name) {
      const lowerCaseName = name.toLowerCase();
      filteredItems = filteredItems.flatMap((item) => {

        const nameArray = item.names.split(",").map((n: string) => n.trim());

        const matchingNames = nameArray.filter((n) =>
          n.toLowerCase().includes(lowerCaseName)
        );

        return matchingNames.map((matchingName) => ({
          movieId: item.movieId,
          crewRole: item.crewRole,
          name: matchingName,
        }));
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(filteredItems),
    };
  } catch (error) {
    console.error("Error querying crew members:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error querying crew members." }),
    };
  }
};
