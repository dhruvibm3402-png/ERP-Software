import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Aura ERP - SaaS Solution',
    description: 'Enterprise Jewellery ERP built with Next.js',
};

import Providers from './providers';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <Toaster position="top-right" />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
