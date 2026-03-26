import { fastify } from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
    jsonSchemaTransform,
    type ZodTypeProvider
} from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import { fastifyCors } from '@fastify/cors';
import ScalarApiReference from '@scalar/fastify-api-reference';
import { listWebhooks } from './routes/list-webhooks';
import { env } from './env';


const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {

    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // credentials: true, ===> allows cookies to be sent in cross-origin requests

});

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Webhook Inspector API',
            description: 'API for capturing and inspecting webhook requests',
            version: '1.0.0'
        }
    },
    transform: jsonSchemaTransform, // This will transform Zod schemas to OpenAPI schemas
});

app.register(ScalarApiReference, {

    routePrefix: '/docs',
});

app.register(listWebhooks);

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
    console.log('🔥 Http Server is running on http://localhost:' + env.PORT);
    console.log('📚 Docs available at http://localhost:' + env.PORT + '/docs');
});
