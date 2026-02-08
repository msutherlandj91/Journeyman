import { saveCalculation, getCalculations } from '../supabase';

export class HistoryService {
  constructor(userId = null) {
    this.userId = userId;
    this.localKey = 'wc-history';
    this.lastSyncKey = 'wc-last-sync';
    this.pendingSyncKey = 'wc-pending-sync';
  }

  async getHistory() {
    if (!this.userId) {
      return this.getLocalHistory();
    }

    // Try cloud first
    const cloudResult = await getCalculations(this.userId);
    if (cloudResult.success) {
      this.cacheCloudHistory(cloudResult.data);
      return cloudResult.data;
    }

    // Fall back to cached local
    console.warn('Using cached history - cloud unavailable');
    return this.getLocalHistory();
  }

  async saveCalculation(entry) {
    // Always save locally first (never lose data)
    const localHistory = this.getLocalHistory();
    localHistory.push(entry);
    this.saveLocalHistory(localHistory);

    // If signed in, sync to cloud (best effort)
    if (this.userId) {
      const result = await saveCalculation(this.userId, entry);
      if (!result.success) {
        this.markPendingSync(entry);
      }
    }

    return entry;
  }

  async mergeOnSignIn(userId) {
    const localHistory = this.getLocalHistory();
    const cloudResult = await getCalculations(userId);

    if (!cloudResult.success) {
      console.warn('Cannot merge - cloud unavailable');
      return localHistory;
    }

    const cloudHistory = cloudResult.data;

    // Deduplicate by timestamp + expression
    const merged = this.deduplicateHistory([...localHistory, ...cloudHistory]);

    // Upload local-only items to cloud
    const localOnly = this.findLocalOnlyItems(localHistory, cloudHistory);
    for (const item of localOnly) {
      await saveCalculation(userId, item);
    }

    this.cacheCloudHistory(merged);
    return merged;
  }

  deduplicateHistory(history) {
    const seen = new Set();
    return history
      .filter(entry => {
        const key = `${entry.timestamp}-${entry.expression}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  findLocalOnlyItems(localHistory, cloudHistory) {
    const cloudTimestamps = new Set(cloudHistory.map(e => e.timestamp));
    return localHistory.filter(e => !cloudTimestamps.has(e.timestamp));
  }

  getLocalHistory() {
    try {
      const stored = localStorage.getItem(this.localKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveLocalHistory(history) {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  cacheCloudHistory(history) {
    this.saveLocalHistory(history);
    localStorage.setItem(this.lastSyncKey, Date.now().toString());
  }

  markPendingSync(entry) {
    const pending = JSON.parse(localStorage.getItem(this.pendingSyncKey) || '[]');
    pending.push(entry);
    localStorage.setItem(this.pendingSyncKey, JSON.stringify(pending));
  }

  async retryPendingSync() {
    if (!this.userId) return;

    const pending = JSON.parse(localStorage.getItem(this.pendingSyncKey) || '[]');
    if (pending.length === 0) return;

    const stillPending = [];
    for (const entry of pending) {
      const result = await saveCalculation(this.userId, entry);
      if (!result.success) {
        stillPending.push(entry);
      }
    }

    localStorage.setItem(this.pendingSyncKey, JSON.stringify(stillPending));
  }
}
