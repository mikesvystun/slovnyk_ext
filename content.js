// checks if local storage needs to sync data with server (compares number of cases locally with number provided by server)

function Vocabulary() {
  this.needSync = function () {
    var _this = this;
    $.ajax({
      url: "https://new.slovotvir.org.ua/base/check",
      type: 'GET',
      success: function (actualsize) {

        console.log("Actual size: " + actualsize);

        chrome.storage.sync.get(null, function (result) {

          if (Object.keys(result).includes('localsize')) {
            chrome.storage.sync.get(null, function (result) {
              localsize = result.localsize;

              console.log("Local size: " + localsize);

              if (actualsize == localsize) {
                console.log("No need to sync")
              }

              if (actualsize != localsize) {
                console.log("Syncing slovnyk to match new actual size")
                _this.syncSlovnyk();
              }
            })
          } else {
            console.log("Syncing slovnyk for the first time")
            _this.syncSlovnyk();
          }
        });
      }
    });
  }

  // syncs local storage with server
  this.syncSlovnyk = function () {
    chrome.storage.sync.clear();
    $.ajax({
      url: "https://new.slovotvir.org.ua/base",
      type: "GET",
      success: function (resp) {
        var i = 0
        var cas = {};
        resp.forEach(function(item, index) {
          if (cas[item.original]) {
            if (!cas[item.original].match(new RegExp(item.translation))) {
              cas[item.original] = cas[item.original] + ', ' + item.translation;
            }
          } else {
            cas[item.original] = item.translation;
          }
        });
        chrome.storage.sync.set(cas);

        $.ajax({
          url: "https://new.slovotvir.org.ua/base/check",
          type: 'GET',
          success: function (actualsize) {
            chrome.storage.sync.set({ 'localsize': actualsize });
          }
        });
      }
    });
  }


  this.replaceLoanwords = function (_this, splittedText, result, item, index) {
    var replacement = undefined;

    if (result[item.toLocaleLowerCase()]) {
      oldValue = item;
      replacement = result[item.toLocaleLowerCase()];
      twoWordKey = splittedText[index - 1] + ' ' + item;

      if (splittedText[index - 1] && result[twoWordKey.toLocaleLowerCase()]) {
        oldValue = twoWordKey;
        replacement = result[twoWordKey.toLocaleLowerCase()];
      }
    }

    if (replacement && _this.childNodes[0] && _this.childNodes[0].nodeType == 3) {
      var statement = new RegExp(oldValue, 'i');
      var newText = oldValue + ' (' + replacement + ')';

      _this.childNodes[0].nodeValue = _this.childNodes[0].nodeValue.replace(statement, newText);
      replacement = undefined;
    }
  }

  this.performCheck = function () {
    var _this = this;
    var tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'em', 'i'];

    chrome.storage.sync.get(null, function (result) {

      if (result.switcher) {
        tags.forEach(function(item) {
          $(item).each(function () {
            var oldValue = undefined;
            var __this = this;
            var text = $(this).text()
            var splittedText = text.match(/[а-яїієґ'\-]+/gi);
            if (!splittedText) { return };

            splittedText.forEach(function(item, index) {
              _this.replaceLoanwords(__this, splittedText, result, item, index);
            });

          });
        });
      }
    });
  }
}


// main function
$(document).ready(function () {
  var vocabulary = new Vocabulary();
  vocabulary.needSync();
  vocabulary.performCheck();
});
