"use client";

import { useState, useEffect } from "react";
import { listAssets } from "@/lib/api/client";
import type { AssetFile } from "@/lib/types";

const categoryFilters = [
  { value: "all", label: "All Categories" },
  { value: "artist-services", label: "Artist Services" },
  { value: "podcast-production", label: "Podcast Production" },
  { value: "personal-brand", label: "Personal Brand" },
  { value: "other", label: "Other" },
];

export default function AssetsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assets, setAssets] = useState<(AssetFile & { category?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = categoryFilter !== "all" ? { category: categoryFilter } : undefined;
        const data = await listAssets(params);
        setAssets(data as any);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assets");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [categoryFilter]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Assets & Files
            </h1>
            <p className="text-gray-400">Access and download your project files</p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-background-card rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categoryFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setCategoryFilter(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                categoryFilter === filter.value
                  ? "bg-primary text-white"
                  : "bg-background-card text-gray-400 hover:bg-gray-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Assets Display */}
        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-background-card rounded-xl p-6 animate-pulse"
              >
                <div className="h-32 bg-gray-700 rounded mb-4" />
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
                ? "You don't have access to view assets."
                : "Please try again later."}
            </p>
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-background-card rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No files yet for this category</p>
            <p className="text-gray-500 text-sm mt-2">Assets will appear here once you upload files to your bookings.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCardGrid key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((asset) => (
              <AssetCardList key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCardGrid({ asset }: { asset: AssetFile }) {
  const fileIcon = getFileIcon(asset.fileType);

  return (
    <div className="bg-background-card rounded-xl p-6 hover:bg-gray-800 transition-colors">
      {/* File Preview */}
      <div className="bg-background rounded-xl h-32 flex items-center justify-center mb-4">
        <div className="text-5xl">{fileIcon}</div>
      </div>

      {/* File Info */}
      <div className="mb-4">
        <h3 className="text-white font-medium mb-1 truncate">{asset.fileName}</h3>
        <p className="text-gray-400 text-sm">{asset.fileType.replace("_", " ")}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{formatFileSize(asset.sizeBytes)}</span>
        <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={asset.downloadUrl}
          download
          className="flex-1 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium text-center transition-colors"
        >
          Download
        </a>
        <button className="px-4 py-2 bg-background hover:bg-gray-900 text-gray-400 rounded-lg transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AssetCardList({ asset }: { asset: AssetFile }) {
  const fileIcon = getFileIcon(asset.fileType);

  return (
    <div className="bg-background-card rounded-xl p-4 hover:bg-gray-800 transition-colors flex items-center gap-4">
      {/* Icon */}
      <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
        {fileIcon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium mb-1 truncate">{asset.fileName}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{asset.fileType.replace("_", " ")}</span>
          <span>{formatFileSize(asset.sizeBytes)}</span>
          <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        <a
          href={asset.downloadUrl}
          download
          className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          Download
        </a>
        <button className="px-4 py-2 bg-background hover:bg-gray-900 text-gray-400 rounded-lg transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function getFileIcon(fileType: string): string {
  const icons: Record<string, string> = {
    REFERENCE: "🎵",
    ROUGH_MIX: "🎧",
    FINAL_MIX: "✨",
    MASTER: "💿",
    STEMS: "🎼",
    OTHER: "📄",
  };
  return icons[fileType] || "📄";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
