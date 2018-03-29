var i = $('h1').text();
console.log('started');
console.log(i);
$.ajax({
  url: "http://localhost:3000/request",
  type: "POST", 
  data: {
    'original': i
  },
  success: function(resp){
    console.log(resp);
  },
});
