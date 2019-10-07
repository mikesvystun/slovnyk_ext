'use strict';

class SlovnykPopup {
  static storage = chrome.storage.promise.local;

  static prepareSwitcher() {
    let switcherInput = document.getElementById('switcher');

    this.storage.get('slovnykEnabled').then(data => {
      switcherInput.checked = data.slovnykEnabled;

      switcherInput.addEventListener('click', () => {
        let slovnykEnabled = switcherInput.checked;

        this.storage.set({ slovnykEnabled })
          .then(() => this.slovnykEnabledToggled(slovnykEnabled));
      });

      this.slovnykEnabledToggled(data.slovnykEnabled);
    });

    this.assignLinkHandlers();
  }

  static slovnykEnabledToggled(slovnykEnabled) {
    document.querySelector('.dic-enabled-text').innerText = slovnykEnabled ? 'Словник працює' : 'Словник вимкнено';
    this.dicStatusEl = this.dicStatusEl || document.querySelector('.dic-status');
    this.failureEl = this.failureEl || this.dicStatusEl.querySelector('.dic-status--failure');

    this.dicStatusEl.classList.toggle('is-hidden', !slovnykEnabled);

    if (slovnykEnabled) {
      chrome.runtime.sendMessage({ bgEvent: 'updateDictionary' }, data => {
        let success = data.success;

        this.failureEl.classList.toggle('is-hidden', !success);

        if (success) {
          this.dicStatusEl.querySelector('.dic-status--last-updated').innerText = data.dictionary.lastModified;
          this.dicStatusEl.querySelector('.dic-status--words').innerText = data.dictionary.wordsCount;
          this.dicStatusEl.querySelector('.dic-status--word-forms').innerText = data.dictionary.pairsCount;
        } else {
          this.failureEl.innerText = data.errorMessage;
        }
      });
    }
  }

  static assignLinkHandlers() {
    for (let link of document.querySelectorAll('a')) {
      link.addEventListener('click', e => {
        chrome.tabs.create({ url: e.target.href });
      });
    }
  }

}

SlovnykPopup.prepareSwitcher();
