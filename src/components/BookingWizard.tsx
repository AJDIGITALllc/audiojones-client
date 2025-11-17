"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking, uploadBookingAsset } from "@/lib/api/client";
import { fireAutomationEvent } from "@/lib/automation";
import type { ServiceSummary } from "@/lib/types";
import { MODULE_PREFLIGHT, type PreflightItem } from "@/lib/preflight";

type WizardStep = "service" | "details" | "schedule" | "files" | "preflight" | "review" | "payment" | "scheduling-link" | "confirmation";

interface BookingFormData {
  serviceId: string;
  serviceName: string;
  notes: string;
  scheduledDate: string;
  files: File[];
  bookingId?: string;
  paymentUrl?: string | null;
  paymentProvider?: string;
  preflightChecked?: Record<string, boolean>;
}

export default function BookingWizard({
  service,
  onClose,
}: {
  service: ServiceSummary;
  onClose: () => void;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>("details");
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: service.id,
    serviceName: service.name,
    notes: "",
    scheduledDate: "",
    files: [],
    preflightChecked: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Include preflight step only if service has a module
  const steps: WizardStep[] = service.module 
    ? ["details", "schedule", "files", "preflight", "review"]
    : ["details", "schedule", "files", "review"];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create booking
      const response = await createBooking({
        serviceId: formData.serviceId,
        variantId: "default",
        startAt: formData.scheduledDate || new Date().toISOString(),
        intake: {
          notes: formData.notes,
        },
      }) as any;

      // Store booking ID and payment info for later steps
      setFormData({ 
        ...formData, 
        bookingId: response.bookingId,
        paymentUrl: response.paymentUrl || null,
        paymentProvider: response.paymentProvider || 'none',
      });

      // Upload files
      for (const file of formData.files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("fileType", "REFERENCE");
        await uploadBookingAsset(response.bookingId, fd);
      }

      // Fire automation event
      await fireAutomationEvent({
        type: "booking.created",
        bookingId: response.bookingId,
        tenantId: service.tenantId,
        payload: {
          serviceId: formData.serviceId,
        },
      });

      // Determine next step based on payment and scheduling
      if (response.paymentUrl && (response.paymentProvider === 'whop' || response.paymentProvider === 'stripe')) {
        setCurrentStep("payment");
      } else if (service.schedulingUrl) {
        setCurrentStep("scheduling-link");
      } else {
        setCurrentStep("confirmation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Book: {service.name}
              </h2>
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

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      idx <= currentStepIndex
                        ? "bg-primary text-white"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        idx < currentStepIndex ? "bg-primary" : "bg-gray-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {currentStep === "details" && (
              <StepDetails formData={formData} setFormData={setFormData} />
            )}
            {currentStep === "schedule" && (
              <StepSchedule formData={formData} setFormData={setFormData} />
            )}
            {currentStep === "files" && (
              <StepFiles formData={formData} setFormData={setFormData} />
            )}
            {currentStep === "preflight" && service.module && (
              <StepPreflight formData={formData} setFormData={setFormData} module={service.module} />
            )}
            {currentStep === "review" && (
              <StepReview formData={formData} service={service} />
            )}
            {currentStep === "payment" && (
              <StepPayment formData={formData} />
            )}
            {currentStep === "scheduling-link" && (
              <StepSchedulingLink service={service} />
            )}
            {currentStep === "confirmation" && (
              <StepConfirmation formData={formData} />
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800 flex items-center justify-between">
            {currentStep !== "payment" && currentStep !== "scheduling-link" && currentStep !== "confirmation" && (
              <button
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="px-6 py-2 bg-background hover:bg-gray-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            )}
            {currentStep === "review" ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Booking"}
              </button>
            ) : currentStep === "payment" ? (
              <button
                onClick={() => {
                  if (service.schedulingUrl) {
                    setCurrentStep("scheduling-link");
                  } else {
                    setCurrentStep("confirmation");
                  }
                }}
                className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            ) : currentStep === "scheduling-link" ? (
              <button
                onClick={() => setCurrentStep("confirmation")}
                className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            ) : currentStep === "confirmation" ? (
              <button
                onClick={() => {
                  router.push("/bookings");
                  onClose();
                }}
                className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StepDetails({
  formData,
  setFormData,
}: {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Booking Details
        </h3>
        <p className="text-gray-400">Tell us about your project</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Project Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Describe your project, goals, and any special requirements..."
          rows={6}
          className="w-full px-4 py-3 bg-background border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

function StepSchedule({
  formData,
  setFormData,
}: {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Schedule Session
        </h3>
        <p className="text-gray-400">Choose a preferred date (optional)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Preferred Date
        </label>
        <input
          type="date"
          value={formData.scheduledDate}
          onChange={(e) =>
            setFormData({ ...formData, scheduledDate: e.target.value })
          }
          className="w-full px-4 py-3 bg-background border border-gray-800 rounded-lg text-white focus:outline-none focus:border-primary"
        />
        <p className="mt-2 text-sm text-gray-500">
          We'll confirm the exact date and time after reviewing your booking
        </p>
      </div>
    </div>
  );
}

function StepFiles({
  formData,
  setFormData,
}: {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        files: Array.from(e.target.files),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Upload Reference Files
        </h3>
        <p className="text-gray-400">
          Upload any reference tracks, stems, or documents (optional)
        </p>
      </div>

      <div>
        <label className="block">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-full px-6 py-12 border-2 border-dashed border-gray-800 rounded-lg text-center cursor-pointer hover:border-primary transition-colors">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-white mb-1">Click to upload files</p>
            <p className="text-sm text-gray-500">
              or drag and drop files here
            </p>
          </div>
        </label>

        {formData.files.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <span className="text-white text-sm">{file.name}</span>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      files: formData.files.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepPreflight({
  formData,
  setFormData,
  module,
}: {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  module: import("@/lib/types").ServiceModule;
}) {
  const preflightItems = MODULE_PREFLIGHT[module] || [];
  
  const toggleItem = (itemId: string) => {
    setFormData({
      ...formData,
      preflightChecked: {
        ...formData.preflightChecked,
        [itemId]: !formData.preflightChecked?.[itemId],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Preflight Checklist
        </h3>
        <p className="text-gray-400">
          Make sure you have these items ready before submitting your booking
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-300">
            These items help us deliver the best results. Check each item as you prepare it.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {preflightItems.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 p-4 bg-background rounded-lg hover:bg-gray-900 cursor-pointer transition-colors group"
          >
            <input
              type="checkbox"
              checked={formData.preflightChecked?.[item.id] || false}
              onChange={() => toggleItem(item.id)}
              className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <div className="flex-1">
              <span className="text-white group-hover:text-primary transition-colors">
                {item.label}
              </span>
              {item.required && (
                <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                  Required
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-400">
          <strong className="text-white">Note:</strong> You can proceed without checking all items, but having them ready ensures a smoother process.
        </p>
      </div>
    </div>
  );
}

function StepReview({
  formData,
  service,
}: {
  formData: BookingFormData;
  service: ServiceSummary;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Review Your Booking
        </h3>
        <p className="text-gray-400">
          Please review the details before submitting
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-background rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-1">Service</h4>
          <p className="text-white">{service.name}</p>
          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
        </div>

        {formData.notes && (
          <div className="bg-background rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">
              Project Notes
            </h4>
            <p className="text-white whitespace-pre-wrap">{formData.notes}</p>
          </div>
        )}

        {formData.scheduledDate && (
          <div className="bg-background rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-1">
              Preferred Date
            </h4>
            <p className="text-white">
              {new Date(formData.scheduledDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {formData.files.length > 0 && (
          <div className="bg-background rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Reference Files ({formData.files.length})
            </h4>
            <div className="space-y-1">
              {formData.files.map((file, idx) => (
                <p key={idx} className="text-white text-sm">
                  {file.name}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-primary/10 border border-primary/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-primary mb-1">Price</h4>
          <p className="text-white text-xl font-semibold">
            {service.priceLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepPayment({ formData }: { formData: BookingFormData }) {
  const handleOpenPayment = () => {
    if (formData.paymentUrl) {
      window.open(formData.paymentUrl, '_blank');
    }
  };

  const isWhop = formData.paymentProvider === 'whop';
  const hasPaymentUrl = !!formData.paymentUrl;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Complete Payment {isWhop && "via Whop"}
        </h3>
        <p className="text-gray-400">
          Your booking has been created and is awaiting payment.
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          <h4 className="text-purple-400 font-medium">Current Status: Awaiting Payment</h4>
        </div>
        <p className="text-sm text-gray-400 ml-5">
          Your booking is created but not confirmed until payment is completed {isWhop && "on Whop"}.
        </p>
      </div>

      {/* Payment Instructions */}
      <div className="bg-background rounded-lg p-6">
        <h4 className="text-white font-medium mb-3">Next Steps:</h4>
        <ol className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2">
            <span className="text-primary font-bold">1.</span>
            <span>Click the button below to complete payment {isWhop && "on Whop"}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">2.</span>
            <span>Once payment is confirmed, your booking status will update automatically</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">3.</span>
            <span>You'll receive confirmation and can schedule your session</span>
          </li>
        </ol>
      </div>

      {/* CTA */}
      {hasPaymentUrl ? (
        <div className="bg-primary/10 border border-primary/50 rounded-lg p-6 text-center">
          <button
            onClick={handleOpenPayment}
            className="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            {isWhop ? "Complete Payment on Whop" : "Complete Payment"}
          </button>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-yellow-400 font-medium mb-1">Payment link not configured yet</p>
              <p className="text-sm text-gray-400">
                We'll send you a payment link manually. You'll receive an email shortly with instructions.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-400">
          <strong className="text-white">Note:</strong> You can view your booking in "My Bookings" at any time. The payment link will remain available there until payment is completed.
        </p>
      </div>
    </div>
  );
}

function StepSchedulingLink({ service }: { service: ServiceSummary }) {
  const handleOpenScheduling = () => {
    if (service.schedulingUrl) {
      window.open(service.schedulingUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Schedule Your Session
        </h3>
        <p className="text-gray-400">
          Your booking request has been created. Next, pick a time for your session.
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/50 rounded-lg p-6 text-center">
        <p className="text-white mb-4">
          Click the button below to open the scheduling page and select your preferred time slot.
        </p>
        <button
          onClick={handleOpenScheduling}
          className="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          Open Scheduling Page
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-400">
          <strong className="text-white">Note:</strong> After selecting your time, you can close this window and view your booking in "My Bookings".
        </p>
      </div>
    </div>
  );
}

function StepConfirmation({ formData }: { formData?: BookingFormData }) {
  const router = useRouter();

  return (
    <div className="space-y-6 text-center py-8">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-8 h-8 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-white mb-2">
          Booking Created Successfully!
        </h3>
        <p className="text-gray-400">
          Your booking has been created and is ready for review.
        </p>
      </div>

      {/* Status Summary */}
      <div className="bg-background rounded-lg p-6 text-left max-w-md mx-auto">
        <h4 className="text-white font-medium mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Booking ID:</span>
            <span className="text-white font-mono">{formData?.bookingId?.slice(0, 8) || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="text-purple-400 font-medium">
              {formData?.paymentProvider === 'whop' || formData?.paymentProvider === 'stripe' 
                ? "Awaiting Payment" 
                : "Pending Review"}
            </span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h4 className="text-blue-400 font-medium mb-3">What's Next?</h4>
        <ol className="space-y-2 text-sm text-gray-400">
          {(formData?.paymentProvider === 'whop' || formData?.paymentProvider === 'stripe') ? (
            <>
              <li>✓ Complete payment via the provided link</li>
              <li>✓ Booking will be confirmed automatically</li>
              <li>✓ Schedule your session</li>
            </>
          ) : (
            <>
              <li>✓ Our team will review your request</li>
              <li>✓ You'll receive confirmation via email</li>
              <li>✓ Then you can schedule your session</li>
            </>
          )}
        </ol>
      </div>

      <button
        onClick={() => router.push('/bookings')}
        className="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
      >
        View My Bookings
      </button>
    </div>
  );
}
