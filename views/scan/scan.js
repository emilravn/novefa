var formReady = false;
var actionField = document.getElementById("action");
var trayField = document.getElementById("lot");
var messageField = document.getElementById("message");

document.body.addEventListener('keyup', function (e) {
    if (e.keyCode == 13) { //enter key

        if (!formReady) {
            formReady = true;
            actionField.focus();
        }

        else {
            sendData();
            formReady = false;
            trayField.focus();
            trayField.value = "";
            actionField.value = "";
        }

    }
});

function sendData() {
    var tmp = actionField.value;
    var firstChar = tmp.charAt(0);

    if (firstChar == "F") { //tilføj nyt frø

        lotCount++;
        var lot = "L" + pad(lotCount, 9).toString();
        updateLotCount();
        var tray = trimBarcode(trayField.value);
        var seed = actionField.value;

        newLotToDatabase(tray, seed, lot);
    }
    else if (firstChar == "S") { //update shelf.
        var tray = trimBarcode(trayField.value);
        var shelf = trimBarcode(actionField.value);
        updateShelfDatabase(tray, shelf);

        updateAktivesensorer(tray, shelf);
    }
    else if (firstChar == "T") { //ændre status, fx under light og harvested
        var tray = trimBarcode(trayField.value);
        getStatus(tray);
    }
}

function newLotToDatabase(trimmedTray, seed, lot) { //sender tray, lot, og seed barcode.
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("message2").innerHTML = this.responseText;
        }
    };
    xmlhttp.open("GET", `newLot?tray=${trimmedTray}&seed=${seed}&lot=${lot}`, true);
    xmlhttp.send();
}

function updateShelfDatabase(trimmedTray, trimmedShelf) { 
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("message2").innerHTML = this.responseText;
        }
    };
    xmlhttp.open("GET", `updateShelf?tray=${trimmedTray}&shelf=${trimmedShelf}`, true);
    xmlhttp.send();
}

function trimBarcode(barcode) {
    var s = barcode.substring(1); //fjerner første bogstav, så vi kun har et nummer. e.g. 0000004

    while (s.charAt(0) === '0') {
        s = s.substring(1);
    }

    return s;
}



function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function updateLotCount() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        }
    };
    xmlhttp.open("GET", `/admin-panel/updateCounts?type=lots&count=${lotCount}`, true);
    xmlhttp.send();
}

function getStatus(tray) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var status = this.responseText;
            //updateStatus
            if (status == "sown") {
                updateStatus(tray, "underLight");
            }
            else {
                updateStatus(tray, "harvested");
            }
        }
    };
    xmlhttp.open("GET", `/scan/getStatus?tray=${tray}`, true);
    xmlhttp.send();
}

function updateStatus(tray, newStatus) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        }
    };
    xmlhttp.open("GET", `/scan/updateStatus?tray=${tray}&newstatus=${newStatus}`, true);
    xmlhttp.send();
}

function updateAktivesensorerAction(shelf, lot) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        }
    };
    xmlhttp.open("GET", `/scan/updateAktivesensorer?shelf=${shelf}&lot=${lot}`, true);
    xmlhttp.send();
}

function updateAktivesensorer(tray, shelf) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var lot = this.responseText;
            var trimmedLot = trimBarcode(lot);

            updateAktivesensorerAction(shelf, trimmedLot);
        }
    };
    xmlhttp.open("GET", `/scan/getLotFromTray?tray=${tray}`, true);
    xmlhttp.send();
}

