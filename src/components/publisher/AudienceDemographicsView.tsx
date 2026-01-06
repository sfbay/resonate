'use client';

import { useState, useMemo } from 'react';
import type { Publisher, SFNeighborhood } from '@/types';
import type { AudienceOverlay, InferredDemographics, PublisherAnnotation } from '@/lib/census/types';
import { SFNeighborhoodMap } from '../map/SFNeighborhoodMap';
import { calculateAudienceOverlay, compareToCity, generateDemographicSummary } from '@/lib/census/overlay-service';

// =============================================================================
// TYPES
// =============================================================================

interface AudienceDemographicsViewProps {
  publisher: Publisher;
  annotations?: PublisherAnnotation[];
  onAddAnnotation?: (annotation: Omit<PublisherAnnotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AudienceDemographicsView({
  publisher,
  annotations = [],
  onAddAnnotation,
}: AudienceDemographicsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'details' | 'annotations'>('overview');
  const [colorBy, setColorBy] = useState<'audience' | 'income' | 'language'>('audience');
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);

  // Calculate audience overlay
  const overlay = useMemo(() => calculateAudienceOverlay(publisher), [publisher]);
  const demographics = overlay.inferredDemographics;
  const cityComparison = useMemo(() => compareToCity(demographics), [demographics]);
  const summary = useMemo(() => generateDemographicSummary(demographics), [demographics]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Audience Demographics</h2>
            <p className="text-sm text-slate-500 mt-1">
              Inferred from geographic distribution and census data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={overlay.confidence} />
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Improve Data
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 bg-slate-50 rounded-lg p-4">
          <div className="text-sm text-slate-700">{summary}</div>
          {cityComparison.keyDifferences.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {cityComparison.keyDifferences.map((diff, i) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {diff}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 px-6">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'map', label: 'Map' },
            { id: 'details', label: 'Detailed Breakdown' },
            { id: 'annotations', label: `Notes (${annotations.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab demographics={demographics} cityComparison={cityComparison} />
        )}
        {activeTab === 'map' && (
          <MapTab
            audienceDistribution={overlay.geographicDistribution}
            colorBy={colorBy}
            onColorByChange={setColorBy}
          />
        )}
        {activeTab === 'details' && (
          <DetailsTab demographics={demographics} />
        )}
        {activeTab === 'annotations' && (
          <AnnotationsTab
            annotations={annotations}
            onAddAnnotation={onAddAnnotation}
            showForm={showAnnotationForm}
            onToggleForm={() => setShowAnnotationForm(!showAnnotationForm)}
          />
        )}
      </div>

      {/* Methodology Footer */}
      <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Data source: ACS {overlay.methodology.dataYear} 5-Year Estimates •
            Geographic source: {overlay.methodology.geographicSource.replace('_', ' ')} •
            Last updated: {overlay.lastCalculated.toLocaleDateString()}
          </span>
          <button className="text-blue-600 hover:text-blue-700">Learn more about methodology</button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

interface OverviewTabProps {
  demographics: InferredDemographics;
  cityComparison: ReturnType<typeof compareToCity>;
}

function OverviewTab({ demographics, cityComparison }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Income */}
      <StatCard
        title="Estimated Median Income"
        value={`$${(demographics.estimatedMedianIncome / 1000).toFixed(0)}k`}
        comparison={cityComparison.incomeVsCity}
        comparisonLabel="vs SF average"
      />

      {/* Ethnicity */}
      <div className="bg-slate-50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Ethnic Composition</h3>
        <div className="space-y-2">
          {Object.entries(demographics.estimatedEthnicityDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 capitalize">{formatEthnicity(key)}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-10 text-right">{value}%</span>
                </div>
              </div>
            ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Diversity Index</span>
            <span className="font-medium text-slate-900">{cityComparison.diversityIndex}/100</span>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-slate-50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Languages</h3>
        <div className="space-y-2">
          {demographics.estimatedLanguages.slice(0, 4).map((lang) => (
            <div key={lang.language} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{formatLanguage(lang.language)}</span>
              <span className="text-sm font-medium text-slate-900">{lang.percentage}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Limited English Proficiency</span>
            <span className="font-medium text-slate-900">{demographics.estimatedLepRate}%</span>
          </div>
        </div>
      </div>

      {/* Age */}
      <div className="bg-slate-50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Age Distribution</h3>
        <div className="flex items-end justify-between h-24 gap-1">
          {Object.entries(demographics.estimatedAgeDistribution).map(([age, value]) => (
            <div key={age} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${value * 2}px` }}
              />
              <span className="text-xs text-slate-500 mt-1 transform -rotate-45 origin-top-left">
                {age.replace('age', '').replace('Plus', '+')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-semibold text-slate-900">{demographics.estimatedChildPopulation}%</div>
            <div className="text-xs text-slate-500">Under 18</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {100 - demographics.estimatedChildPopulation - demographics.estimatedSeniorPopulation}%
            </div>
            <div className="text-xs text-slate-500">18-64</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">{demographics.estimatedSeniorPopulation}%</div>
            <div className="text-xs text-slate-500">65+</div>
          </div>
        </div>
      </div>

      {/* Housing */}
      <div className="bg-slate-50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Housing Status</h3>
        <div className="flex h-6 rounded-full overflow-hidden mb-4">
          <div
            className="bg-blue-600"
            style={{ width: `${demographics.estimatedHousingStatus.owners}%` }}
          />
          <div
            className="bg-amber-500"
            style={{ width: `${demographics.estimatedHousingStatus.renters}%` }}
          />
        </div>
        <div className="flex justify-between text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span className="text-slate-600">Owners {demographics.estimatedHousingStatus.owners}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span className="text-slate-600">Renters {demographics.estimatedHousingStatus.renters}%</span>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-slate-500">Rent burdened: </span>
          <span className="font-medium text-slate-900">{demographics.estimatedHousingStatus.rentBurdened}%</span>
          <span className="text-slate-400 text-xs ml-1">(paying &gt;30% income)</span>
        </div>
      </div>

      {/* Key Indicators for City Campaigns */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <h3 className="text-sm font-medium text-blue-900 mb-4">Key Indicators for City Outreach</h3>
        <div className="grid grid-cols-2 gap-4">
          <Indicator label="Poverty Rate" value={`${demographics.estimatedPovertyRate}%`} />
          <Indicator label="LEP Rate" value={`${demographics.estimatedLepRate}%`} />
          <Indicator label="Foreign Born" value={`${demographics.estimatedForeignBorn}%`} />
          <Indicator label="College Educated" value={`${demographics.estimatedEducation.bachelorsOrHigher}%`} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAP TAB
// =============================================================================

interface MapTabProps {
  audienceDistribution: AudienceOverlay['geographicDistribution'];
  colorBy: 'audience' | 'income' | 'language';
  onColorByChange: (value: 'audience' | 'income' | 'language') => void;
}

function MapTab({ audienceDistribution, colorBy, onColorByChange }: MapTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Geographic Distribution</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Color by:</span>
          <select
            value={colorBy}
            onChange={(e) => onColorByChange(e.target.value as typeof colorBy)}
            className="text-sm border border-slate-300 rounded-lg px-2 py-1"
          >
            <option value="audience">Audience %</option>
            <option value="income">Income</option>
            <option value="language">Language</option>
          </select>
        </div>
      </div>

      <SFNeighborhoodMap
        mode="publisher"
        audienceDistribution={audienceDistribution}
        colorBy={colorBy}
        height="500px"
        showLegend={true}
      />

      {/* Top Neighborhoods Table */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Top Neighborhoods</h4>
        <div className="bg-slate-50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2">Neighborhood</th>
                <th className="text-right px-4 py-2">Audience %</th>
                <th className="text-right px-4 py-2">Est. Reach</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {audienceDistribution
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 8)
                .map((dist) => (
                  <tr key={dist.neighborhood} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-slate-900">{formatNeighborhood(dist.neighborhood)}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{dist.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right text-slate-500">
                      {dist.audienceCount?.toLocaleString() || '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DETAILS TAB
// =============================================================================

interface DetailsTabProps {
  demographics: InferredDemographics;
}

function DetailsTab({ demographics }: DetailsTabProps) {
  return (
    <div className="space-y-8">
      {/* Income Distribution */}
      <section>
        <h3 className="text-sm font-medium text-slate-700 mb-4">Income Distribution (AMI-based)</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(demographics.estimatedIncomeDistribution).map(([level, pct]) => (
            <div key={level} className="text-center">
              <div className="h-32 flex items-end justify-center mb-2">
                <div
                  className="w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                  style={{ height: `${pct * 2}px` }}
                />
              </div>
              <div className="text-lg font-semibold text-slate-900">{pct}%</div>
              <div className="text-xs text-slate-500">{formatAMI(level)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Full Ethnicity Breakdown */}
      <section>
        <h3 className="text-sm font-medium text-slate-700 mb-4">Full Ethnic Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(demographics.estimatedEthnicityDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value]) => (
              <div key={key} className="bg-slate-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-slate-900">{value}%</div>
                <div className="text-sm text-slate-600 capitalize">{formatEthnicity(key)}</div>
              </div>
            ))}
        </div>
      </section>

      {/* Full Age Breakdown */}
      <section>
        <h3 className="text-sm font-medium text-slate-700 mb-4">Age Distribution</h3>
        <div className="space-y-2">
          {Object.entries(demographics.estimatedAgeDistribution).map(([age, value]) => (
            <div key={age} className="flex items-center gap-4">
              <span className="w-20 text-sm text-slate-600">{formatAge(age)}</span>
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${value * 3}%` }}
                />
              </div>
              <span className="w-12 text-sm font-medium text-slate-900 text-right">{value}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// ANNOTATIONS TAB
// =============================================================================

interface AnnotationsTabProps {
  annotations: PublisherAnnotation[];
  onAddAnnotation?: (annotation: Omit<PublisherAnnotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  showForm: boolean;
  onToggleForm: () => void;
}

function AnnotationsTab({ annotations, onAddAnnotation, showForm, onToggleForm }: AnnotationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-700">Community Notes</h3>
          <p className="text-xs text-slate-500 mt-1">
            Add context about your audience that census data doesn&apos;t capture
          </p>
        </div>
        <button
          onClick={onToggleForm}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Note
        </button>
      </div>

      {showForm && (
        <AnnotationForm onSubmit={(data) => {
          onAddAnnotation?.(data);
          onToggleForm();
        }} onCancel={onToggleForm} />
      )}

      {annotations.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <div className="text-slate-400 mb-2">📝</div>
          <div className="text-sm text-slate-600">No notes yet</div>
          <p className="text-xs text-slate-500 mt-1">
            Add community insights that help advertisers understand your audience better
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {annotations.map((annotation) => (
            <div key={annotation.id} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                    {formatAnnotationType(annotation.annotationType)}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {annotation.createdAt.toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-medium text-slate-900 mb-1">{annotation.content.title}</h4>
              <p className="text-sm text-slate-600">{annotation.content.description}</p>
              {annotation.content.tags && annotation.content.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {annotation.content.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ANNOTATION FORM
// =============================================================================

interface AnnotationFormProps {
  onSubmit: (data: Omit<PublisherAnnotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function AnnotationForm({ onSubmit, onCancel }: AnnotationFormProps) {
  const [type, setType] = useState<PublisherAnnotation['annotationType']>('community_insight');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="community_insight">Community Insight</option>
            <option value="demographic_correction">Demographic Note</option>
            <option value="cultural_note">Cultural Context</option>
            <option value="audience_segment">Audience Segment</option>
            <option value="local_knowledge">Local Knowledge</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Strong presence in immigrant business community"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide context that helps advertisers understand this aspect of your audience..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-sm text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit({
                publisherId: '',
                annotationType: type,
                content: { title, description },
                visibility: 'advertisers',
              });
            }}
            disabled={!title || !description}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[level]}`}>
      {level === 'high' ? 'High confidence' : level === 'medium' ? 'Medium confidence' : 'Estimated'}
    </span>
  );
}

function StatCard({
  title,
  value,
  comparison,
  comparisonLabel,
}: {
  title: string;
  value: string;
  comparison?: 'above' | 'at' | 'below';
  comparisonLabel?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-5">
      <h3 className="text-sm font-medium text-slate-700 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      {comparison && comparisonLabel && (
        <div className="mt-2 flex items-center gap-1 text-sm">
          {comparison === 'above' && <span className="text-green-600">↑ Above</span>}
          {comparison === 'at' && <span className="text-slate-500">→ At</span>}
          {comparison === 'below' && <span className="text-amber-600">↓ Below</span>}
          <span className="text-slate-500">{comparisonLabel}</span>
        </div>
      )}
    </div>
  );
}

function Indicator({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-bold text-blue-900">{value}</div>
      <div className="text-xs text-blue-700">{label}</div>
    </div>
  );
}

// =============================================================================
// FORMATTERS
// =============================================================================

function formatEthnicity(key: string): string {
  const labels: Record<string, string> = {
    white: 'White',
    black: 'Black/African American',
    asian: 'Asian',
    hispanic: 'Latino/Hispanic',
    nativeAmerican: 'Native American',
    pacificIslander: 'Pacific Islander',
    multiracial: 'Multiracial',
    other: 'Other',
  };
  return labels[key] || key;
}

function formatLanguage(lang: string): string {
  const labels: Record<string, string> = {
    english: 'English',
    spanish: 'Spanish',
    chinese_cantonese: 'Cantonese',
    chinese_mandarin: 'Mandarin',
    tagalog: 'Tagalog',
    vietnamese: 'Vietnamese',
    korean: 'Korean',
    russian: 'Russian',
  };
  return labels[lang] || lang;
}

function formatAMI(level: string): string {
  const labels: Record<string, string> = {
    extremelyLow: '≤30% AMI',
    veryLow: '31-50%',
    low: '51-80%',
    moderate: '81-120%',
    aboveModerate: '>120%',
  };
  return labels[level] || level;
}

function formatAge(age: string): string {
  return age
    .replace('under', 'Under ')
    .replace('age', '')
    .replace('To', '-')
    .replace('Plus', '+');
}

function formatNeighborhood(n: SFNeighborhood): string {
  return n.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatAnnotationType(type: PublisherAnnotation['annotationType']): string {
  const labels: Record<typeof type, string> = {
    community_insight: 'Community Insight',
    demographic_correction: 'Demographic Note',
    cultural_note: 'Cultural Context',
    engagement_pattern: 'Engagement Pattern',
    audience_segment: 'Audience Segment',
    local_knowledge: 'Local Knowledge',
  };
  return labels[type] || type;
}

export default AudienceDemographicsView;
