/**
 * OMNIQR — History & Local Bookmarks Manager
 */

const STORAGE_KEY = 'omni_qr_history_v1';
const MAX_HISTORY_ITEMS = 30;

export class QRHistoryManager {
  static getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load QR history', e);
      return [];
    }
  }

  static saveItem(item) {
    try {
      const list = this.getHistory();
      // Remove duplicates with same payload
      const filtered = list.filter(x => x.payload !== item.payload);
      
      const record = {
        id: 'qr_' + Date.now(),
        timestamp: new Date().toISOString(),
        title: item.title || 'Untitled QR',
        type: item.type || 'text',
        payload: item.payload,
        thumbUrl: item.thumbUrl || '',
        config: item.config || {}
      };

      filtered.unshift(record);

      if (filtered.length > MAX_HISTORY_ITEMS) {
        filtered.pop();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return record;
    } catch (e) {
      console.warn('Failed to save QR history', e);
      return null;
    }
  }

  static deleteItem(id) {
    try {
      const list = this.getHistory().filter(x => x.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list;
    } catch (e) {
      return [];
    }
  }

  static clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
}
