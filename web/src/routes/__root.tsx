import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { Sidebar } from '../components/sidebar';

const queryClient = new QueryClient();

const RootLayout = () => (

    <QueryClientProvider client={queryClient}>

        <div className="h-screen bg-zinc-900">

            <Group orientation="horizontal" >

                <Panel defaultSize="25%" minSize="20%">
                    <Sidebar />
                </Panel>

                <Separator className="w-px bg-zinc-700 hover:bg-zinc-600 transition-colors duration-150" />

                <Panel minSize="60%">

                    <Outlet />

                </Panel>

            </Group>

        </div>
    </QueryClientProvider >

);
export const Route = createRootRoute({ component: RootLayout });
