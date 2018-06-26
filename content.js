function test() {
  var gag = {'asd': "testValue2"}
  chrome.storage.sync.set(gag, function() {
    console.log('Value is set to ' + gag['asd']);
  });

  chrome.storage.sync.get(null , function(result) {
    console.log('Value currently is ' + result.asd);
  });
}


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

      //this call doesn't seem to work. Fix it
      $.ajax({
        url: "http://localhost:3000/base/check",
        type: 'GET',
        success: function(actualsize) {
          chrome.storage.sync.set({'localsize': actualsize}); 
        }             
      });

      chrome.storage.sync.get(null, function(result){
        var allKeys = Object.keys(result)
        console.log("Stored data " + allKeys);
      });     

    }
  });  

}


function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }
  return text;
}

function hasResponse(obj) {
  for(var key in obj) {
  if(obj.hasOwnProperty(key))
    return true;
  }
    return false;
}

// replace loan words in a string
function replaceLoanwords(text) {
  var responce = {};
  var array = text.split(' ');
  //replace individual words
  
}


function findReplacement(word, responce) {
  
}




//main function. commented out for test purposes
$('body').mouseup(function() {

needSync();
// syncSlovnyk(); 

// var i = getSelectionText();

// $.ajax({
  // url: "https://new.slovotvir.org.ua/request",
//  url: "http://localhost:3000/request",
//  type: "POST", 
//  data: {
//    'original': i
//  },
//  success: function(resp){
//    console.log(hasResponse(resp))
//    if (hasResponse(resp)) {
//      console.log("to replace: " + i);
//      for (var prop in resp) {
//        console.log("prop: " + prop)
//        console.log("val: " + resp[prop])
//
//        var wordCount = i.split(' ').length

//        var index = 0;
//        do {
//          i = i.replace(prop, resp[prop] );
//          index ++;
//        } while( index < wordCount + 1);
//      };
//    console.log("result: " + i);
//    };
//  },
//});


});
