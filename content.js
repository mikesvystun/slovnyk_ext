// checks if local storage needs to sync data with server (compares number of cases locally with number provided by server)
function needSync() {
  $.ajax({
    url: "http://localhost:3000/base/check",
    type: 'GET',
    success: function(actualsize) {


      console.log("Actual size: " + actualsize);

      chrome.storage.sync.get(null, function(result){

      	if (Object.keys(result).includes('localsize')) {
          chrome.storage.sync.get(null, function(result){
            localsize = result.localsize;
          
            console.log("Local size: " + localsize);
          
            if (actualsize == localsize) {
              console.log("No need to sync")
            }

            if (actualsize != localsize) {
              console.log("Syncing slovnyk to match new actual size")
              syncSlovnyk();
            }
          })
        } else {
          console.log("Syncing slovnyk for the first time")
          syncSlovnyk();
        }
      });
    }
  });
}

// syncs local storage with server
function syncSlovnyk() {
  chrome.storage.sync.clear();
  $.ajax({ 
    url: "http://localhost:3000/base",
    type: "GET",
    success: function(resp) {
      var i = 0
      do {
        var cas = {};
        cas[resp[i].original] = resp[i].translation;
        chrome.storage.sync.set(cas);
        i ++;
      } while (i < resp.length);

      $.ajax({
        url: "http://localhost:3000/base/check",
        type: 'GET',
        success: function(actualsize) {
          chrome.storage.sync.set({'localsize': actualsize}); 
        }             
      });
    }
  });  
}

// replace loan words in one block of text
// next: need to add here handling of words starting with caputal letters and those ending with punctiation symbols
function replaceLoanwords(text, result) {
  for (var key in result) {
    if (key == 'localsize') { continue; };
    // lowercase ending in a space
    text = text.replace( key + " ", " <span style='color:blue'>" + result[key] + "</span> " );
    // lowercase ending in a .
    text = text.replace( key + ".", " <span style='color:blue'>" + result[key] + "</span>." );
    // lowercase ending in a ,
    text = text.replace( key + ",", " <span style='color:blue'>" + result[key] + "</span>," );
    // lowercase ending in a !
    text = text.replace( key + "!", " <span style='color:blue'>" + result[key] + "</span>!" );
    // lowercase ending in a ?
    text = text.replace( key + "?", " <span style='color:blue'>" + result[key] + "</span>?" );
    // lowercase ending in a <
    text = text.replace( key + "<", " <span style='color:blue'>" + result[key] + "</span><" );
    // uppercase ending in a space (in the beginning of a sentence)
    text = text.replace( key.substr(0,1).toUpperCase() + key.substr(1) + " ", "<span style='color:blue'>" + result[key].substr(0,1).toUpperCase() + result[key].substr(1) + "</span> " );
  }
  return text;
}


// main function
$( document ).ready(function() {

  needSync();

  chrome.storage.sync.get(null, function(result){
    var text = $('p').text();
    console.log(text);
    text = replaceLoanwords(text, result);
    $('p').html(text);
    console.log(text);
  });     
});

