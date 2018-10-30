// checks if local storage needs to sync data with server (compares number of cases locally with number provided by server)

function needSync() {
  $.ajax({
    url: "https://new.slovotvir.org.ua/base/check",
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
    url: "https://new.slovotvir.org.ua/base",
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
        url: "https://new.slovotvir.org.ua/base/check",
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
    if (key == 'localsize' || key == 'switcher' ) { continue; };
    // lowercase ending with a space
    text = text.replace( key + " ", "<span style='color:green'>" + result[key] + "</span> " );
    // lowercase ending with a .
    text = text.replace( key + ".", "<span style='color:green'>" + result[key] + "</span>." );
    // lowercase ending with a ,
    text = text.replace( key + ",", "<span style='color:green'>" + result[key] + "</span>," );
    // lowercase ending with a !
    text = text.replace( key + "!", "<span style='color:green'>" + result[key] + "</span>!" );
    // lowercase ending with a ?
    text = text.replace( key + "?", "<span style='color:green'>" + result[key] + "</span>?" );
    // lowercase ending with a &
    text = text.replace( key + "&", "<span style='color:green'>" + result[key] + "</span>&" );
    // lowercase ending with a <
    text = text.replace( key + "<", "<span style='color:green'>" + result[key] + "</span><" );
    // uppercase ending with a space (in the beginning of a sentence)
    text = text.replace( key.substr(0,1).toUpperCase() + key.substr(1) + " ", "<span style='color:green'>" + result[key].substr(0,1).toUpperCase() + result[key].substr(1) + "</span> " );
  }
  return text;
}


// main function
$( document ).ready(function() {

  needSync();
  
  var tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'];

  chrome.storage.sync.get(null, function(result){
    if (result.switcher) {
      for ( var i = 0; i < tags.length; i++ ) {
        $( tags[i] ).each (function() {
          $(this).html(replaceLoanwords($(this).text(), result));
        });
      }
    }
  });     

});

