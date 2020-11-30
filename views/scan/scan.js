var formReady = false;
var actionField = document.getElementById("action");
var lotField = document.getElementById("lot");
var messageField = document.getElementById("message");


function sendData() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("message2").innerHTML = this.responseText;
        }
    };
    xmlhttp.open("GET", "searching?lot=" + lotField.value + "&action=" + actionField.value, true);
    xmlhttp.send();
}


document.body.addEventListener('keyup', function (e) {
    if (e.keyCode == 13) { //dvs. enter knappen.

        if (!formReady) {
            formReady = true;
            actionField.focus();
        }

        else {
            sendData();
            console.log("form sent");
            formReady = false;
            lotField.focus();
            lotField.value = "";
            actionField.value = "";
        }

    }
});