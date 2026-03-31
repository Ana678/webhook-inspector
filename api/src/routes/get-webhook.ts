import { db } from '@/db';
import { webhooks } from '@/db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { eq } from 'drizzle-orm';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const getWebhook: FastifyPluginAsyncZod = async (app) => {

    app.get('/api/webhooks/:id',
        {
            schema: { // validation and documentation of endpoint
                summary: 'Get Webhook',
                description: 'Returns a specific webhook by ID',
                tags: ['Webhooks'],
                params: z.object({
                    id: z.uuidv7(),
                }),
                response: {
                    200: createSelectSchema(webhooks),
                    404: z.object({ message: z.string() })
                }
            }
        },
        async (request, reply) => {
            const { id } = request.params;

            const result = await db
                .select()
                .from(webhooks)
                .where(eq(webhooks.id, id))
                .limit(1);

            if (result.length === 0) {
                return reply.status(404).send({ message: 'Webhook not found' });
            }

            return reply.send(result[0]);
        }
    );
}
