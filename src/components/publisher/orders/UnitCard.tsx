'use client';

import { useState } from 'react';
import type { ChannelGroup, CreativeAssets, UnitStatus } from '@/lib/channels/types';
import { UNIT_STATUS_LABELS, COMPLIANCE_DEFAULTS } from '@/lib/channels';

interface UnitCardProps {
  unitId: string;
  campaignId: string;
  formatKey: string;
  formatLabel: string;
  channelGroup: ChannelGroup;
  platform: string;
  placement: string;
  status: UnitStatus;
  creativeAssets: CreativeAssets;
  complianceNotes: string | null;
  revisionFeedback: string | null;
  payoutCents: number;
  onAccept: (unitId: string) => Promise<void>;
  onRequestRevision: (unitId: string, feedback: string) => Promise<void>;
  onReject: (unitId: string, reason: string) => Promise<void>;
  onMarkDelivered: (unitId: string, proof: { postUrl?: string; screenshotUrl?: string }) => Promise<void>;
}

const GROUP_COLORS: Record<ChannelGroup, string> = {
  social: 'bg-blue-100 text-blue-700',
  display: 'bg-purple-100 text-purple-700',
  audio_video: 'bg-orange-100 text-orange-700',
};

const REJECTION_REASONS = [
  'Does not align with editorial standards',
  'Audience mismatch for our community',
  'Scheduling conflict',
  'Content quality concerns',
  'Other',
];

export function UnitCard({
  unitId,
  campaignId,
  formatKey,
  formatLabel,
  channelGroup,
  platform,
  placement,
  status,
  creativeAssets,
  complianceNotes,
  revisionFeedback: existingFeedback,
  payoutCents,
  onAccept,
  onRequestRevision,
  onReject,
  onMarkDelivered,
}: UnitCardProps) {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [deliverUrl, setDeliverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKit, setShowKit] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kit, setKit] = useState<any>(null);
  const [kitLoading, setKitLoading] = useState(false);

  const statusDisplay = UNIT_STATUS_LABELS[status] || { label: status, color: 'gray' };
  const thumbnail = creativeAssets.files?.[0];
  const isPending = status === 'pending_publisher';
  const isInProduction = status === 'in_production' || status === 'accepted';
  const compliance = complianceNotes || COMPLIANCE_DEFAULTS[platform] || '';

  async function handleAction(action: () => Promise<void>) {
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
      setShowRevisionForm(false);
      setShowRejectForm(false);
      setShowDeliverForm(false);
    }
  }

  async function fetchProductionKit() {
    setKitLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/units/${unitId}/production-kit`);
      if (res.ok) {
        setKit(await res.json());
        setShowKit(true);
      }
    } finally {
      setKitLoading(false);
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  // Suppress unused variable warnings for props used only by production kit
  void formatKey;

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isPending ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
          {thumbnail && thumbnail.mimeType?.startsWith('image/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail.url} alt="" className="w-full h-full object-cover" />
          ) : thumbnail ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              {thumbnail.mimeType?.split('/')[0] || 'file'}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No preview
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GROUP_COLORS[channelGroup]}`}>
              {channelGroup === 'audio_video' ? 'Audio/Video' : channelGroup.charAt(0).toUpperCase() + channelGroup.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{formatLabel}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${STATUS_COLORS[statusDisplay.color] || STATUS_COLORS.gray}`}>
              {statusDisplay.label}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-900 truncate">
            {creativeAssets.headline || '(No headline)'}
          </p>
          {creativeAssets.bodyText && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{creativeAssets.bodyText}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {platform.charAt(0).toUpperCase() + platform.slice(1)} · {placement.replace(/_/g, ' ')}
            {payoutCents > 0 && (
              <span className="ml-2 font-medium text-gray-600">
                ${(payoutCents / 100).toFixed(2)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* CTA / Click-through info */}
      {creativeAssets.ctaUrl && (
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg text-xs">
          <span className="text-gray-400">CTA: </span>
          <span className="font-medium text-gray-700">{creativeAssets.ctaText || 'Link'}</span>
          <span className="text-gray-400 ml-1">&rarr; {creativeAssets.ctaUrl}</span>
        </div>
      )}

      {/* Hashtags */}
      {creativeAssets.hashtags && creativeAssets.hashtags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {creativeAssets.hashtags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Compliance */}
      {compliance && (
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
          <p className="text-xs font-medium text-amber-700">Platform Compliance</p>
          <p className="text-xs text-amber-600 mt-0.5">{compliance}</p>
        </div>
      )}

      {/* Existing revision feedback */}
      {existingFeedback && (
        <div className="mt-3 bg-orange-50 border border-orange-100 rounded-lg p-2.5">
          <p className="text-xs font-medium text-orange-700">Revision Requested</p>
          <p className="text-xs text-orange-600 mt-0.5">{existingFeedback}</p>
        </div>
      )}

      {/* Production Kit — only for accepted/in_production */}
      {(status === 'accepted' || status === 'in_production') && (
        <>
          {!showKit ? (
            <button
              onClick={fetchProductionKit}
              disabled={kitLoading}
              className="mt-3 w-full text-sm px-4 py-2 border border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
            >
              {kitLoading ? 'Loading...' : 'View Production Kit'}
            </button>
          ) : kit && (
            <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-teal-800">Production Kit</p>
                <button onClick={() => setShowKit(false)} className="text-xs text-teal-500">Hide</button>
              </div>

              {/* Campaign context */}
              {kit.campaign && (
                <div className="text-xs text-teal-700">
                  <p><span className="font-medium">Campaign:</span> {kit.campaign.name}</p>
                  {kit.campaign.department && <p><span className="font-medium">Department:</span> {kit.campaign.department}</p>}
                  {kit.deadline && <p><span className="font-medium">Deadline:</span> {new Date(kit.deadline).toLocaleDateString()}</p>}
                </div>
              )}

              {/* Creative assets */}
              {kit.creative.files.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-teal-700 mb-1">Assets</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {kit.creative.files.map((file: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-teal-600 py-1">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-800">
                        {file.filename}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Copy */}
              {kit.creative.headline && (
                <div>
                  <p className="text-xs font-medium text-teal-700">Headline</p>
                  <p className="text-xs text-teal-600 bg-white rounded px-2 py-1 mt-0.5">{kit.creative.headline}</p>
                </div>
              )}
              {kit.creative.bodyText && (
                <div>
                  <p className="text-xs font-medium text-teal-700">Body / Caption</p>
                  <p className="text-xs text-teal-600 bg-white rounded px-2 py-1 mt-0.5 whitespace-pre-wrap">{kit.creative.bodyText}</p>
                </div>
              )}
              {kit.creative.hashtags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-teal-700">Hashtags</p>
                  <p className="text-xs text-teal-600">{kit.creative.hashtags.join(' ')}</p>
                </div>
              )}

              {/* Compliance */}
              {kit.compliance && (
                <div className="bg-amber-50 border border-amber-100 rounded p-2">
                  <p className="text-xs font-medium text-amber-700">Compliance</p>
                  <p className="text-xs text-amber-600">{kit.compliance}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Actions — pending_publisher */}
      {isPending && !showRevisionForm && !showRejectForm && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleAction(() => onAccept(unitId))}
            disabled={loading}
            className="btn btn-coral text-sm px-4 py-2 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={() => setShowRevisionForm(true)}
            className="text-sm px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Request Revision
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            className="text-sm px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {/* Revision form */}
      {showRevisionForm && (
        <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-700 mb-2">What needs to change?</p>
          <textarea
            value={revisionText}
            onChange={e => setRevisionText(e.target.value)}
            placeholder="Describe what the advertiser should revise..."
            rows={3}
            className="w-full text-sm border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleAction(() => onRequestRevision(unitId, revisionText))}
              disabled={!revisionText.trim() || loading}
              className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Revision Request'}
            </button>
            <button onClick={() => { setShowRevisionForm(false); setRevisionText(''); }} className="text-sm text-gray-500 px-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <div className="mt-4 bg-red-50 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-700 mb-2">Reason for rejecting</p>
          <div className="space-y-1.5">
            {REJECTION_REASONS.map(reason => (
              <label key={reason} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reject-reason"
                  value={reason}
                  checked={rejectReason === reason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="text-red-500 focus:ring-red-300"
                />
                <span className="text-sm text-gray-700">{reason}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleAction(() => onReject(unitId, rejectReason))}
              disabled={!rejectReason || loading}
              className="text-sm px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Rejecting...' : 'Reject Unit'}
            </button>
            <button onClick={() => { setShowRejectForm(false); setRejectReason(''); }} className="text-sm text-gray-500 px-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deliver action — accepted or in_production */}
      {isInProduction && !showDeliverForm && (
        <div className="mt-4">
          <button
            onClick={() => setShowDeliverForm(true)}
            className="btn btn-coral text-sm px-4 py-2"
          >
            Mark as Delivered
          </button>
        </div>
      )}

      {/* Deliver form */}
      {showDeliverForm && (
        <div className="mt-4 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-700 mb-2">Delivery Proof (optional)</p>
          <input
            type="url"
            value={deliverUrl}
            onChange={e => setDeliverUrl(e.target.value)}
            placeholder="https://instagram.com/p/... (post URL)"
            className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleAction(() => onMarkDelivered(unitId, { postUrl: deliverUrl || undefined }))}
              disabled={loading}
              className="text-sm px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting...' : 'Confirm Delivery'}
            </button>
            <button onClick={() => { setShowDeliverForm(false); setDeliverUrl(''); }} className="text-sm text-gray-500 px-3">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
