/**
 * Publisher Analytics Components
 *
 * Export all analytics-related components for the publisher dashboard.
 */

// Core dashboard
export { AnalyticsDashboard } from './AnalyticsDashboard';

// Metrics & Stats
export { MetricsOverview } from './MetricsOverview';
export { PlatformConnectionCard } from './PlatformConnectionCard';

// Badges
export { GrowthBadge, BadgeCollection, RisingStarBadge } from './GrowthBadge';

// Visualizations
export { GrowthChart, GrowthSparkline } from './GrowthChart';
export { PostPerformanceTable } from './PostPerformanceTable';
export type { PostPerformance } from './PostPerformanceTable';
export type { GrowthDataPoint } from './GrowthChart';

// Recommendations
export { RecommendationsPanel } from './RecommendationsPanel';
