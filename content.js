function needSync() {
  $.ajax({
    url: "http://localhost:3000/base/check",
    type: 'GET',
    success: function(actualsize) {

      chrome.storage.sync.get(null, function(result){

        var localsize = 0

	console.log('Assigned default localsize: ' + localsize)

      	if (Object.keys(result).includes('localsize')) {
	  
	  console.log("local storage exists, now need to overwrite defaut")

	  console.log(Object.keys(result));
	  chrome.storage.sync.get(['localsize'], function(result){
	    localsize = result.localsize;
	    console.log('default value overwritten with local value')
            console.log('Localsize1: ' + localsize);
            console.log('Actualsize1: ' + actualsize);
	  })
	}

        if (actualsize != localsize){
	
          console.log('now checking if localsize is equal to actual size. / should not be equal')

          console.log('Localsize2: ' + localsize);
          console.log('Actualsize2: ' + actualsize);

          chrome.storage.sync.clear();
          chrome.storage.sync.set({'localsize': actualsize});
	  chrome.storage.sync.get(['localsize'], function(result){
	    localsize = result.localsize;
	  })
          // syncSlovnyk();
          console.log('Slovnyk synced, actual size: ' + localsize);
        }

      });
    }
  });
}


function syncSlovnyk() {
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


$('body').mouseup(function() {

needSync();

var i = getSelectionText();

$.ajax({
  // url: "https://new.slovotvir.org.ua/request",
  url: "http://localhost:3000/request",
  type: "POST", 
  data: {
    'original': i
  },
  success: function(resp){
    console.log(hasResponse(resp))
    if (hasResponse(resp)) {
      console.log("to replace: " + i);
      for (var prop in resp) {
        console.log("prop: " + prop)
        console.log("val: " + resp[prop])

        var wordCount = i.split(' ').length

        var index = 0;
        do {
          i = i.replace(prop, resp[prop] );
          index ++;
        } while( index < wordCount + 1);
      };
    console.log("result: " + i);
    };
  },
});


});
