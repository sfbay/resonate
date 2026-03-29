'use client';

/**
 * ProcurementStatus — Horizontal step indicator for the procurement pipeline.
 * Shows progression: not_submitted → pending_approval → approved → po_generated → invoiced → paid
 */

const STEPS = [
  { key: 'not_submitted', label: 'Not Submitted' },
  { key: 'pending_approval', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'po_generated', label: 'PO Generated' },
  { key: 'invoiced', label: 'Invoiced' },
  { key: 'paid', label: 'Paid' },
];

interface Props {
  currentStatus: string;
}

export function ProcurementStatus({ currentStatus }: Props) {
  const currentIdx = STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isFuture = i > currentIdx;

        return (
          <div key={step.key} className="flex items-center gap-1">
            {/* Step dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  isPast ? 'bg-teal-500' :
                  isCurrent ? 'bg-teal-500 ring-2 ring-teal-200' :
                  'bg-slate-200'
                }`}
              />
              <span className={`text-[8px] mt-0.5 whitespace-nowrap ${
                isCurrent ? 'text-teal-600 font-semibold' :
                isPast ? 'text-slate-400' :
                'text-slate-300'
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className={`w-3 h-px mt-[-8px] ${
                isPast ? 'bg-teal-400' :
                isFuture ? 'bg-slate-200' :
                'bg-teal-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
