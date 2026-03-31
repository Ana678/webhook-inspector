import { db } from '@/db';
import { webhooks } from '@/db/schema';
import { createSelectSchema } from 'drizzle-zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { lt, desc } from 'drizzle-orm';

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {

    app.get('/api/webhooks',
        {
            schema: { // validation and documentation of endpoint
                summary: 'List Webhooks',
                description: 'Returns a list of all captured webhooks',
                tags: ['Webhooks'],
                querystring: z.object({
                    limit: z.coerce.number().min(1).max(100).default(20),
                    cursor: z.string().optional(),
                }),
                response: {
                    200: z.object({
                        webhooks: z.array(
                            createSelectSchema(webhooks).pick({
                                id: true,
                                method: true,
                                pathname: true,
                                createdAt: true,
                            })
                        ),
                        nextCursor: z.string().nullable(), // nullable because it can be null if there are no more results
                    })

                }
            }

        },
        async (request, reply) => {
            const { limit, cursor } = request.query;

            const result = await db
                .select({
                    id: webhooks.id,
                    method: webhooks.method,
                    pathname: webhooks.pathname,
                    createdAt: webhooks.createdAt,
                })
                .from(webhooks)
                .where(cursor ? lt(webhooks.id, cursor) : undefined)
                .orderBy(desc(webhooks.id))
                .limit(limit + 1); // fetch one extra to determine if there is a next page

            const hasMore = result.length > limit;
            const items = hasMore ? result.slice(0, limit) : result; // remove the extra item if there are more
            const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null; // use the id of the last item as the next cursor

            return reply.send({ webhooks: items, nextCursor });
        },
    );

}
