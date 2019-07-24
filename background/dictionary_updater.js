'use strict';

class DictionaryUpdater {
  static get oneHourInMilliseconds() { return 60 * 60 * 1000 }
  static storage = chrome.storage.promise.local;
  static lastUpdated = 0;
  static lastError = null;
  static isUpdating = false;

  static async perform({ forceUpdate } = {}) {
    await this.performIfStale(forceUpdate, async () => {
      await this.updateDictionary();
    });
    return await this.storage.get('dictionary');
  }

  static async performIfStale(forceUpdate, onSuccess) {
    if (!this.isUpdating && (forceUpdate || +new Date() > this.lastUpdated + this.oneHourInMilliseconds)) {
      try {
        this.isUpdating = true;
        this.lastError = null;
        await onSuccess();
        this.lastUpdated = +new Date();
      } catch (e) {
        this.lastError = e;
      } finally {
        this.isUpdating = false;
      }
    }
  }

  static async updateDictionary() {
    let { lastModifiedStr } = await this.storage.get('lastModifiedStr');
    let options = { headers: { 'If-Modified-Since': lastModifiedStr } };

    let response = await fetch('https://new.slovotvir.org.ua/api/dictionary', options);
    if (response.status === 304) { return }
    if (!response.ok) { throw new Error('Помилка завантаження') }

    lastModifiedStr = response.headers.get('last-modified');
    await this.storage.set({ lastModifiedStr });

    let dic = await response.json();
    let dictionary = {
      wordsCount: dic['words_count'],
      pairs: dic['pairs'],
      pairsCount: Object.keys(dic['pairs']).length,
      lastModified: new Date(lastModifiedStr).toLocaleDateString('uk'),
    };
    await this.storage.set({ dictionary });
  }

  // static camelize(s) {
  //   return s.replace(/(_[a-z])/ig, $1 => {
  //     return $1.toUpperCase().replace('_', '');
  //   });
  // };
  //
  // static camelizeKeys(o) {
  //   const n = {};
  //   Object.keys(o).forEach(k => {
  //     n[this.camelize(k)] = o[k];
  //   });
  //   return n;
  // }
}
