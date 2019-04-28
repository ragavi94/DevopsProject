var express = require("express"),
bodyParser = require('body-parser'),
cors = require('cors'),
marqdown = require('./marqdown.js'),
fs = require('fs');

var app = express();
app.use(express.json());

app.post("/mtoh", (req, res, next) => {
 console.log(req.body.key);
 var text = marqdown.render( req.body.key );
 console.log("---------------------------------------Output-------------------------------------------------------");
 console.log(text);
 res.send(text);
});

app.listen(5001, () => {
 console.log("Server running on port 5001");
});
