"use client";

import { useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  type: "podcast" | "website" | "music" | "consulting" | "other";
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

const projectTypes = [
  { value: "podcast", label: "Podcast", icon: "🎙️" },
  { value: "website", label: "Website", icon: "🌐" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "consulting", label: "Consulting", icon: "💼" },
  { value: "other", label: "Other", icon: "📁" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/client/projects");
      if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-gray-400">
              Organize your work into projects for better management
            </p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background-card rounded-xl p-6 animate-pulse"
              >
                <div className="h-12 bg-gray-700 rounded mb-4" />
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              {error.includes("UNAUTHENTICATED")
                ? "Please sign in again to continue."
                : error.includes("FORBIDDEN")
                ? "You don't have access to view projects."
                : "Please try again later."}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-background-card rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-400 text-lg mb-4">No projects yet</p>
            <p className="text-gray-500 text-sm mb-6">
              Create your first project to organize bookings, assets, and deliverables.
            </p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSuccess={() => {
            setShowNewProjectModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const typeInfo = projectTypes.find((t) => t.value === project.type);

  return (
    <div className="bg-background-card rounded-xl p-6 hover:bg-gray-800 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{typeInfo?.icon || "📁"}</div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            project.status === "active"
              ? "bg-green-500/20 text-green-400 border-green-500/50"
              : "bg-gray-500/20 text-gray-400 border-gray-500/50"
          }`}
        >
          {project.status}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {project.description || "No description"}
      </p>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{typeInfo?.label || project.type}</span>
        <span className="text-gray-500">
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function NewProjectModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Project["type"]>("other");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/client/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create project");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background-card rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">New Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Project"
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Project Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {projectTypes.map((projectType) => (
                  <button
                    key={projectType.value}
                    type="button"
                    onClick={() => setType(projectType.value as Project["type"])}
                    className={`p-3 rounded-lg border transition-colors ${
                      type === projectType.value
                        ? "bg-primary border-primary text-white"
                        : "bg-background border-gray-700 text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    <div className="text-2xl mb-1">{projectType.icon}</div>
                    <div className="text-sm font-medium">{projectType.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your project..."
                rows={3}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-background hover:bg-gray-800 text-gray-400 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
