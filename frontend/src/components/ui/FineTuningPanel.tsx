"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Sparkles, Trash2, Plus, Check, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface CustomModel {
    name: string;
    size: number;
    modified_at: string;
    is_custom: boolean;
}

interface BaseModel {
    name: string;
    size: number;
}

interface FineTuningPanelProps {
    onModelCreated?: (modelName: string) => void;
}

export function FineTuningPanel({ onModelCreated }: FineTuningPanelProps) {
    const [customModels, setCustomModels] = useState<CustomModel[]>([]);
    const [baseModels, setBaseModels] = useState<BaseModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [modelName, setModelName] = useState("scio-helpdesk");
    const [selectedBaseModel, setSelectedBaseModel] = useState("llama3:8b");

    const fetchModels = async () => {
        setIsLoading(true);
        try {
            // Fetch custom models
            const customResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/finetune/models`);
            const customData = await customResponse.json();
            setCustomModels(customData);

            // Fetch base models
            const baseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/finetune/available-base-models`);
            const baseData = await baseResponse.json();
            setBaseModels(baseData.models || []);
        } catch (err) {
            console.error("Failed to fetch models:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const handleCreateModel = async () => {
        if (!modelName.trim()) {
            setError("Please enter a model name");
            return;
        }

        setIsCreating(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/finetune/create-model`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: modelName,
                    base_model: selectedBaseModel,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(`Model "${modelName}" created successfully!`);
                setShowCreateForm(false);
                fetchModels();
                onModelCreated?.(modelName);
            } else {
                setError(data.error || "Failed to create model");
            }
        } catch (err) {
            setError("Failed to create model. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteModel = async (name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/finetune/models/${name}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSuccess(`Model "${name}" deleted`);
                fetchModels();
            } else {
                setError("Failed to delete model");
            }
        } catch (err) {
            setError("Failed to delete model");
        }
    };

    const formatSize = (bytes: number) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(1)} GB`;
    };

    return (
        <div className="glass-card rounded-2xl p-6 border border-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-accent-500/20">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Fine-tuning</h3>
                        <p className="text-sm text-dark-400">Create custom IT Helpdesk models</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl",
                        "bg-accent-500/20 hover:bg-accent-500/30 text-accent-300",
                        "transition-all duration-200",
                        showCreateForm && "bg-dark-700 text-dark-300"
                    )}
                >
                    <Plus className="w-4 h-4" />
                    <span>New Model</span>
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-300">{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">{success}</span>
                </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="mb-6 p-4 rounded-xl bg-dark-800/50 border border-dark-700 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Model Name
                        </label>
                        <input
                            type="text"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            placeholder="scio-helpdesk"
                            className="w-full px-4 py-2 rounded-lg bg-dark-900 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Base Model
                        </label>
                        <select
                            value={selectedBaseModel}
                            onChange={(e) => setSelectedBaseModel(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-dark-900 border border-dark-700 text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        >
                            {baseModels.map((model) => (
                                <option key={model.name} value={model.name}>
                                    {model.name} ({formatSize(model.size)})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleCreateModel}
                        disabled={isCreating}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                            "bg-gradient-to-r from-purple-500 to-accent-500 text-white font-medium",
                            "hover:from-purple-600 hover:to-accent-600",
                            "transition-all duration-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating Model...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                <span>Create Custom Model</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Models List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8 text-dark-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Loading models...</span>
                    </div>
                ) : customModels.length === 0 ? (
                    <div className="text-center py-8 text-dark-400">
                        <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No custom models yet</p>
                        <p className="text-sm">Create your first IT Helpdesk model!</p>
                    </div>
                ) : (
                    customModels.map((model) => (
                        <div
                            key={model.name}
                            className="flex items-center justify-between p-4 rounded-xl bg-dark-800/30 border border-dark-700 hover:bg-dark-800/50 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                    <Cpu className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{model.name}</p>
                                    <p className="text-xs text-dark-400">{formatSize(model.size)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteModel(model.name)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FineTuningPanel;
