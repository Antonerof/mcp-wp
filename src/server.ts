#!/usr/bin/env node
// src/server.ts
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env first

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { allTools, toolHandlers } from './tools/index.js';
import { z } from 'zod';


// Create MCP server instance
const server = new McpServer({
    name: "wordpress",
    version: "0.0.1"
}, {
    capabilities: {
        // Advertise full tool definitions (with descriptions) in handshake
        tools: allTools.reduce((acc, tool) => {
            acc[tool.name] = tool;
            return acc;
        }, {} as Record<string, any>)
    }
});

// Register each tool from our tools list with its corresponding handler
for (const tool of allTools) {
    const handler = toolHandlers[tool.name as keyof typeof toolHandlers];
    if (!handler) continue;
    
    const wrappedHandler = async (args: any) => {
        // Handlers return a consistent { toolResult: { content, isError } } shape
        const result = await handler(args);
        return {
            content: result.toolResult.content.map((item: { type: string; text: string }) => ({
                ...item,
                type: "text" as const
            })),
            isError: result.toolResult.isError
        };
    };
    
    // console.log(`Registering tool: ${tool.name}`);
    // console.log(`Input schema: ${JSON.stringify(tool.inputSchema)}`);

    // const zodSchema = z.any().optional();
    // const jsonSchema = zodToJsonSchema(z.object(tool.inputSchema.properties as z.ZodRawShape));

    // const schema = z.object(tool.inputSchema as z.ZodRawShape).catchall(z.unknown());
    
    // Register tool with validation schema; descriptions are provided via capabilities above
    const zodSchema = z.object(tool.inputSchema.properties as z.ZodRawShape);
    if (tool.description) {
        server.tool(tool.name, tool.description, zodSchema.shape, wrappedHandler);
    } else {
        server.tool(tool.name, zodSchema.shape, wrappedHandler);
    }

}

async function main() {
    const { logToFile } = await import('./wordpress.js');

    logToFile('Starting WordPress MCP server...');
    
    if (!process.env.WORDPRESS_API_URL) {
        logToFile('Missing required environment variables. Please check your .env file.');
        process.exit(1);
    }

    try {
        logToFile('Initializing WordPress client...');
        const { initWordPress } = await import('./wordpress.js');
        await initWordPress();
        logToFile('WordPress client initialized successfully.');

        logToFile('Setting up server transport...');
        const transport = new StdioServerTransport();
        await server.connect(transport);
        logToFile('WordPress MCP Server running on stdio');
    } catch (error) {
        logToFile(`Failed to initialize server: ${error}`);
        process.exit(1);
    }
}

// Handle process signals and errors
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('Received SIGINT signal, shutting down...');
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);
});

main().catch((error) => {
    console.error('Startup error:', error);
    process.exit(1);
});