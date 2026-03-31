import { db } from '@/db';
import { webhooks } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const generateHandler: FastifyPluginAsyncZod = async (app) => {

    app.post('/api/generate',
        {
            schema: {
                summary: 'Generate Handler',
                description: 'Generates a handler for the specified webhooks',
                tags: ['Webhooks'],
                body: z.object({
                    webhooksIds: z.array(z.string()),
                }),
                response: {
                    201: z.object({
                        code: z.string()
                    }),
                }
            }
        },
        async (request, reply) => {
            const { webhooksIds } = request.body;

            const result = await db
                .select({
                    body: webhooks.body,
                })
                .from(webhooks)
                .where(inArray(webhooks.id, webhooksIds));

            const webhookBodies = result.map(webhook => webhook.body).join('\n\n');

            const { text } = await generateText({
                model: google('gemini-2.5-flash-lite'),
                prompt: `
                    You are an expert TypeScript developer specializing in webhook handlers and API integrations.

                    Your task is to analyze the webhook request bodies provided below and generate a complete TypeScript webhook handler with Zod validation schemas.

                    Requirements:
                    1. Analyze all provided webhook payloads and identify unique event types
                    2. Create individual Zod schemas for each event type payload
                    3. Generate a union type combining all possible event schemas
                    4. Implement a main handler function that:
                    - Accepts the webhook payload as input
                    - Validates it against the union schema using Zod
                    - Returns a discriminated union function that routes to specific handlers based on event type
                    - Includes proper error handling for validation failures

                    Output Format:
                    - Start with all Zod schemas (one per event type)
                    - Create a union schema combining all events
                    - Export a main handleWebhook function that validates and routes events
                    - Include TypeScript types inferred from Zod schemas
                    - Add JSDoc comments explaining each schema and handler

                    Webhook Payloads:

                    ${webhookBodies}

                    Generate clean, production-ready TypeScript code following these conventions:
                    - Use strict Zod parsing with proper error messages
                    - Include discriminator fields in the union for type narrowing
                    - Export all schemas and types for reuse
                    - Handle edge cases and missing optional fields
                    - Format with proper indentation and comments

                    Return only the code and do not return \`\`\`typescript or any others markdowns symbols, do not include any instructions or text before or after the code.
                `.trim()

            });

            return reply.status(201).send({ code: text });
        }
    );
};
