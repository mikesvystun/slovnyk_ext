'use strict';

class SlovnykBg {
  tabsQueue = [];

  initHandlers() {
    chrome.runtime.onMessage.addListener((request, sender) => {
      if (request.slovnykBgEvent) {
        this.tabsQueue.push(sender.tab);
        this[request.slovnykBgEvent.method](...[].concat(request.slovnykBgEvent.args || []));
      }
    });
  }

  callContent(method, args = []) {
    this.tabsQueue.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { slovnykContentEvent: { method: method, args: args } });
    });
    this.tabsQueue.length = 0;
  }

  ensureVocabularyAndCallContent() {
    Promise.resolve()
      .then(() => this.initStoredVariables())
      .then(() => this.tryUpdateDictionary())
      .then(() => {
        this.callContent('replaceWords', this.dictionary);
      });
  }
  initStoredVariables() {
    this.slovnykBgVersion = 3;
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['slovnykBgVersion', 'slovnykEnabled', 'dictionary'], data => {
        this.slovnykEnabled = data.slovnykEnabled || false;
        if (this.slovnykBgVersion === data.slovnykBgVersion) {
          this.dictionary = data.dictionary;
        } else {
          this.dictionary = {
            dictionarySize: 0,
            wordsMap: 0,
          };
        }
        this.slovnykEnabled ? resolve() : reject();
      });
    });
  }
  tryUpdateDictionary() {
    return fetch('https://new.slovotvir.org.ua/base/check').then(response => response.text()).then(dictionarySize => {
      if (this.dictionary.dictionarySize !== dictionarySize) {
        return this.updateDictionary(dictionarySize);
      }
    });
  }
  updateDictionary(dictionarySize) {
    return fetch('https://new.slovotvir.org.ua/base').then(response => response.json()).then(items => {
      let wordsMap = {};
      items.forEach(([ id, word, translation ]) => {
        wordsMap[word] = translation;
      });
      this.dictionary = { dictionarySize, wordsMap };
      chrome.storage.local.set({ dictionary: this.dictionary, slovnykBgVersion: this.slovnykBgVersion });
    });
  }
}

let slovnykBg = new SlovnykBg();

slovnykBg.initHandlers();
