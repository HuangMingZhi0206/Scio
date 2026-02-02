"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  ArrowUpDown,
  ArrowLeft,
  MoreHorizontal,
  Star,
  Clock,
  Send,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  instructions: string;
  files: string[];
  conversations: { id: string; title: string; lastMessage: string }[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectsDashboardProps {
  onNewProject?: () => void;
  onBackToChat?: () => void;
}

export function ProjectsDashboard({
  onNewProject,
  onBackToChat,
}: ProjectsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"activity" | "name">("activity");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [replyText, setReplyText] = useState("");

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        instructions: "",
        files: [],
        conversations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProjects([newProject, ...projects]);
      setNewProjectName("");
      setShowNewProjectModal(false);
      setSelectedProject(newProject);
    }
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Project Detail View
  if (selectedProject) {
    return (
      <div className="flex-1 flex min-h-0">
        {/* Left side - Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Back button and project header */}
          <div className="px-6 py-4">
            <button
              onClick={handleBackToProjects}
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-500 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All projects</span>
            </button>

            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-white">
                {selectedProject.name}
              </h1>
              <div className="flex items-center gap-2">
                <button className="p-2 text-dark-400 hover:text-dark-200 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <button className="p-2 text-dark-400 hover:text-dark-200 transition-colors">
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat input */}
          <div className="px-6 pb-4">
            <div className="bg-dark-900/80 rounded-xl border border-dark-700/60 overflow-hidden">
              <div className="px-4 py-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply..."
                  className="w-full bg-transparent text-white placeholder:text-dark-500 outline-none text-sm"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t border-dark-800/50">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-dark-400 hover:text-dark-200 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-dark-400 hover:text-dark-200 transition-colors">
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dark-500">Llama 3.2</span>
                  <button className="p-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 px-6 overflow-y-auto">
            {selectedProject.conversations.length > 0 ? (
              <div className="space-y-2">
                {selectedProject.conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-lg bg-dark-800/40 hover:bg-dark-800/60 cursor-pointer transition-colors"
                  >
                    <p className="text-sm font-medium text-white">
                      {conv.title}
                    </p>
                    <p className="text-xs text-dark-500 mt-1">
                      {conv.lastMessage}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-dark-500 text-sm">
                  No conversations yet. Start by sending a message.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Instructions & Files */}
        <div className="w-80 border-l border-dark-800/30 flex flex-col">
          {/* Instructions */}
          <div className="p-4 border-b border-dark-800/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Instructions</h3>
              <button className="p-1 text-dark-400 hover:text-dark-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-dark-500">
              Add instructions to tailor Scio's responses
            </p>
          </div>

          {/* Files */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Files</h3>
              <button className="p-1 text-dark-400 hover:text-dark-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-6 rounded-xl bg-dark-800/40 border border-dark-700/40">
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-10 h-10 rounded-lg bg-dark-700/60 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-dark-500" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-dark-700/60 flex items-center justify-center -ml-2">
                    <FileText className="w-5 h-5 text-dark-500" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-dark-500 text-center">
                Add PDFs, documents, or other text to reference in this project.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Projects List View
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800/30">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-200 hover:bg-dark-700 hover:text-white transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New project</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50">
          <Search className="w-4 h-4 text-dark-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="flex-1 bg-transparent text-white placeholder:text-dark-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center justify-end px-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-dark-500">
          <span>Sort by</span>
          <button
            onClick={() =>
              setSortBy(sortBy === "activity" ? "name" : "activity")
            }
            className="flex items-center gap-1 px-2 py-1 rounded bg-dark-800/50 border border-dark-700/50 text-dark-300 hover:text-white transition-colors"
          >
            <span>{sortBy === "activity" ? "Activity" : "Name"}</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Projects list / Empty state */}
      <div className="flex-1 flex items-center justify-center px-6">
        {filteredProjects.length === 0 && projects.length === 0 ? (
          <div className="text-center">
            {/* Empty state icon */}
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-dark-800/50 border border-dark-700/50 flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-dark-500" />
              </div>
            </div>

            <h2 className="text-lg font-medium text-white mb-2">
              Looking to start a project?
            </h2>
            <p className="text-sm text-dark-400 max-w-md mb-6">
              Upload materials, set custom instructions, and organize
              conversations in one space.
            </p>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white hover:bg-dark-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New project</span>
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-dark-500">
              No projects found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="w-full self-start py-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project)}
                  className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-dark-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FolderOpen className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-medium text-white">{project.name}</h3>
                  </div>
                  <p className="text-xs text-dark-500">
                    {project.conversations.length} conversations
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNewProjectModal(false)}
          />
          <div className="relative w-full max-w-md mx-4 bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/60 shadow-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">New Project</h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-dark-400 mb-2">
                Project name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                placeholder="Enter project name..."
                className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white placeholder:text-dark-500 outline-none focus:border-cyan-500/50 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 rounded-lg text-dark-400 hover:text-dark-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  newProjectName.trim()
                    ? "bg-cyan-500 text-white hover:bg-cyan-400"
                    : "bg-dark-800 text-dark-500 cursor-not-allowed",
                )}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsDashboard;
