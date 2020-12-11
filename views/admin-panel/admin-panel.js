// Navigate to 'Program Files (x86)\Google\Chrome\Application'
//run 'chrome.exe --kiosk --kiosk-printing localhost:8080' in cmd
// Set default page as the application or navigate to it via google (CTRL-T = New tab)

// Hold the current count on amount of shelfs, trays, produce etc. (should be imported from database).
// Eg. select *from shelfs ORDER BY id DESC LIMIT 1; (then +1 for new barcode)
var ShelfCount = 0;
var TrayCount = 0;
var ProduceCount = 0;
var LotCount = 0;

// Adds leading zeros and gives the barcode a predetermined length
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function PrintProduce() {
    ProduceCount++; // Make Barcode one larger than the previous
    var ProduceBarcode = "F" + pad(ProduceCount, 9).toString(); // add prefix as well as leading 0's
    JsBarcode("#code128", ProduceBarcode); // Input the barcode into barcode.js, using the format Code128.
    printDivInPopUp(); // Prints the div in new window to get correct output
    updateCounts("seeds", ProduceCount);

    //tilføj den nye seed til databasen. og reset input field.
    var seedInput = document.getElementById("seedName");
    var seedName = seedInput.value;
    newSeedDatabase(ProduceBarcode, seedName);
    seedInput.value = "";
}

function newLot() {
    LotCount++;
    var string = "L" + pad(LotCount, 9).toString();
    updateCounts("lots", LotCount);
    return string;
}

function PrintShelf() {
    ShelfCount++;
    var ShelfBarcode = "S" + pad(ShelfCount, 9).toString();
    JsBarcode("#code128", ShelfBarcode);
    printDivInPopUp();
    updateCounts("shelf", ShelfCount);
}

function PrintTray() {
    TrayCount++;
    var TrayBarcode = "T" + pad(TrayCount, 9).toString();
    JsBarcode("#code128", TrayBarcode);
    printDivInPopUp();
    updateCounts("tray", TrayCount);
}

  // Take input from textfield and make it into a barcode
function ManualBarcodeEntry() {
    var text = document.getElementById("txt_input").value;
    JsBarcode("#code128", text);
    printDivInPopUp();
}

// Open barcode in new window, so it's the only element to print
function printDivInPopUp() {
    var divToPrint = document.getElementById('code128');
    var newWindow = window.open('', 'Print-Window');
    newWindow.document.open();
    newWindow.document.write('<link rel="stylesheet" type="text/css" href="admin-panel.css" />');
    newWindow.document.write('<html><body onload="window.print()">' + divToPrint.outerHTML + '</body></html>');
    newWindow.document.close();
    setTimeout(function () { newWindow.close(); }, 10);
}

// Removed if modal is not used
  function DisplayPrintModal() {
    document.getElementById("Modal").showModal();
}

// Table code (thomas)
   var activeTable = document.getElementById("activeLotsTable");
   var inactiveTable = document.getElementById("inactiveLotsTable");
var allLots = {}; //TODO: fuld denne ud fra backend. key er id og value er objectet.



        class Lot {
            //bruges når der skal mappes eksisterende lots til javascript.
            constructor(id, shelf, tray, lot, type, seedWeight, status, sown, underLight, partialHarvest, harvested, weight, sentTo, newLot = false) {
                this.DOMobject = null;
                this.id = id;
                this.shelf = shelf;
                this.tray = tray;
                this.lot = lot;
                this.type = type;
                this.seedWeight = seedWeight; //nået hertil.
                this.status = status;
                this.sown = sown;
                this.underLight = underLight;

                //partialharvest skal være et array af objecter med gram: xx, date: xx    (samme for sentto)
                if (partialHarvest == "") {
                    this.partialHarvest = [];
                }
                else {
                    var tmp = partialHarvest.replace(/'/g, '"');
                    this.partialHarvest = JSON.parse(tmp);//JSON.parse('[ {"gram":"200", "date":"12-12-2020"}, {"gram":"400", "date":"14-12-2020"} ]');
                }

                this.harvested = harvested;
                this.weight = weight;

                if (sentTo == "") {
                    this.sentTo = [];
                }
                else {
                    var tmp2 = sentTo.replace(/'/g, '"');
                    this.sentTo = JSON.parse(tmp2);
                }
                
                if (newLot) {
                    this.getIdAndInsert(this);
                }
                else {
                    this.addToTable();
                }
            }

            //bruges når der skal laves helt nye lots.
            static createNewLot(tray, type) {
                var lotNumber = newLot();
                var sownTime = new Date();
                var emptyArray = "[]";
                var emptyArray2 = "[]";
                return new Lot(null, null, tray, lotNumber, type, null, "sown", sownTime, null, emptyArray, null, null, emptyArray2, true);
            }

            static importDbLots(jsonString) { //bliver kun kaldt fra html
                var correctjsonStringTMP = jsonString.replace(/&#34;/g, '"');
                var correctjsonString = correctjsonStringTMP.replace(/&#39;/g, "'");
                var arrayOfObjects = JSON.parse(correctjsonString);

                for (var i = 0; i < arrayOfObjects.length; i++) {
                    var obj = arrayOfObjects[i];
                    var sown = parseISOString(obj.sown);
                    var underlight = parseISOString(obj.underlight);
                    var harvested = parseISOString(obj.harvested);
                    var newLot = new Lot(obj.id, obj.shelf, obj.tray, obj.lot, obj.type, obj.seedWeight, obj.status, sown, underlight, obj.partialHarvest, harvested, obj.weight, obj.sentTo);

                    allLots["row" + newLot.id] = newLot; 
                }


            }

            //setters and getters
            set setShelf(value) {
                this.updateDB(`updateLot?id=${this.id}&value=${value}&attribute=shelf`, true);
                this.shelf = value;
            }
            set setTray(value) {
                this.updateDB(`updateLot?id=${this.id}&value=${value}&attribute=tray`), true;
                this.tray = value;
            }
            set setLot(value) {
                this.updateDB(`updateLot?id=${this.id}&value=${value}&attribute=lot`), true;
                this.lot = value;
            }
            set setType(value) {
                this.updateDB(`updateLot?id=${this.id}&value=${value}&attribute=type`);
                this.type = value;
            }
            set setSeedWeight(value) {
                this.updateDB(`updateLot?id=${this.id}&value=${value}&attribute=seedWeight`, true);
                this.seedWeight = value;
            }
            set setStatus(value) {
                this.updateDB(`updateLot?id=${this.id}&value=${value}&attribute=status`);
                this.status = value;
            }
            set setSown(value) {
                var ISOvalue = value.toISOString();
                this.updateDB(`updateLot?id=${this.id}&value=${ISOvalue}&attribute=sown`);
                this.sown = value;
            }
            set setUnderLight(value) {
                var ISOvalue = value.toISOString();
                this.updateDB(`updateLot?id=${this.id}&value=${ISOvalue}&attribute=underlight`);
                this.underLight = value;
            }
            set setPartialHarvest(value) {
                var oldValue = this.getPartialharvestValue;
                var newValue = value.replace(oldValue, "");
                var newValue2 = newValue.replace(",", "");
                var date = ddmmyyyy(new Date());
                var newObject = { "gram": newValue2, "date": date };
                this.partialHarvest.push(newObject);
                var json = JSON.stringify(this.partialHarvest);
                var correctjson = json.replace(/"/g, "''");

                this.updateDB(`updateLot?id=${this.id}&value=${correctjson}&attribute=partialHarvest`);
            }
            set setHarvested(value) {
                var ISOvalue = value.toISOString();
                this.updateDB(`updateLot?id=${this.id}&value=${ISOvalue}&attribute=harvested`);
                this.harvested = value;
            }
            set setWeight(value) {
                this.updateDB(`updateLot?id=${this.id}&value=${value}&attribute=weight`, true);
                this.weight = value;
            }
            set setSentTo(value) {
                var oldValue = this.getSentToValue;
                var newValue = value.replace(oldValue, "");
                var newValue2 = newValue.replace(",", "");
                var date = ddmmyyyy(new Date());
                var newObject = { "kunde": newValue2, "date": date };
                this.sentTo.push(newObject);
                var json = JSON.stringify(this.sentTo);
                var correctjson = json.replace(/"/g, "''");

                this.updateDB(`updateLot?id=${this.id}&value=${correctjson}&attribute=sentTo`);
            }

            get getSownAge() {
                if (this.status == "harvested")
                {
                    return timeDif(this.sown, this.harvested)
                }
                return timeDif(this.sown);
            }
            get getUnderLightAge() {
                if (this.status == "harvested") {
                    return timeDif(this.underLight, this.harvested)
                }
                return timeDif(this.underLight);
            }
            get getHarvestedAge() {
                if (this.status == "harvested") {
                    return dateStringEnglish(this.harvested); //her er det jo bare datoen der skal returneres.
                }
                return "";
            }

            get getPartialHarvestToolTip() {
                var string = "";

                for (var i = 0; i < this.partialHarvest.length; i++) {
                    string += `${this.partialHarvest[i]["date"]}: ${this.partialHarvest[i]["gram"]}g <br>`;
                }
                return string;
            }

            get getPartialharvestValue() {
                var string = "";

                for (var i = 0; i < this.partialHarvest.length; i++) {
                    string += `${this.partialHarvest[i]["gram"]},`;
                }

                if (this.partialHarvest.length > 0) {
                    string = string.slice(0, -1);
                }
                return string;
            }

            get getSentToToolTip() {
                var string = "";

                for (var i = 0; i < this.sentTo.length; i++) {
                    string += `${this.sentTo[i]["date"]}: ${this.sentTo[i]["kunde"]} <br>`;
                }
                return string;
            }

            get getSentToValue() {
                var string = "";

                for (var i = 0; i < this.sentTo.length; i++) {
                    string += `${this.sentTo[i]["kunde"]},`;
                }

                if (this.sentTo.length > 0) {
                    string = string.slice(0, -1);
                }
                return string;
            }

            get getWeight() {
                if (this.weight == null) {
                    return "";
                }
                else {
                    return this.weight;
                }
            }
            get getSeedWeight() {
                if (this.seedWeight == null) {
                    return "";
                }
                else {
                    return this.seedWeight;
                }
            }

            addToTable() {
                var sownSelected = "";
                var underLightSelected = "";
                var harvestedSelected = "";
                if (this.status == "sown") {
                    sownSelected = "selected='selected'";
                }
                else if (this.status == "underLight") {
                    underLightSelected = "selected='selected'";
                }
                else if (this.status == "harvested") {
                    harvestedSelected = "selected='selected'";
                }

                var htmlCode = `
            <tr id="row${this.id}" class="row-identifier">
                <td>${this.shelf}</td>
                <td>${this.tray}</td>
                <td>${this.lot}</td>
                <td>${this.type}</td>
                <td><input class="width40" value="${this.getSeedWeight}" onchange="Lot.seedWeightChange(this)"/></td>
                <td>
                    <select class="status" onchange="Lot.typeChange(this)">
                        <option ${sownSelected} value="sown">sown</option>
                        <option ${underLightSelected} value="underLight">under light</option>
                        <option ${harvestedSelected} value="harvested">harvested</option>
                    </select>
                </td>
                <td>${this.getSownAge}</td>
                <td class="underlight">${this.getUnderLightAge}</td>
                <td class="tooltip"><input value="${this.getPartialharvestValue}" onchange="Lot.partialHarvestChange(this)"/>
                    <span class="tooltiptext">${this.getPartialHarvestToolTip}</span>
                </td>
                <td class="harvested">${this.getHarvestedAge}</td>
                <td><input class="width40" value="${this.getWeight}" onchange="Lot.weightChange(this)"/></td>
                <td class="tooltip"><input value="${this.getSentToValue}" onchange="Lot.sentToChange(this)"/>
                    <span class="tooltiptext">${this.getSentToToolTip}</span>
                </td>
            </tr>`;

                if (this.status == "harvested") {
                    inactiveTable.insertAdjacentHTML('beforeend', htmlCode);
                }
                else {
                    activeTable.insertAdjacentHTML('beforeend', htmlCode);
                }
                
                this.DOMobject = document.getElementById("row" + this.id.toString());
            }


            static typeChange(element) {
                var value = element.value;

                if (value == "underLight") {
                    var lotObject = fromDomElementToObject(element);
                    lotObject.setStatus = "underLight";
                    lotObject.setUnderLight = new Date();

                    var DOMunderlight = lotObject.fromObjectToDomElement("underlight");
                    DOMunderlight.innerHTML = lotObject.getSownAge;
                }
                else if (value == "harvested") {
                    //flytter rækken ned.
                    var row = fromDomElementToObject(element, true);
                    inactiveTable.appendChild(row);

                    //opdaterer harvested value. 
                    var lotObject = fromDomElementToObject(element);
                    lotObject.setStatus = "harvested";
                    lotObject.setHarvested = new Date();

                    var DOMharvested = lotObject.fromObjectToDomElement("harvested");
                    DOMharvested.innerHTML = lotObject.getHarvestedAge;
                }
            }

            static partialHarvestChange(element) {
                var lotObject = fromDomElementToObject(element);
                lotObject.setPartialHarvest = element.value;
            }
            static sentToChange(element) {
                var lotObject = fromDomElementToObject(element);
                lotObject.setSentTo = element.value;
            }
            static seedWeightChange(element) {
                var lotObject = fromDomElementToObject(element);
                lotObject.setSeedWeight = element.value;
            }

            static weightChange(element) {
                var lotObject = fromDomElementToObject(element);
                lotObject.setWeight = element.value;
            }

            getIdAndInsert(lotObject) {
                var urlQuery = `newLot?values=${lotObject.shelf}_${lotObject.tray}_${lotObject.lot}_${lotObject.type}_${lotObject.status}_${lotObject.sown.toISOString()}_${lotObject.underLight}_${lotObject.partialHarvest}_${lotObject.harvested}_${lotObject.weight}_${lotObject.sentTo}`;
                lotObject.updateDB(urlQuery);

                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        lotObject.id = this.responseText;
                        allLots["row" + lotObject.id] = lotObject;
                        lotObject.addToTable();
                    }
                };
                xmlhttp.open("GET", "getNewestId", true);
                xmlhttp.send();
            }

            updateDB(url, insertAsInt = false) {
                var isInt = "";
                if (insertAsInt) {
                    isInt = "&insertasint=true";
                }
                //url eksempel: "searching?lot=" + lotField.value + "&action=" + actionField.value
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        //document.getElementById("message2").innerHTML = this.responseText;
                        //TODO: måske lav en eller anden response message der bliver vist?
                    }
                };
                xmlhttp.open("GET", url+""+isInt, true);
                xmlhttp.send();
            }

            fromObjectToDomElement(classToFind) {
                var tmp = findFirstChildByClass(this.DOMobject, classToFind);
                return tmp;
            }
}

//inspired from https://stackoverflow.com/a/22119674
function fromDomElementToObject(el, returnRowInstead = false) {
    var foundElement = null;
    while (!el.classList.contains("row-identifier")) {
        el = el.parentElement;
        foundElement = el;
    }

    if (returnRowInstead) {
        return foundElement;
    }

    var object = allLots[foundElement.id];
    return object;
}

//https://stackoverflow.com/a/25414784
function findFirstChildByClass(element, className) {
    var foundElement = null, found;
    function recurse(element, className, found) {
        for (var i = 0; i < element.childNodes.length && !found; i++) {
            var el = element.childNodes[i];
            var classes = el.className != undefined ? el.className.split(" ") : [];
            for (var j = 0, jl = classes.length; j < jl; j++) {
                if (classes[j] == className) {
                    found = true;
                    foundElement = element.childNodes[i];
                    break;
                }
            }
            if (found)
                break;
            recurse(element.childNodes[i], className, found);
        }
    }
    recurse(element, className, false);
    return foundElement;
}

function timeDif(oldDate, compareDate = new Date()) {
    try {
        //var newDate = new Date();
        var diffInSeconds = (compareDate.getTime() - oldDate.getTime()) / 1000;
        var diffInHours = diffInSeconds / (60 * 60);
        var diffDaysTmp = diffInHours / 24;
        var diffDays = Math.floor(diffDaysTmp);
        var remainingHours = Math.floor(diffInHours % 24);

        return `${diffDays} days, ${remainingHours} hours`;
    }
    catch (err) {
        return "";
    }
    
}

function parseISOString(s) {
    try {
        var b = s.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
    }
    catch (err) { //hvis det ikke er en dato. (e.g. hvis den er null)
        return null;
    }   
}

function dateStringEnglish(date) {
    if (date == null) {
        return "N/A";
    }

    var d = new Date(date);
    const danishMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var day = d.getDay();
    var month = d.getMonth();
    var numericDay = d.getDate();
    var year = d.getFullYear();

    //https://www.grammarly.com/blog/how-to-write-dates/
    var dateString = numericDay + " " + danishMonths[month] + " " + year;
    return dateString;
}

function ddmmyyyy(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    var string = dd + '/' + mm + '/' + yyyy;
    return string;
}

function download_csv() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var csv = this.responseText;
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'lotData.csv';
            hiddenElement.click();
        }
    };
    xmlhttp.open("GET", "/admin-panel/export", true);
    xmlhttp.send();
}

function importCounts() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.response);
            ShelfCount = result[0].count;
            TrayCount = result[1].count;
            ProduceCount = result[2].count;
            LotCount = result[3].count;
        }
    };
    xmlhttp.open("GET", "/admin-panel/getCounts", true);
    xmlhttp.send();
}

function updateCounts(type, count) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.response);
            ShelfCount = result[0].count; //de 4 linjer her kan bare slettes. Tror jeg :)
            TrayCount = result[1].count;
            ProduceCount = result[2].count;
            LotCount = result[3].count;
        }
    };
    xmlhttp.open("GET", `/admin-panel/updateCounts?type=${type}&count=${count}`, true);
    xmlhttp.send();
}

function newSeedDatabase(barcode, seedName) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        }
    };
    xmlhttp.open("GET", `newSeed?barcode=${barcode}&seedname=${seedName}`, true);
    xmlhttp.send();
}
