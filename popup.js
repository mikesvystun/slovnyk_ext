document.addEventListener('DOMContentLoaded', function() {
  var switcher = document.getElementById('switcher');

  switcher.addEventListener('click', function() {
    if (switcher.checked) {
      chrome.storage.sync.set({'switcher': 1});

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      });

    } else {
      chrome.storage.sync.set({'switcher': 0});

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
      });

    }
  })

  window.onload = function() {
    chrome.storage.sync.get(null, function(result) {
      switcher.checked = result.switcher;
    })
  }
})
