document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    var i = document.createElement('h1');
    i.innerHTML = tabs[0].title;
    var tag = document.getElementsByTagName('body')[0];
    tag.appendChild(i);
  });
}, false);
