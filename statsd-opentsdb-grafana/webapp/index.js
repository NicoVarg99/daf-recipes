'use strict';

var fs = require('fs')
var express = require('express')
var cors = require('cors')
var app = express()
const { spawn } = require('child_process');

var APIkey;

//Verifies that the user is allowed to see graphs
function verify(key) {
  var request = require('sync-request');
  var res = request('GET', 'http://localhost:3000', {
  'headers': {
    'Authorization': 'Bearer eyJrIjoiTG5Jck5JVW5BTVRwMDhJdW85MzZCQmw1NnR1aU02ZDciLCJuIjoibXlrZXkiLCJpZCI6MX0='
  }
});

  if (res.statusCode == 200) {
    //Authorized
    return true
  } else {
    //Unauthorized
    return false;
  }
}


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/graph/:apikey', sendGraph);
function sendGraph(req, res, next) {
  var data = req.params;
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

  //Store the API key
  APIkey = data.apikey;

  console.log("Graph requested by token " + data.apikey + ".");
  if (verify(APIkey)) {
    res.sendFile('/home/nicola/Repos/daf-recipes/statsd-opentsdb-grafana/webapp/index.html');
  } else {
    res.send("Unauthorized");
  }

}

app.get('/snapshot.png', sendSnapshot);
function sendSnapshot(req, res) {
  if (verify(APIkey)) {
    res.sendFile('/home/nicola/Repos/daf-recipes/statsd-opentsdb-grafana/webapp/snapshot.png'); // Send the file data to the browser.
  } else {
    res.send("Unauthorized");
  }
}

app.get('/*', function(req, res, next) {
  res.send("Unauthorized");
})

app.listen(3001, function () {
  console.log('CORS-enabled web server listening on port 3001')
})

var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { console.log(stdout) }

//Generate the image every 5 seconds
function myFunc(arg) {
  exec('curl -H "Authorization: Bearer eyJrIjoiTG5Jck5JVW5BTVRwMDhJdW85MzZCQmw1NnR1aU02ZDciLCJuIjoibXlrZXkiLCJpZCI6MX0=" "http://localhost:3000/render/dashboard-solo/db/vecchio?panelId=1&orgId=1&from=1507408937119&to=1507409826503&width=1000&height=500&tz=UTC%2B02%3A00" > snapshot.png', puts);
}
setInterval(myFunc, 5000);

//res.send("<html> <head> </head> <body> <script> var xhr = new XMLHttpRequest(); xhr.responseType = 'blob'; xhr.onreadystatechange = function () { if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) { var img = document.createElement('img'); img.src = URL.createObjectURL(xhr.response); document.body.appendChild(img); } }; xhr.open('GET', 'http://localhost:3000/render/dashboard-solo/db/vecchio', true); xhr.setRequestHeader('Authorization', 'Bearer