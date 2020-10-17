const express = require('express');
const fs = require('fs')
const multer  = require('multer');
const bodyParser = require('body-parser')

// Setup
const app = express();
const port = 8080

var upload = multer({ dest: 'images/'});

app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "10.245.111.82:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Launch app
app.listen(port, () => {
  console.log(
    'Launching app... http://localhost:' + port + '\n'
  );
});

app.get("/", function(req, res) {
  res.send("Hello, world")
})


app.post(
  '/upload_receipt_img',
  upload.single("image"),
  function(req, res) {
    console.log("File uploaded")
    console.log(req.file);
    var file = __dirname + '/images/' + req.file.filename + ".jpeg";
    fs.rename(req.file.path, file, function(err) {
      if (err) {
        console.log(err);
        res.send(500);
      } else {
        res.json({
          message: 'File uploaded successfully',
          filename: req.file.filename
        });
      }
    });
  }
)



// upload a receipt to the server
app.post("/upload_receipt_data",
  function(req, res) {


    // get the last file id from the data file
    var lastId = 0
    fs.readFile(
      __dirname + "/data/data.txt",
      function(err, data) {
        lastId = parseInt(data)
        console.log("Receipt Uploaded")
        fs.writeFile(
          __dirname + "/data/receipts/" +
            lastId + ".json",
          JSON.stringify(req.body),
          function(err) {
            console.log("Test Written")

            // update last id
            fs.writeFile(
              __dirname + "/data/data.txt",
              lastId+1,
              function(err) {
                res.send("done")
              }
            );
        })
      })
});


// get a receipt by id
app.get("/receipt/:id",
  function(req, res) {
    console.log("receipt loading...")
    console.log(req.params.id)
    fs.readFile(
      __dirname + '/data/receipts/' +
        req.params.id + ".json",
      function(err, data) {
        console.log(JSON.parse(data))
        res.send(JSON.parse(data))
      })
  })


app.get("/lastReceipt",
  function(req, res) {
    fs.readFile(
      __dirname + "/data/data.txt",
      function(err, lastIdData) {
        let lastId = parseInt(lastIdData) - 1
          fs.readFile(
            __dirname + '/data/receipts/' + lastId + ".json",
            function(err, data) {
              console.log(JSON.parse(data))
              res.send(JSON.parse(data))
          })
      }
    )
  })


// get five receipts starting at a particular index
app.get("/bulk/receipts/:start",
  function(req, res) {
    fs.readdir(
      __dirname + "/data/receipts/",
      function (err, files) {
        //handling error
        if (err) {
          return console.log(
            'Unable to scan directory: ' + err);
        }

        let receiptList = []
        // add 5 receipts to a json array
        for(var i = req.params.start;
          i < files.length && i < 5; i++) {
          // get all the json for
          // the first 5 receipts
          var receiptData = fs
              .readFileSync(files[i])
          receiptList
            .push(JSON.parse(receiptData))
        }

        res.send(receiptList)
    });
  })
