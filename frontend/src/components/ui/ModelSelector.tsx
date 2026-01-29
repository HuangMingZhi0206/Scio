"use client";

import React, { useState, useEffect } from "react";
import { Cpu } from "lucide-react";
import api, { OllamaModel } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (model: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch available models
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const data = await api.getModels();
                setModels(data.models || []);
            } catch (error) {
                console.error("Failed to fetch models:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModels();
    }, []);

    const getDisplayName = (modelName: string) => {
        if (modelName.includes("gemini-2.0-flash")) return "Gemini 2.0 Flash";
        if (modelName.includes("gemini-2.5-flash")) return "Gemini 2.5 Flash";
        if (modelName.includes("gemini-flash-latest")) return "Gemini Flash Latest";
        if (modelName.includes("gemini")) return modelName.split("/").pop() || modelName;
        if (modelName.includes("llama3.2")) return "Llama 3.2";
        if (modelName.includes("llama3")) return "Llama 3";
        if (modelName.includes("scio")) return "Scio Helpdesk";
        return modelName.split(":")[0];
    };

    const getProviderBadge = (model: OllamaModel) => {
        const provider = (model as any).provider;
        if (provider === "gemini" || model.name.startsWith("gemini")) {
            return "☁️";
        }
        return "💻";
    };

    const formatSize = (bytes: number, modelName: string) => {
        // Cloud models have no local size
        if (modelName.startsWith("gemini")) return "Cloud";
        if (bytes === 0) return "";
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(1)} GB`;
    };

    return (
        <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent-400" />
            <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                disabled={isLoading}
                className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium",
                    "bg-dark-800 border border-dark-700 text-dark-200",
                    "focus:outline-none focus:ring-1 focus:ring-accent-500/50",
                    "cursor-pointer appearance-none",
                    "min-w-[180px]"
                )}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    paddingRight: '28px'
                }}
            >
                {isLoading ? (
                    <option>Loading...</option>
                ) : models.length === 0 ? (
                    <option>No models</option>
                ) : (
                    models.map((model) => (
                        <option key={model.name} value={model.name}>
                            {getProviderBadge(model)} {getDisplayName(model.name)} ({formatSize(model.size, model.name)})
                        </option>
                    ))
                )}
            </select>
        </div>
    );
}

export default ModelSelector;
