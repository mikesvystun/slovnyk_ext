function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }
  return text;
}

function isEmpty(obj) {
  for(var key in obj) {
  if(obj.hasOwnProperty(key))
    return false;
  }
    return true;
}


$('body').mouseup(function() {
var i = getSelectionText();

console.log("to replace: " + i);
$.ajax({
  url: "http://localhost:3000/request",
  type: "POST", 
  data: {
    'original': i
  },
  success: function(resp){
    console.log(isEmpty(resp))
    if (!isEmpty(resp)) {
      for (var prop in resp) {
        console.log("prop: " + prop)
        console.log("val: " + resp[prop])
        i = i.replace(prop, resp[prop] );
      };
    console.log("result: " + i);
    i.parent().after('<h1>' + i + '</h1>');
    };
  },
});


});
