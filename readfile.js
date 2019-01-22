var fs = require("fs");
var path = require("path");

var filepath = path.join(__dirname, "output.ogg");

console.log(filepath);

fs.readFile(filepath, function(err, data) {
  if (err) throw err;
  console.log("ok");
});

console.log("after calling readFile");
