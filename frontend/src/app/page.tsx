"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    MessageSquare,
    Brain,
    Shield,
    Zap,
    BookOpen,
    ArrowRight,
    CheckCircle,
    Sparkles,
    Server,
    Cpu,
    Users,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// Animated gradient background
const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-accent-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s' }} />
    </div>
);

// Feature card component
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}

const FeatureCard = ({ icon, title, description, gradient }: FeatureCardProps) => (
    <div className="group relative p-6 rounded-2xl bg-dark-900/50 border border-dark-700 hover:border-accent-500/50 transition-all duration-300 hover:transform hover:scale-105">
        <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
            gradient
        )}>
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-dark-400 text-sm leading-relaxed">{description}</p>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
);

// Stat card component
interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
}

const StatCard = ({ icon, value, label }: StatCardProps) => (
    <div className="text-center p-4">
        <div className="flex justify-center mb-2 text-accent-400">
            {icon}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-dark-400">{label}</div>
    </div>
);

// Typing animation for hero
const TypingAnimation = () => {
    const [text, setText] = useState("");
    const fullText = "How do I reset my Windows password?";

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) {
                setTimeout(() => {
                    index = 0;
                }, 2000);
            }
        }, 100);
        return () => clearInterval(timer);
    }, []);

    return (
        <span className="text-accent-300">
            {text}
            <span className="animate-pulse">|</span>
        </span>
    );
};

export default function HomePage() {
    return (
        <div className="min-h-screen bg-dark-950 text-white relative overflow-x-hidden overflow-y-auto">
            <AnimatedBackground />

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">
                        Scio
                    </span>
                </div>
                <Link
                    href="/chat"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 transition-all"
                >
                    <span>Launch App</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-sm mb-8">
                        <Sparkles className="w-4 h-4" />
                        <span>Powered by RAG Technology</span>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-white via-white to-dark-400 bg-clip-text text-transparent">
                            Your AI-Powered
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-accent-400 via-accent-300 to-purple-400 bg-clip-text text-transparent">
                            IT Helpdesk
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-dark-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Get instant, accurate answers to your IT questions.
                        Scio uses advanced RAG technology to provide expert-level support 24/7.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link
                            href="/chat"
                            className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold hover:from-accent-600 hover:to-accent-700 transition-all shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Start Chatting</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="#features"
                            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-dark-800/50 border border-dark-700 text-dark-200 font-semibold hover:bg-dark-800 hover:border-dark-600 transition-all"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span>Learn More</span>
                        </Link>
                    </div>

                    {/* Demo Preview */}
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-purple-500/20 rounded-3xl blur-xl" />
                        <div className="relative bg-dark-900/80 backdrop-blur-xl rounded-2xl border border-dark-700 p-6 shadow-2xl">
                            {/* Mock chat header */}
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-700">
                                <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-accent-400" />
                                </div>
                                <span className="font-medium text-dark-200">Scio Assistant</span>
                                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Online
                                </span>
                            </div>

                            {/* Mock chat messages */}
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <div className="bg-accent-500/20 text-accent-100 px-4 py-2 rounded-2xl rounded-br-md max-w-xs">
                                        <TypingAnimation />
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-dark-800 text-dark-200 px-4 py-3 rounded-2xl rounded-bl-md max-w-md text-sm">
                                        <p className="mb-2">I can help you with that! Here are the steps:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-dark-300">
                                            <li>Click Start → Settings → Accounts</li>
                                            <li>Select "Sign-in options"</li>
                                            <li>Click "Password" then "Change"</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-dark-900/30 backdrop-blur-sm rounded-2xl border border-dark-800 p-8">
                    <StatCard
                        icon={<Clock className="w-6 h-6" />}
                        value="24/7"
                        label="Available"
                    />
                    <StatCard
                        icon={<Zap className="w-6 h-6" />}
                        value="<10s"
                        label="Response Time"
                    />
                    <StatCard
                        icon={<BookOpen className="w-6 h-6" />}
                        value="1000+"
                        label="Knowledge Articles"
                    />
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        value="100%"
                        label="Local & Private"
                    />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-white to-dark-400 bg-clip-text text-transparent">
                            Why Choose Scio?
                        </span>
                    </h2>
                    <p className="text-dark-400 max-w-2xl mx-auto">
                        Built with cutting-edge technology to provide the best IT support experience
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={<Brain className="w-6 h-6 text-purple-300" />}
                        title="RAG-Powered Intelligence"
                        description="Retrieval-Augmented Generation ensures accurate, contextual answers from your knowledge base."
                        gradient="bg-gradient-to-br from-purple-500/30 to-purple-600/30"
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-yellow-300" />}
                        title="Lightning Fast"
                        description="Get instant responses to your IT queries with real-time streaming technology."
                        gradient="bg-gradient-to-br from-yellow-500/30 to-orange-500/30"
                    />
                    <FeatureCard
                        icon={<Shield className="w-6 h-6 text-green-300" />}
                        title="Secure & Private"
                        description="Runs locally with Ollama. Your data never leaves your machine."
                        gradient="bg-gradient-to-br from-green-500/30 to-emerald-500/30"
                    />
                    <FeatureCard
                        icon={<Cpu className="w-6 h-6 text-accent-300" />}
                        title="Custom Models"
                        description="Create and fine-tune custom models optimized for your specific IT environment."
                        gradient="bg-gradient-to-br from-accent-500/30 to-cyan-500/30"
                    />
                    <FeatureCard
                        icon={<BookOpen className="w-6 h-6 text-pink-300" />}
                        title="Learning System"
                        description="The chatbot learns from your feedback to provide better answers over time."
                        gradient="bg-gradient-to-br from-pink-500/30 to-rose-500/30"
                    />
                    <FeatureCard
                        icon={<Server className="w-6 h-6 text-blue-300" />}
                        title="IT Expertise"
                        description="Trained on comprehensive IT documentation covering hardware, software, and networking."
                        gradient="bg-gradient-to-br from-blue-500/30 to-indigo-500/30"
                    />
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-white to-dark-400 bg-clip-text text-transparent">
                            How It Works
                        </span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { step: "01", title: "Ask Your Question", desc: "Type your IT-related question or describe your problem" },
                        { step: "02", title: "AI Retrieves Context", desc: "Scio searches the knowledge base for relevant information" },
                        { step: "03", title: "Get Expert Answer", desc: "Receive accurate, step-by-step solutions instantly" },
                    ].map((item, i) => (
                        <div key={i} className="relative text-center">
                            <div className="text-6xl font-bold text-dark-800 mb-4">{item.step}</div>
                            <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                            <p className="text-dark-400">{item.desc}</p>
                            {i < 2 && (
                                <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2">
                                    <ArrowRight className="w-6 h-6 text-dark-700" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-purple-600" />
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <div className="relative p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Experience the future of IT support. Get instant answers to your technical questions.
                        </p>
                        <Link
                            href="/chat"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-dark-900 font-semibold hover:bg-dark-100 transition-all shadow-lg"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Launch Scio Chat</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-dark-800 py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-dark-500">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">Scio IT Helpdesk © 2024</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-dark-500">
                        <span>Powered by Ollama + RAG</span>
                        <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            100% Local
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
