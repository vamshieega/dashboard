# AWS Lambda TypeScript API

A simple AWS Lambda GET API built with TypeScript and the Serverless Framework.

## Project Structure

```
├── src/
│   └── handlers/
│       └── hello.ts          # Lambda handler function
├── dist/                     # Compiled TypeScript output
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── serverless.yml           # Serverless Framework configuration
└── README.md               # This file
```

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- AWS CLI configured with credentials
- Serverless Framework CLI

## GitHub authentication (`git push`)

GitHub requires a **Personal Access Token** for HTTPS pushes (account passwords are rejected). Step-by-step checklist: **[docs/github-login.md](./docs/github-login.md)**.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Serverless Framework globally (if not already installed):
```bash
npm install -g serverless
```

## Local Development

1. Build the TypeScript code:
```bash
npm run build
```

2. Start local development server:
```bash
npm run start
# or
npm run dev
```

3. Test the API locally:
```bash
curl http://localhost:3004/hello
```

Expected response:
```json
{
  "message": "Hello from Lambda",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/hello",
  "method": "GET"
}
```

## Deployment

1. Deploy to AWS:
```bash
npm run deploy
# or
sls deploy
```

2. The deployment will output the API Gateway endpoint URL. It will look like:
```
https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/hello
```

3. Test the deployed API:
```bash
curl https://YOUR_ENDPOINT_URL/hello
```

## API Endpoints

### GET /hello
Returns a simple greeting message.

**Response:**
```json
{
  "message": "Hello from Lambda",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/hello",
  "method": "GET"
}
```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start local development server
- `npm run deploy` - Deploy to AWS
- `npm run remove` - Remove deployed resources from AWS
- `npm run dev` - Build and start local development server

## Cleanup

To remove all deployed resources from AWS:

```bash
npm run remove
# or
sls remove
```

## Environment Variables

You can set the AWS region and stage:

```bash
# Deploy to a specific region
sls deploy --region eu-west-1

# Deploy to a specific stage
sls deploy --stage production
```

## Troubleshooting

1. **TypeScript compilation errors**: Run `npm run build` to check for TypeScript errors
2. **AWS credentials**: Ensure your AWS CLI is configured with `aws configure`
3. **Permissions**: Make sure your AWS user has the necessary permissions for Lambda and API Gateway
4. **Region issues**: Check that your AWS region is correctly configured

## Next Steps

- Add more endpoints by creating new handler files in `src/handlers/`
- Add environment variables in `serverless.yml`
- Implement authentication and authorization
- Add database integration
- Set up CI/CD pipeline
