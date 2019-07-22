'use strict';

class DictionaryUpdater {
  static get oneHourInMilliseconds() { return 60 * 60 * 1000 }
  static storage = chrome.storage.promise.local;
  static lastUpdated = 0;
  static lastError = null;
  static isUpdating = false;

  static async perform({ forceUpdate } = {}) {
    await this.performIfStale(forceUpdate, async () => {
      await this.updateDictionaryIfChanged();
    });
    return await this.storage.get('wordsMap');
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

  static async updateDictionaryIfChanged() {
    let response = await fetch('https://new.slovotvir.org.ua/base/check');
    if (!response.ok) { throw new Error('Cannot check') }

    let dictionaryCheck = await response.text();
    let localDictionaryCheck = await this.storage.get('dictionaryCheck');

    if (localDictionaryCheck !== dictionaryCheck) {
      await this.updateDictionary();
      await this.storage.set({ dictionaryCheck });
    }
  }

  static async updateDictionary() {
    let response = await fetch('https://new.slovotvir.org.ua/base');
    if (!response.ok) { throw new Error('Cannot download') }

    let items = await response.json();
    let wordsMap = {};
    items.forEach(([ id, word, translation ]) => { wordsMap[word] = translation });
    await this.storage.set({ wordsMap });
  }
}
