var express = require('express');
var app = new express();
var port = 9002;
app.use(express.static('./dist'));

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return
  }
  console.log('server running at 9002')
});
