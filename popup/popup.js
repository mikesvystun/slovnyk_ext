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
  }

  static slovnykEnabledToggled(slovnykEnabled) {
    this.dicStatusEl = this.dicStatusEl || document.querySelector('.dic-status');
    this.dicStatusEl.classList.remove('dic-status--success');
    this.dicStatusEl.classList.remove('dic-status--failure');
    this.dicStatusEl.classList.remove('dic-status--disabled');
    this.dicStatusEl.innerText = '';

    if (slovnykEnabled) {
      chrome.runtime.sendMessage({ bgEvent: 'updateDictionary' }, data => {
        let success = data.success;
        let text = success ? `Словник оновлено ${data.lastUpdated}` : data.errorMessage;

        this.dicStatusEl.classList.toggle('dic-status--success', success);
        this.dicStatusEl.classList.toggle('dic-status--failure', !success);
        this.dicStatusEl.innerText = text;
      });
    } else {
      this.dicStatusEl.classList.add('dic-status--disabled');
      this.dicStatusEl.innerText = 'Словник вимкнено';
    }
  }

}

SlovnykPopup.prepareSwitcher();