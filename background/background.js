'use strict';

chrome.runtime.onInstalled.addListener(() => {
  Promise.resolve()
    .then(() => chrome.storage.promise.local.clear())
    .then(() => chrome.storage.promise.local.set({ slovnykEnabled: true }))
    .then(() => DictionaryUpdater.perform());
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.bgEvent === 'updateDictionary') {
    DictionaryUpdater.perform({ forceUpdate: true }).then(({ dictionary }) => {
      sendResponse({
        success: DictionaryUpdater.lastError == null,
        errorMessage: DictionaryUpdater.lastError && DictionaryUpdater.lastError.message,
        lastUpdated: DictionaryUpdater.lastUpdated,
        dictionary,
      });
    });
    return true;
  }
  // else if (request.bgEvent === 'fetchDictionary') {
  //   DictionaryUpdater.perform().then(() => {
  //     sendResponse({
  //       dictionary: DictionaryUpdater.lastError == null,
  //       errorMessage: DictionaryUpdater.lastError && DictionaryUpdater.lastError.message,
  //       lastUpdated: DictionaryUpdater.lastUpdated,
  //     });
  //   });
  //   return true;
  // }
});
