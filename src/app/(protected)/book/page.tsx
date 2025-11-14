"use client";

import { useState, useEffect } from "react";
import { listServices } from "@/lib/api/client";
import type { ServiceSummary } from "@/lib/types";
import BookingWizard from "@/components/BookingWizard";

const categories = [
  { value: "ALL", label: "All Services" },
  { value: "ARTIST", label: "Artist Services" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "STRATEGY", label: "Strategy" },
  { value: "PRODUCTION", label: "Production" },
  { value: "SMB", label: "SMB" },
  { value: "OTHER", label: "Other" },
];

export default function BookSessionPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceSummary | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = selectedCategory !== "ALL" ? { category: selectedCategory } : undefined;
        const data = await listServices(params);
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book a Session</h1>
          <p className="text-gray-400">Choose a service to get started</p>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? "bg-primary text-white"
                  : "bg-background-card text-gray-400 hover:bg-gray-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-background-card rounded-xl p-6 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-700 rounded-lg mb-4" />
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-full mb-4" />
                <div className="h-10 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-background-card rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No services found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => setSelectedService(service)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Wizard Modal */}
      {selectedService && (
        <BookingWizard
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

function ServiceCard({
  service,
  onClick,
}: {
  service: ServiceSummary;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-background-card rounded-xl p-6 hover:bg-gray-800 transition-colors cursor-pointer group"
    >
      {/* Icon & Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
          {service.iconEmoji || "🎵"}
        </div>
        {service.badgeLabel && (
          <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
            {service.badgeLabel}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
        {service.name}
      </h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {service.description}
      </p>

      {/* Details */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        {service.durationLabel && (
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {service.durationLabel}
          </span>
        )}
        {service.modeLabel && (
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            {service.modeLabel}
          </span>
        )}
      </div>

      {/* Price & CTA */}
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold text-lg">
          {service.priceLabel}
        </span>
        <span className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
          Book Now
        </span>
      </div>
    </div>
  );
}
