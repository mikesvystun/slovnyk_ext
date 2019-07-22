// see https://github.com/akiomik/chrome-storage-promise

'use strict';

chrome.storage.promise = {

  sync: {
    get: (keys) => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (items) => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
    },
    set: (items) => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.set(items, () => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    getBytesInUse: (keys) => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.getBytesInUse(keys, (items) => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
    },
    remove: (keys) => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.remove(keys, () => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    clear: () => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.clear(() => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  },

  local: {
    get: (keys) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (items) => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
    },
    set: (items) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    getBytesInUse: (keys) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.getBytesInUse(keys, (items) => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
    },
    remove: (keys) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove(keys, () => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    clear: () => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  },

  onChanged: {
    addListener: () => {
      return new Promise((resolve, reject) => {
        chrome.storage.onChanged.addListener((changes, areaName) => {
          let err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(changes, areaName);
          }
        });
      });
    }
  }
};
