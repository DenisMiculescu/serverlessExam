import { DynamoDB } from "aws-sdk";

const ddb = new DynamoDB.DocumentClient();
const { CREW_TABLE_NAME } = process.env;

export const handler = async (event: any) => {
  const { role, movieId } = event.pathParameters;

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

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items || []),
    };
  } catch (error) {
    console.error("Error querying crew members:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error querying crew members." }),
    };
  }
};
