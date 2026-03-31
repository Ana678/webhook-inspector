import { faker } from '@faker-js/faker';
import { db } from '@/db';
import { webhooks } from '@/db/schema';

const WEBHOOKS_COUNT = 72;

const stripeEventTypes = [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'payment_intent.canceled',
    'payment_intent.requires_action',
    'charge.succeeded',
    'charge.failed',
    'charge.refunded',
    'invoice.created',
    'invoice.finalized',
    'invoice.paid',
    'invoice.payment_failed',
    'invoice.upcoming',
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'checkout.session.completed',
    'checkout.session.expired',
    'payment_method.attached',
    'payout.paid',
    'payout.failed',
    'balance.available',
] as const;

type StripeEventType = (typeof stripeEventTypes)[number];

type WebhookInsert = typeof webhooks.$inferInsert;

function stripeLikeId(prefix: string, size = 24) {
    const suffix = faker.string.alphanumeric({
        length: size,
        casing: 'lower',
        exclude: ['_'],
    });

    return `${prefix}_${suffix}`;
}

function buildStripeDataObject(eventType: StripeEventType) {
    const amount = faker.number.int({ min: 1000, max: 250000 });
    const currency = faker.helpers.arrayElement(['brl', 'usd', 'eur']);

    if (eventType.startsWith('invoice.')) {
        return {
            id: stripeLikeId('in'),
            object: 'invoice',
            amount_due: amount,
            amount_paid: eventType === 'invoice.paid' ? amount : 0,
            currency,
            customer: stripeLikeId('cus', 14),
            subscription: stripeLikeId('sub', 14),
            status: faker.helpers.arrayElement(['draft', 'open', 'paid', 'uncollectible']),
        };
    }

    if (eventType.startsWith('payment_intent.')) {
        return {
            id: stripeLikeId('pi'),
            object: 'payment_intent',
            amount,
            currency,
            customer: stripeLikeId('cus', 14),
            payment_method: stripeLikeId('pm', 14),
            status: faker.helpers.arrayElement([
                'requires_payment_method',
                'requires_action',
                'processing',
                'succeeded',
                'canceled',
            ]),
        };
    }

    if (eventType.startsWith('charge.')) {
        return {
            id: stripeLikeId('ch'),
            object: 'charge',
            amount,
            currency,
            customer: stripeLikeId('cus', 14),
            paid: eventType === 'charge.succeeded',
            captured: faker.datatype.boolean(),
            refunded: eventType === 'charge.refunded',
        };
    }

    if (eventType.startsWith('checkout.session.')) {
        return {
            id: stripeLikeId('cs', 26),
            object: 'checkout.session',
            amount_total: amount,
            currency,
            customer: stripeLikeId('cus', 14),
            payment_status: faker.helpers.arrayElement(['paid', 'unpaid', 'no_payment_required']),
            mode: faker.helpers.arrayElement(['payment', 'subscription']),
        };
    }

    if (eventType.startsWith('customer.subscription.')) {
        return {
            id: stripeLikeId('sub', 14),
            object: 'subscription',
            customer: stripeLikeId('cus', 14),
            status: faker.helpers.arrayElement([
                'trialing',
                'active',
                'past_due',
                'canceled',
                'unpaid',
            ]),
            current_period_end: faker.date.soon({ days: 30 }).toISOString(),
            cancel_at_period_end: faker.datatype.boolean(),
        };
    }

    if (eventType.startsWith('payout.')) {
        return {
            id: stripeLikeId('po', 14),
            object: 'payout',
            amount,
            currency,
            arrival_date: faker.date.soon({ days: 7 }).toISOString(),
            status: eventType === 'payout.paid' ? 'paid' : 'failed',
        };
    }

    if (eventType.startsWith('payment_method.')) {
        return {
            id: stripeLikeId('pm', 14),
            object: 'payment_method',
            customer: stripeLikeId('cus', 14),
            type: faker.helpers.arrayElement(['card', 'boleto', 'pix']),
        };
    }

    if (eventType.startsWith('customer.')) {
        return {
            id: stripeLikeId('cus', 14),
            object: 'customer',
            email: faker.internet.email().toLowerCase(),
            name: faker.person.fullName(),
            delinquent: faker.datatype.boolean(),
        };
    }

    return {
        id: stripeLikeId('bal', 14),
        object: 'balance',
        available: [
            {
                amount,
                currency,
                source_types: { card: amount },
            },
        ],
    };
}

function buildWebhookRecord(): WebhookInsert {
    const eventType = faker.helpers.arrayElement(stripeEventTypes);
    const requestId = stripeLikeId('req', 20);
    const eventPayload = {
        id: stripeLikeId('evt'),
        object: 'event',
        api_version: '2025-01-27.acacia',
        created: Math.floor(faker.date.recent({ days: 30 }).getTime() / 1000),
        livemode: faker.datatype.boolean(0.2),
        pending_webhooks: faker.number.int({ min: 1, max: 5 }),
        request: {
            id: requestId,
            idempotency_key: faker.string.uuid(),
        },
        type: eventType,
        data: {
            object: buildStripeDataObject(eventType),
        },
    };

    const body = JSON.stringify(eventPayload, null, 2);

    return {
        method: 'POST',
        pathname: '/api/webhooks/stripe',
        ip: faker.internet.ip(),
        statusCode: faker.helpers.weightedArrayElement([
            { value: 200, weight: 88 },
            { value: 202, weight: 7 },
            { value: 400, weight: 3 },
            { value: 500, weight: 2 },
        ]),
        contentType: 'application/json',
        contentLength: Buffer.byteLength(body, 'utf8'),
        queryParams: {
            source: 'stripe',
            livemode: String(eventPayload.livemode),
            account: stripeLikeId('acct', 12),
        },
        headers: {
            'content-type': 'application/json',
            'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
            'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.hexadecimal({ length: 64, casing: 'lower', prefix: '' })}`,
            'request-id': requestId,
            'stripe-event-type': eventType,
        },
        body,
        createdAt: faker.date.recent({ days: 30 }),
    };
}

async function run() {
    const records = Array.from({ length: WEBHOOKS_COUNT }, () => buildWebhookRecord());

    await db.delete(webhooks);
    const inserted = await db.insert(webhooks).values(records).returning({ id: webhooks.id });

    console.log(`Seed complete: ${inserted.length} webhooks Stripe inseridos.`);
}

run()
    .catch((error) => {
        console.error('Erro ao rodar seed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$client.end();
    });
