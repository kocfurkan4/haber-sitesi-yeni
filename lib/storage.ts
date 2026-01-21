// Persistent storage using IndexedDB (survives cache clearing)
import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'PiyadeHaberSistemi',
  storeName: 'settings',
  description: 'Persistent settings storage for Piyade news system'
});

// Storage wrapper that syncs between IndexedDB and localStorage
class PersistentStorage {
  // Initialize: Load from IndexedDB to localStorage on startup
  async init() {
    try {
      const keys = [
        'geminiKeys',
        'elevenlabsKeys',
        'filterKeywords',
        'translationPairs',
        'rssFeeds',
        'collectedNews'
      ];

      for (const key of keys) {
        const value = await localforage.getItem(key);
        if (value) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.error('Failed to load from IndexedDB:', error);
    }
  }

  // Set item: Save to both IndexedDB and localStorage
  async setItem(key: string, value: any) {
    try {
      // Save to localStorage first (for immediate access)
      localStorage.setItem(key, JSON.stringify(value));

      // Then save to IndexedDB (persistent)
      await localforage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }

  // Get item: Try localStorage first, fallback to IndexedDB
  async getItem(key: string) {
    try {
      // Try localStorage first
      const localValue = localStorage.getItem(key);
      if (localValue) {
        return JSON.parse(localValue);
      }

      // Fallback to IndexedDB
      const dbValue = await localforage.getItem(key);
      if (dbValue) {
        // Restore to localStorage
        localStorage.setItem(key, JSON.stringify(dbValue));
        return dbValue;
      }

      return null;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }

  // Remove item: Remove from both storages
  async removeItem(key: string) {
    try {
      localStorage.removeItem(key);
      await localforage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  }

  // Clear all: Clear both storages
  async clear() {
    try {
      localStorage.clear();
      await localforage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}

export const storage = new PersistentStorage();
