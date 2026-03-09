'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ChannelGroup, ChannelFormat, CreativeAssets } from '@/lib/channels/types';
import { useChannelFormats } from '@/lib/channels/use-channel-formats';
import { ChannelGroupTabs } from './ChannelGroupTabs';
import { FormatPicker } from './FormatPicker';
import { CreativeEditor } from './CreativeEditor';
import { PublisherAssignment } from './PublisherAssignment';
import { UnitReviewCard } from './UnitReviewCard';

interface Publisher {
  id: string;
  name: string;
  logoUrl?: string;
}

// A unit being built (not yet saved)
export interface DraftUnit {
  id: string; // client-side ID for tracking
  channelGroup: ChannelGroup;
  formatKey: string;
  formatLabel: string;
  platform: string;
  placement: string;
  assets: CreativeAssets;
  assignedPublisherIds: Set<string>;
}

interface UnitBuilderProps {
  campaignId: string;
  citySlug: string;
  selectedPublishers: Publisher[];
  onUnitsReady: (units: DraftUnit[]) => void;
}

let nextId = 1;
function generateId(): string {
  return `draft-unit-${nextId++}`;
}

export function UnitBuilder({ citySlug, selectedPublishers, onUnitsReady }: UnitBuilderProps) {
  const { groups, isLoading, error } = useChannelFormats(citySlug);

  // Builder state
  const [activeGroup, setActiveGroup] = useState<ChannelGroup | null>(null);
  const [selectedFormatKey, setSelectedFormatKey] = useState<string | null>(null);
  const [currentAssets, setCurrentAssets] = useState<CreativeAssets>({});
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [currentPlacement, setCurrentPlacement] = useState('');
  const [currentPublisherIds, setCurrentPublisherIds] = useState<Set<string>>(new Set());
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Completed units
  const [units, setUnits] = useState<DraftUnit[]>([]);

  // Mode: 'pick' (choosing format) or 'edit' (editing creative)
  const [mode, setMode] = useState<'pick' | 'edit'>('pick');

  // Set first group active when data loads
  if (!activeGroup && groups.length > 0) {
    setActiveGroup(groups[0].key);
  }

  // Notify parent whenever units change
  useEffect(() => {
    onUnitsReady(units);
  }, [units, onUnitsReady]);

  const activeGroupData = useMemo(
    () => groups.find(g => g.key === activeGroup),
    [groups, activeGroup]
  );

  const selectedFormat = useMemo(
    () => activeGroupData?.formats.find((f: ChannelFormat) => f.formatKey === selectedFormatKey) || null,
    [activeGroupData, selectedFormatKey]
  );

  const handleFormatSelect = useCallback((formatKey: string) => {
    setSelectedFormatKey(formatKey);
    const format = groups.flatMap(g => g.formats).find((f: ChannelFormat) => f.formatKey === formatKey);
    if (format) {
      setCurrentPlatform(format.platforms[0] || '');
      setCurrentPlacement(format.placements[0] || '');
    }
    setCurrentAssets({});
    setCurrentPublisherIds(new Set(selectedPublishers.map(p => p.id)));
    setEditingUnitId(null);
    setMode('edit');
  }, [groups, selectedPublishers]);

  const handleSaveUnit = useCallback(() => {
    if (!selectedFormat || !currentPlatform || !currentPlacement) return;

    const unit: DraftUnit = {
      id: editingUnitId || generateId(),
      channelGroup: selectedFormat.channelGroup,
      formatKey: selectedFormat.formatKey,
      formatLabel: selectedFormat.label,
      platform: currentPlatform,
      placement: currentPlacement,
      assets: { ...currentAssets },
      assignedPublisherIds: new Set(currentPublisherIds),
    };

    setUnits(prev => {
      const existing = prev.findIndex(u => u.id === unit.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = unit;
        return updated;
      }
      return [...prev, unit];
    });

    // Reset to format picker
    setSelectedFormatKey(null);
    setCurrentAssets({});
    setEditingUnitId(null);
    setMode('pick');
  }, [selectedFormat, currentPlatform, currentPlacement, currentAssets, currentPublisherIds, editingUnitId]);

  const handleEditUnit = useCallback((unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    setActiveGroup(unit.channelGroup);
    setSelectedFormatKey(unit.formatKey);
    setCurrentPlatform(unit.platform);
    setCurrentPlacement(unit.placement);
    setCurrentAssets({ ...unit.assets });
    setCurrentPublisherIds(new Set(unit.assignedPublisherIds));
    setEditingUnitId(unit.id);
    setMode('edit');
  }, [units]);

  const handleRemoveUnit = useCallback((unitId: string) => {
    setUnits(prev => prev.filter(u => u.id !== unitId));
  }, []);

  const handleTogglePublisher = useCallback((publisherId: string) => {
    setCurrentPublisherIds(prev => {
      const next = new Set(prev);
      if (next.has(publisherId)) next.delete(publisherId);
      else next.add(publisherId);
      return next;
    });
  }, []);

  const handleSelectAllPublishers = useCallback(() => {
    const allIds = selectedPublishers.map(p => p.id);
    const allSelected = allIds.every(id => currentPublisherIds.has(id));
    setCurrentPublisherIds(allSelected ? new Set() : new Set(allIds));
  }, [selectedPublishers, currentPublisherIds]);

  const publisherNameMap = useMemo(
    () => Object.fromEntries(selectedPublishers.map(p => [p.id, p.name])),
    [selectedPublishers]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">Failed to load channel formats: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Group Tabs */}
      <ChannelGroupTabs
        groups={groups}
        activeGroup={activeGroup}
        onGroupSelect={group => {
          setActiveGroup(group);
          setSelectedFormatKey(null);
          setMode('pick');
        }}
      />

      {mode === 'pick' && activeGroupData && (
        <>
          {/* Format Picker */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Choose a format from {activeGroupData.label}
            </h3>
            <FormatPicker
              formats={activeGroupData.formats}
              selectedFormat={selectedFormatKey}
              onFormatSelect={handleFormatSelect}
            />
          </div>
        </>
      )}

      {mode === 'edit' && selectedFormat && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creative Editor — 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {editingUnitId ? 'Edit' : 'Create'}: {selectedFormat.label}
              </h3>
              <button
                onClick={() => { setMode('pick'); setSelectedFormatKey(null); setEditingUnitId(null); }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                &larr; Back to formats
              </button>
            </div>

            <CreativeEditor
              format={selectedFormat}
              assets={currentAssets}
              onAssetsChange={setCurrentAssets}
              selectedPlatform={currentPlatform}
              onPlatformChange={setCurrentPlatform}
              selectedPlacement={currentPlacement}
              onPlacementChange={setCurrentPlacement}
            />
          </div>

          {/* Publisher Assignment — 1 column */}
          <div className="space-y-4">
            <PublisherAssignment
              publishers={selectedPublishers}
              selectedIds={currentPublisherIds}
              onToggle={handleTogglePublisher}
              onSelectAll={handleSelectAllPublishers}
            />

            <button
              onClick={handleSaveUnit}
              disabled={currentPublisherIds.size === 0}
              className="w-full bg-teal-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingUnitId ? 'Update Unit' : 'Add Unit to Campaign'}
            </button>
          </div>
        </div>
      )}

      {/* Completed Units Review */}
      {units.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Campaign Units ({units.length})
            </h3>
            {mode === 'edit' && (
              <button
                onClick={() => { setMode('pick'); setSelectedFormatKey(null); }}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add another unit
              </button>
            )}
          </div>
          <div className="space-y-3">
            {units.map(unit => (
              <UnitReviewCard
                key={unit.id}
                formatLabel={unit.formatLabel}
                channelGroup={unit.channelGroup}
                platform={unit.platform}
                placement={unit.placement}
                assets={unit.assets}
                publisherNames={Array.from(unit.assignedPublisherIds).map(id => publisherNameMap[id] || id)}
                onEdit={() => handleEditUnit(unit.id)}
                onRemove={() => handleRemoveUnit(unit.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
