# Dockerfile Basics Exercise

## Objective
Create a Dockerfile for a simple TypeScript/Node.js application.

## Instructions
1. Create a Dockerfile that:
   - Uses an appropriate Node.js base image
   - Sets the working directory
   - Copies package files
   - Installs dependencies
   - Copies source code
   - Exposes the appropriate port
   - Defines the startup command

## Starter Files
You have a simple Express application in `src/`:
- `src/index.ts` - Basic Express server
- `package.json` - Dependencies including express and @types/express
- `tsconfig.json` - TypeScript configuration

## Requirements
- Use `node:18-alpine` or `node:20-alpine` as base image
- Set working directory to `/app`
- Copy `package.json` and `package-lock.json` before installing dependencies
- Use `npm ci` for clean installation
- Expose port 3000
- Use `npm start` as the default command

## Hints
- Remember to compile TypeScript to JavaScript before running
- You may need to add a build step in your Dockerfile
- Consider using multi-stage builds for smaller final images

## Validation
Once you've created your Dockerfile, you should be able to:
1. Build the image: `docker build -t typescript-app .`
2. Run the container: `docker run -p 3000:3000 typescript-app`
3. Access the application at http://localhost:3000

## Solution Structure
```
.
├── Dockerfile
├── package.json
├── package-lock.json
├── src/
│   └── index.ts
└── tsconfig.json
```