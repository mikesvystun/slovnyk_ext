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

  // replace loan words in one block of text
  // next: need to add here handling of words starting with caputal letters and those ending with punctiation symbols
  // this.replaceLoanwords = function (text, result) {
  //   for (var key in result) {
  //     if (key == 'localsize' || key == 'switcher') { continue; };
  //
  //     var wordEndings = [",", "!", "?", "&", "<", " ", "."];
  //
  //
  //     for (i = 0; i < wordEndings.length; i++) {
  //
  //       if (text.includes(key + wordEndings[i])) {
  //
  //         text = text.replace(key + wordEndings[i], key + "<span style='color:green'> (" + result[key] + ")</span>" + wordEndings[i]);
  //
  //       }
  //       continue;
  //
  //       // uppercase ending with a space (in the beginning of a sentence)
  //       text = text.replace(key.substr(0, 1).toUpperCase() + key.substr(1) + " ", "<span style='color:green'>" + result[key].substr(0, 1).toUpperCase() + result[key].substr(1) + "</span> ");
  //     }
  //   }
  //   return text;
  // }
// };

  this.performCheck = function () {

    var _this = this;
    var tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'em', 'i'];

    chrome.storage.sync.get(null, function (result) {

      console.log(result)

      if (result.switcher) {
        for (var i = 0; i < tags.length; i++) {
          $(tags[i]).each(function () {
            var oldValue = undefined;
            var _this = this;
            var text = $(this).text()
            var splittedText = text.match(/[а-яїієґ'\-]+/gi);
            if (!splittedText) { return };
            splittedText.forEach(function(item, index) {
              var alreadyReplaced = false;
              var replacement = undefined;

              if (result[item.toLocaleLowerCase()] !== undefined) {
                oldValue = item;
                replacement = result[item.toLocaleLowerCase()];
                twoWordKey = splittedText[index - 1] + ' ' + item;
                if (splittedText[index - 1] && result[twoWordKey.toLocaleLowerCase()]) {
                  oldValue = twoWordKey;
                  replacement = result[twoWordKey.toLocaleLowerCase()];
                }
              }

              if (replacement && !alreadyReplaced) {
                var statement = new RegExp(oldValue, 'i');
                var newText = oldValue + '<span style="color:green">' + ' (' + replacement + ') </span>';
                console.log(newText)

                $(_this).html($(_this).html().replace(statement, newText));
                replacement = undefined;
              }
            });
          });
        }
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
