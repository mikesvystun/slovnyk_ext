function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
    }
  return true;
}


var i = $('h1').text().toLowerCase();
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
      $('h1').css("text-decoration", "line-through").after('<h1>' + i + '</h1>');
    };
  },
});
