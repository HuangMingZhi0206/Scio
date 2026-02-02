"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  ArrowUpDown,
  ArrowLeft,
  MoreHorizontal,
  Bookmark,
  Send,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Project } from "@/lib/types";

// Removed local Project interface as we import it now

interface ProjectsDashboardProps {
  onNewProject?: () => void;
  onBackToChat?: () => void;
  onStartChat?: (message: string, projectName?: string) => void;
  projects: Project[];
  onUpdateProjects: (projects: Project[]) => void;
  selectedProjectExternal?: Project | null;
  onClearSelectedProject?: () => void;
}

export function ProjectsDashboard({
  onNewProject,
  onBackToChat,
  onStartChat,
  projects,
  onUpdateProjects,
  selectedProjectExternal,
  onClearSelectedProject,
}: ProjectsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"activity" | "name">("activity");
  // const [projects, setProjects] = useState<Project[]>([]); // Removed local state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Sync external selection
  useEffect(() => {
    if (selectedProjectExternal) {
      setSelectedProject(selectedProjectExternal);
    }
  }, [selectedProjectExternal]);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [replyText, setReplyText] = useState("");

  // New state for dropdown menu and modals
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      onUpdateProjects([newProject, ...projects]);
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
    onClearSelectedProject?.();
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle sending a message from the project - redirects to chat
  const handleSendMessage = () => {
    if (replyText.trim() && onStartChat) {
      onStartChat(replyText.trim(), selectedProject?.name);
      setReplyText("");
    }
  };

  // Toggle star status
  const handleToggleStar = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const updated = {
      ...project,
      isStarred: !project.isStarred,
    };
    onUpdateProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProject?.id === project.id) {
      setSelectedProject(updated);
    }
  };

  // Open edit modal
  const handleOpenEdit = (project: Project) => {
    setProjectToEdit(project);
    setEditProjectName(project.name);
    setShowEditModal(true);
    setShowDropdown(false);
    setActiveDropdownId(null);
  };

  // Save edited project name
  const handleSaveEdit = () => {
    if (projectToEdit && editProjectName.trim()) {
      const updated = {
        ...projectToEdit,
        name: editProjectName.trim(),
        updatedAt: new Date(),
      };
      onUpdateProjects(
        projects.map((p) => (p.id === updated.id ? updated : p)),
      );
      if (selectedProject?.id === projectToEdit.id) {
        setSelectedProject(updated);
      }
      setShowEditModal(false);
      setProjectToEdit(null);
    }
  };

  // Archive project handler removed per user request

  // Delete project
  const handleDelete = () => {
    if (projectToDelete) {
      onUpdateProjects(projects.filter((p) => p.id !== projectToDelete.id));
      if (selectedProject?.id === projectToDelete.id) {
        setSelectedProject(null);
      }
      setProjectToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Project Detail View
  if (selectedProject) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-white">
                {selectedProject.name}
              </h1>
              {selectedProject.isStarred && (
                <Bookmark className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                    <button
                      onClick={() => handleOpenEdit(selectedProject)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit details</span>
                    </button>

                    <button
                      onClick={() => {
                        setProjectToDelete(selectedProject);
                        setShowDeleteConfirm(true);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-dark-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bookmark Button */}
              <button
                onClick={(e) => handleToggleStar(e, selectedProject)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  selectedProject.isStarred
                    ? "text-cyan-400 hover:text-cyan-300"
                    : "text-dark-400 hover:text-dark-200 hover:bg-dark-800/50",
                )}
              >
                <Bookmark
                  className={cn(
                    "w-5 h-5",
                    selectedProject.isStarred && "fill-cyan-400",
                  )}
                />
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
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={`Ask about ${selectedProject.name}...`}
                className="w-full bg-transparent text-white placeholder:text-dark-500 outline-none text-sm"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t border-dark-800/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-dark-500">
                  Project: {selectedProject.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-dark-500">Llama 3.2</span>
                <button
                  onClick={handleSendMessage}
                  disabled={!replyText.trim()}
                  className="p-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                  <p className="text-sm font-medium text-white">{conv.title}</p>
                  <p className="text-xs text-dark-500 mt-1">
                    {conv.lastMessage}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-dark-800/50 border border-dark-700/50 flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-dark-500" />
              </div>
              <p className="text-dark-400 text-sm mb-2">No conversations yet</p>
              <p className="text-dark-500 text-xs">
                Start by typing a message above to chat about this project.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Projects List View
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-dark-950/50 backdrop-blur-3xl">
      {/* Search bar + New Project */}
      <div className="px-6 py-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50">
            <Search className="w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="flex-1 bg-transparent text-white placeholder:text-dark-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors text-sm font-medium shadow-lg shadow-cyan-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
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
                  className="group relative p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-cyan-500/30 hover:bg-dark-800/80 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-dark-800 border border-dark-700 group-hover:border-cyan-500/30 transition-colors">
                      <FolderOpen className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Bookmark action */}
                      <button
                        onClick={(e) => handleToggleStar(e, project)}
                        className={cn(
                          "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-dark-700",
                          project.isStarred
                            ? "opacity-100 text-cyan-400"
                            : "text-dark-400",
                        )}
                      >
                        <Bookmark
                          className={cn(
                            "w-4 h-4",
                            project.isStarred && "fill-cyan-400",
                          )}
                        />
                      </button>

                      {/* Menu action */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(
                              activeDropdownId === project.id
                                ? null
                                : project.id,
                            );
                          }}
                          className={cn(
                            "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-dark-700 text-dark-400",
                            activeDropdownId === project.id &&
                              "opacity-100 bg-dark-700 text-white",
                          )}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeDropdownId === project.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-dark-900 border border-dark-700 rounded-lg shadow-xl overflow-hidden z-20 animate-fade-in">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(project);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dark-200 hover:bg-dark-800 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProjectToDelete(project);
                                setShowDeleteConfirm(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-dark-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="font-medium text-white mb-1 truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-dark-500">
                    {project.conversations.length} conversations
                  </p>
                </div>
              ))}
              {/* Click outside to close active dropdowns in list */}
              {activeDropdownId && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setActiveDropdownId(null)}
                />
              )}
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

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-md mx-4 bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/60 shadow-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Edit Project</h2>
              <button
                onClick={() => setShowEditModal(false)}
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
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                placeholder="Enter project name..."
                className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white placeholder:text-dark-500 outline-none focus:border-cyan-500/50 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg text-dark-400 hover:text-dark-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editProjectName.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  editProjectName.trim()
                    ? "bg-cyan-500 text-white hover:bg-cyan-400"
                    : "bg-dark-800 text-dark-500 cursor-not-allowed",
                )}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md mx-4 bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/60 shadow-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Delete Project
              </h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <p className="text-dark-300 text-center">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {projectToDelete?.name}
                </span>
                ?
              </p>
              <p className="text-dark-500 text-sm text-center mt-2">
                This action cannot be undone. All conversations in this project
                will be permanently deleted.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-dark-400 hover:text-dark-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsDashboard;
