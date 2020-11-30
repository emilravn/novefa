
const express = require('express');
const app = express();
const router = express.Router();

const path = __dirname + '/views/';
const port = 8080;

router.use(function (req,res,next) {
    console.log('/' + req.method);
    next();
  });
  
router.get('/', function(req,res){
    res.sendFile(path + 'index.html');
  });
  
router.get('/anotherpage', function(req,res){
    res.sendFile(path + 'anotherpage.html');
  });

  router.get('/scan/scan', function(req,res){
    res.sendFile(path + 'scan.html');
  });

app.use(express.static(path));
app.use('/', router);

app.listen(port, function () {
    console.log(`I\'m listening for you on port ${port}!`)
});

app.get('/searching', function (req, res) {
    var mysql = require('mysql');

    var con = mysql.createConnection({
        host: "mysql78.unoeuro.com",
        user: "multicrypt_io",
        password: "D2gnzGrdcamy",
        database: "multicrypt_io_db"
    });

    var lot = req.query.lot;
    console.log(lot);

    var action = req.query.action;
    console.log(action);

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        con.query("insert into test (text) values ('"+lot+"-"+action+"');", function (err, result) {
            if (err) throw err;
            console.log("ROW INSERTED");
        });
    });

    res.send("WHEEE (response text)");
    //con.end();
});