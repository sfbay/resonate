'use client';

/**
 * Order Timeline
 *
 * Vertical timeline showing the lifecycle of an order from creation through payment.
 * Past steps are colored, current step pulses, future steps are grayed.
 */

const ORDER_STEPS = [
  { key: 'draft', label: 'Created' },
  { key: 'pending_publisher', label: 'Placed' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
  { key: 'paid', label: 'Paid' },
] as const;

interface OrderTimelineProps {
  currentStatus: string;
  statusHistory?: { status: string; changedAt: string; changedBy?: string; notes?: string }[];
}

export function OrderTimeline({ currentStatus, statusHistory }: OrderTimelineProps) {
  const currentIndex = ORDER_STEPS.findIndex(s => s.key === currentStatus);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 1; // Default to "Placed"

  // Build timestamp lookup from history
  const historyMap = new Map<string, { changedAt: string; changedBy?: string }>();
  if (statusHistory) {
    for (const entry of statusHistory) {
      historyMap.set(entry.status, entry);
    }
  }

  return (
    <div className="space-y-0">
      {ORDER_STEPS.map((step, i) => {
        const isPast = i < effectiveIndex;
        const isCurrent = i === effectiveIndex;
        const isFuture = i > effectiveIndex;
        const historyEntry = historyMap.get(step.key);

        return (
          <div key={step.key} className="flex items-start gap-3">
            {/* Dot + Line */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                isPast ? 'bg-teal-500' :
                isCurrent ? 'bg-teal-500 ring-4 ring-teal-100 animate-pulse' :
                'bg-gray-200'
              }`} />
              {i < ORDER_STEPS.length - 1 && (
                <div className={`w-0.5 h-6 ${isPast ? 'bg-teal-300' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Label + Timestamp */}
            <div className={`pb-3 -mt-0.5 ${isFuture ? 'opacity-40' : ''}`}>
              <p className={`text-xs font-medium ${
                isCurrent ? 'text-teal-700' : isPast ? 'text-[var(--color-charcoal)]' : 'text-slate-400'
              }`}>
                {step.label}
                {isCurrent && (
                  <span className="ml-1.5 text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded font-medium">
                    Current
                  </span>
                )}
              </p>
              {historyEntry && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(historyEntry.changedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                  {historyEntry.changedBy && ` by ${historyEntry.changedBy}`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
