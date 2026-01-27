import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Scio - IT Helpdesk AI Assistant",
    description: "Intelligent IT support powered by AI. Get instant help with troubleshooting, software setup, and more.",
    keywords: ["IT Helpdesk", "AI Assistant", "Chatbot", "RAG", "Tech Support"],
    authors: [{ name: "Scio Team" }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0f172a" />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
