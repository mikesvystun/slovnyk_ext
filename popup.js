document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    var i = document.createElement('p');
    i.className = 'title';
    i.innerHTML = tabs[0].title + ' - ' + tabs[0].title.length.toString() + ' symbols';
    var tag = document.getElementsByTagName('body')[0];
    tag.appendChild(i);
  });
}, false);
