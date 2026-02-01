/**
 * Platform Sync Module
 *
 * Exports all sync-related functionality.
 */

export {
  syncPlatformConnection,
  syncPublisher,
  processPendingSyncs,
  calculateGrowthSnapshot,
  type SyncOptions,
  type SyncResult,
  type BatchSyncResult,
} from './platform-sync-service';
