import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { WebhooksListItem } from "./webhooks-list-item";
import { webhooksListSchema } from "../http/schemas/webhooks";
import { Loader2, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CodeBlock } from "./ui/code-block";

export function WebhooksList() {

    // save info without triggering a new render, because we don't need to update the UI when this ref changes
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver>(null);


    const [checkedWebhookIds, setCheckedWebhookIds] = useState<string[]>([]);
    const [generatedHandlerCode, setGeneratedHandlerCode] = useState<string | null>(null);


    const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
        queryKey: ['webhooks'],
        queryFn: async ({ pageParam }) => {

            const url = new URL('http://localhost:3333/api/webhooks');

            if (pageParam) {
                url.searchParams.set('cursor', pageParam);
            }

            const response = await fetch(url);
            const data = await response.json();

            return webhooksListSchema.parse(data);
        },
        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor ?? undefined; // undefined indicates there are no more pages to load
        },
        initialPageParam: undefined as string | undefined, // because in the first load, we don't have a cursor yet

    });

    const allWebhooks = data.pages.flatMap(page => page.webhooks); // many levels to flatten

    useEffect(() => {

        if (observerRef.current) {
            observerRef.current.disconnect(); // disconnect the previous observer before creating a new one
        }

        observerRef.current = new IntersectionObserver(entries => {
            const entry = entries[0];

            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, {
            threshold: 0.1, // trigger when the entire element
        }

        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    function handleWebhookChecked(webhookId: string) {

        if (checkedWebhookIds.includes(webhookId)) {
            setCheckedWebhookIds(state => {
                return state.filter((id) => id !== webhookId);
            });
        } else {
            setCheckedWebhookIds(state => {
                return [...state, webhookId];
            });
        }
    }

    async function handleGenerateHandler() {

        const response = await fetch('http://localhost:3333/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ webhooksIds: checkedWebhookIds }),
        });

        type GenerateResponse = { code: string };

        const data: GenerateResponse = await response.json();

        setGeneratedHandlerCode(data.code);

    }

    const hasAnyWebhookChecked = checkedWebhookIds.length > 0;

    return (
        <>
            <div className="flex-1 overflow-y-auto ">

                <div className="space-y-1 p-2">

                    <div className="flex bottom-0 left-0 right-0 p-4 flex-col items-center gap-2">
                        <button
                            onClick={handleGenerateHandler}
                            disabled={!hasAnyWebhookChecked}
                            className="w-full bg-indigo-400 text-white size-10 rounded-lg flex items-center justify-center gap-3 font-medium text-sm p-2.5 disabled:opacity-50">
                            <Wand2 className="size-4" />
                            Gerar Handler
                        </button>
                        {hasAnyWebhookChecked && (
                            <p className="text-sm text-zinc-500">
                                {checkedWebhookIds.length}  {checkedWebhookIds.length === 1 ? 'webhook selecionado' : 'webhooks selecionados'}
                            </p>
                        )}
                    </div>


                    {allWebhooks.map((webhook) => (
                        <WebhooksListItem
                            key={webhook.id}
                            webhook={webhook}
                            onWebhookChecked={handleWebhookChecked}
                            isWebhookChecked={checkedWebhookIds.includes(webhook.id)} />
                    ))}

                </div>

                {
                    hasNextPage && (

                        <div className="p-2" ref={loadMoreRef}>
                            {isFetchingNextPage && (
                                <div className="flex items-center justify-center p-2">
                                    <Loader2 className="size-5 animate-spin text-zinc-500" />
                                </div>
                            )}
                        </div>
                    )
                }

            </div >

            {!!generatedHandlerCode && (
                <Dialog.Root defaultOpen>
                    <Dialog.Overlay className="bg-black/60 fixed z-20" />

                    <Dialog.Content className="flex items-center justify-center fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[85vh] w-[90vw] z-40">
                        <div className="bg-zinc-900 w-[70%] rounded-lg border border-zinc-800 max-h-[80vh] overflow-y-auto p-4">
                            <Dialog.Title className="text-sm font-bold mb-4">Generated Handler Code</Dialog.Title>

                            <CodeBlock language="typescript" code={generatedHandlerCode} />
                        </div>
                    </Dialog.Content>
                </Dialog.Root >
            )
            }
        </>
    )
}
