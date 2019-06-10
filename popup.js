'use strict';

class SlovnykPopup {
  constructor() {
    this.prepareSwitcher();
  }

  prepareSwitcher() {
    let switcherInput = document.getElementById('switcher');

    chrome.storage.local.get(['slovnykEnabled'], data => {
      this.slovnykEnabled = data.slovnykEnabled;
      switcherInput.checked = data.slovnykEnabled;

      switcherInput.addEventListener('click', () => {
        this.slovnykEnabled = switcherInput.checked;
        chrome.storage.local.set({ slovnykEnabled: this.slovnykEnabled });
        this.slovnykEnabledToggled();
      });
    });
  }
  slovnykEnabledToggled() {
    // chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    //   let method = this.slovnykEnabled ? 'replaceWords' : 'clearSlovnyk';
    //   chrome.tabs.sendMessage(tab.id, { slovnykContentEvent: { method: method, args: null } });
    // });
  }
}

let slovnykPopup = new SlovnykPopup();
