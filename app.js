
const express = require('express');
const app = express();
const router = express.Router();

const path = __dirname + '/views/';
const port = 8080;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

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

router.get('/admin-panel/', function (req, res) {

    var query = "";
    var showall = req.query.showall;

    if (showall == "true/") {
        query = `select * from lots;`;
    }
    else {
        query = `select * from lots limit 50;`;
    }


    handleSql(query, "return lots", function (allLots) {
        var string = JSON.stringify(allLots);
        res.render(path + 'admin-panel/admin-panel.html', { allLots: string });
    });

});

  router.get('/scan/scan', function(req,res){
    res.sendFile(path + 'scan.html');
  });

app.use(express.static(path));
app.use('/', router);

app.listen(port, function () {
    console.log(`I\'m listening for you on port ${port}!`)
});


var mysql = require('mysql');

function handleSql(query, responseAction = "", callback) {

    var con = mysql.createConnection({
        host: "mysql78.unoeuro.com",
        user: "multicrypt_io",
        password: "D2gnzGrdcamy",
        database: "multicrypt_io_db"
    });
    con.connect(function (err) {
        if (err) throw err;
    });
    con.query(query, function (err, result, fields) {
        if (err) throw err;

        if (responseAction == "return id") {
            return callback(result[0].id);
        }
        else if (responseAction == "return lots") {
            callback(result);
        }
            
    });
    con.end();
};


app.get('/admin-panel/getNewestId', function (req, res) {

    var query = `select * from lots order by id desc limit 1;`;

    handleSql(query, "return id", function (result) {
        res.send(result.toString());
    });
    
});


app.get('/admin-panel/newLot', function (req, res) {
    var values = req.query.values;

    var valuesArray = values.split("_");

    var columns = "`shelf`, `tray`, `lot`, `type`, `status`, `sown`, `underlight`, `partialHarvest`, `harvested`, `weight`, `sentTo`";
    var valuesStringTmp = `${valuesArray[0]}, ${valuesArray[1]}, ${valuesArray[2]}, '${valuesArray[3]}', '${valuesArray[4]}', '${valuesArray[5]}', '${valuesArray[6]}', '${valuesArray[7]}', '${valuesArray[8]}', ${valuesArray[9]}, '${valuesArray[10]}'`;
    var valuesString = valuesStringTmp.replace(/'null'/g, "null");

    var query = `insert into lots (${columns}) values (${valuesString});`;

    handleSql(query);
    

    res.send("WHEEE (response text)");
});

app.get('/admin-panel/updateLot', function (req, res) {
    var value = req.query.value;
    var attribute = req.query.attribute;
    var id = req.query.id;

    var insertAsInt = req.query.insertasint;
    var citation = "'";
    if (insertAsInt == "true") {
        citation = "";
    }

    var query = `update lots set ${attribute} = ${citation}${value}${citation} where id = ${id};`;

    handleSql(query);


    res.send("WHEEE (response text)");
});



app.get('/searching', function (req, res) {
    var lot = req.query.lot;

    var action = req.query.action;

    var query = "insert into test (text) values ('" + lot + "-" + action + "');";

    handleSql(query);

    res.send("WHEEE (response text)");
    //con.end();
});