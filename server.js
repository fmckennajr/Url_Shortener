const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_KEY, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

let UrlSchema = new Schema({
  original_url: String,
  short_url: String
})

let urlModel = mongoose.model('urlModel', UrlSchema);
app.use(express.static('public'));
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/', function (req,res) {

  //   Generate random string for url
  function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
  let regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  if (req.body.url.toString().match(regex)) {
    let url = new urlModel({
   original_url: req.body.url.toString(),
   short_url: makeid(9)
  })
//  Insert url and encoded short url into database
 url.save((err) => {
  if(err){
   console.error(err);
 }
   else {
    // console.log("success");
    var formattedUrl = {"original_url":url.original_url,"short_url":url.short_url}
    res.send(formattedUrl)
   }
   }) 
  }
  else {
    res.send({"error":"invalid URL"})
  }


 

})

app.get('/api/shorturl/:shorturl', function(req,res) {
  // let shorturl =  req.params.shorturl;
  // let query = {"short_url": shorturl}

  urlModel.findOne({"short_url":req.params.shorturl}, function(err, result) {
    if(err) {
      
      res.send("error");
    } else {
      
      res.redirect(301, result.original_url.toString());
    }
  })
})

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(3000, function () {
  console.log('Listening on port 3000...');
});