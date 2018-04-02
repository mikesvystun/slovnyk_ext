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
var i = getSelectionText();

$.ajax({
  url: "https://new.slovotvir.org.ua/request",
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
