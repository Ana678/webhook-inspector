import { createFileRoute } from '@tanstack/react-router';
import { WebhookDetails } from '../components/webhook-details';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';


export const Route = createFileRoute('/webhooks/$id')({
    component: RouteComponent,
});


function RouteComponent() {

    const { id } = Route.useParams();

    return (
        <Suspense fallback={

            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                    <Loader2 className="size-5 animate-spin text-zinc-500" />
                </div>
            </div>
        }>
            <WebhookDetails id={id} />
        </Suspense>

    );
}
