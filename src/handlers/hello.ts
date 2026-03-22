import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const hello = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Hello Lambda function invoked');
  
  try {
    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: JSON.stringify({
        message: 'Hello from Lambda -- From Eega Krishna Vamshi',
        timestamp: new Date().toISOString(),
        path: event.path,
        method: event.httpMethod
      })
    };

    return response;
  } catch (error) {
    console.error('Error in hello function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Something went wrong'
      })
    };
  }
};
