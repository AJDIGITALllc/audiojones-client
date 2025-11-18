"use client";

import { MODULES, type ModuleId } from "@/config/modules";
import type { ServiceModule } from "@/lib/types";

interface ModuleGuideProps {
  module: ServiceModule;
  onClose: () => void;
}

export default function ModuleGuide({ module, onClose }: ModuleGuideProps) {
  const config = MODULES[module as ModuleId];

  if (!config) {
    return null;
  }

  const colorClasses = {
    blue: "border-blue-500/50 bg-blue-500/10",
    purple: "border-purple-500/50 bg-purple-500/10",
    green: "border-green-500/50 bg-green-500/10",
    orange: "border-orange-500/50 bg-orange-500/10",
  };

  const iconColorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-green-500/20 text-green-400",
    orange: "bg-orange-500/20 text-orange-400",
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`p-6 border-b border-gray-800 ${colorClasses[config.color]}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${iconColorClasses[config.color]}`}>
                  {config.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{config.name}</h2>
                  <p className="text-sm text-gray-400">Module Guide</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* What this module does */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-primary"></span>
                What this module does for you
              </h3>
              <ul className="space-y-2">
                {config.guide.whatThisModuleDoes.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-300">
                    <span className="text-primary mt-1"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* You''ll need */}
            <section className="bg-background rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-accent"></span>
                You''ll need to provide
              </h3>
              <ul className="space-y-2">
                {config.guide.youllNeedToProvide.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-300">
                    <span className="text-accent mt-1"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* We track */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-support"></span>
                We track these KPIs
              </h3>
              <ul className="space-y-2">
                {config.guide.kpisWeTrack.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-300">
                    <span className="text-support mt-1"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
