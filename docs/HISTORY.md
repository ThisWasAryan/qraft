# Local History System Design

## Overview
The history system allows users to browse and restore previously generated QR configurations. It stores configuration objects, **NOT** the generated images themselves.

## Storage Backend
- **Technology**: IndexedDB via `idb-keyval`
- **Characteristics**: Async, non-blocking, practically unlimited storage
- **API**: Simple get/set API
- **Storage Key**: `'qraft-history'`

## Schema
The persistence layer relies on a versioned schema to accommodate future migrations seamlessly.

```typescript
interface PersistedHistory {
  version: 1;  // Schema version for migrations
  items: QRHistoryItem[];
}

interface QRHistoryItem {
  id: string;              // crypto.randomUUID()
  config: QRConfig;        // Full QR configuration
  createdAt: number;       // Unix timestamp (ms)
  label?: string;          // Auto-generated from content
  presetId?: string;       // Which preset was applied (if any)
}
```

## Auto-Label Generation
Labels are automatically generated based on the QR code content to make browsing easier:

| Content Type | Auto-Label Format |
|---|---|
| **URL** | Truncated URL (e.g., `'example.com/path...'`) |
| **Text** | First 40 characters of the text |
| **Email** | `'Email to user@example.com'` |
| **Phone** | `'Call +1415555...'` |
| **Wi-Fi** | `'WiFi: NetworkName'` |

## Configuration Limits
- **Maximum Items**: 100
- **Eviction Policy**: FIFO (First-In, First-Out). When the limit is reached, the oldest items are automatically evicted.
- **Size Implications**: Each item is approximately 1-5KB (config JSON), so the maximum storage footprint is ~500KB total (excluding logos).

## Ordering
History items are sorted with the newest items first (descending by `createdAt`).

## Operations
1. **Auto-Save**: After QR generation stabilizes (debounced ~2s after the last input change), the configuration is automatically saved.
   - Do not save if the content is empty or invalid.
   - Do not save duplicate consecutive entries (if both content and style match the previous entry).
   - Generate a UUID and timestamp on save.
2. **Restore**: Loads a history item's configuration into the active generator.
   - Completely replaces current content and style.
   - The user can then modify it freely.
3. **Delete**: Removes a single history item by its ID.
   - *Confirmation*: No confirmation is required; this is a lightweight action designed to be fast.
4. **Clear All**: Removes all history items.
   - *Confirmation*: Requires a confirmation dialog ('Clear all history? This cannot be undone.').
5. **Load**: On application startup, the history is hydrated from IndexedDB.
   - If data is corrupted, a warning is logged and the application starts with an empty history.
   - If there is a version mismatch, the migration strategy is executed.

## Migration Strategy
Migrations are handled systematically when a version mismatch is detected upon hydration.

```typescript
const CURRENT_VERSION = 1;

function migrateHistory(data: unknown): PersistedHistory {
  if (!data || typeof data !== 'object') {
    return { version: CURRENT_VERSION, items: [] };
  }
  
  const persisted = data as PersistedHistory;
  
  // Future: version-based migrations
  // if (persisted.version === 1) { 
  //   persisted = migrate1to2(persisted); 
  // }
  
  return persisted;
}
```

## Corruption Recovery
Resilience is critical. The application should **never** crash due to bad history data:
- **JSON Parse Failure**: Reset to an empty history and log the error.
- **Schema Validation Failure**: Attempt to salvage valid items and discard invalid ones. 

## Duplicate Detection
Consecutive identical states are not saved to prevent spamming the history.

```typescript
function isDuplicate(newConfig: QRConfig, lastItem: QRHistoryItem): boolean {
  // Deep compare content and style (ignoring timestamp and generated IDs)
  return JSON.stringify(newConfig) === JSON.stringify(lastItem.config);
}
```

## Logo Storage Note
- If a QR configuration includes a logo, the logo's `src` is stored as a base64 Data URL.
- This means history items containing logos will be considerably larger (~50-200KB each).
- **Warning**: Consider displaying a warning to the user if the uploaded logo is exceptionally large (>200KB).
- **Blob URLs**: Blob URLs cannot be persisted across sessions. Any Blob URL must be converted to a Data URL before saving to history.

## Privacy
- All history data stays strictly within the browser's IndexedDB.
- No data is sent to any backend servers.
- The user can clear all data at any time.
- Once the history is cleared, the data is permanently gone (no hidden backups).

## UI Integration
- **Placement**: History panel acts as a sidebar on desktop, and a slide-out drawer on mobile.
- **Item Display**: Each item shows an icon for its content type, the auto-generated label, and a relative timestamp (e.g., `'2 hours ago'`).
- **Interactions**:
  - Click on an item to restore it.
  - Swipe to delete (mobile) or click the delete icon (desktop).
- **Clear All**: A "Clear all" button is located at the bottom of the history panel.
- **Empty State**: Display a friendly message: `'No history yet. Generate a QR code to get started.'`

## Zustand Store Integration
State management utilizes Zustand with the persistence middleware and a custom storage adapter tailored for `idb-keyval`.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HistoryStore {
  items: QRHistoryItem[];
  isLoading: boolean;
  
  addItem: (config: QRConfig) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  restoreItem: (id: string) => void;
}
```
