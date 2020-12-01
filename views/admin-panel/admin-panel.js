// remember to set printer as default to not, get a pop-up asking to print on chrome browser

// Hold the current count on amount of shelfs, trays, produce etc. (should be imported from database).
var ShelfCount = 3;
var TrayCount = 3;
var ProduceCount = 2;

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
    var ProduceBarcode = "F" + pad(ProduceCount,9).toString(); // add prefix as well as leading 0's
    JsBarcode("#code128", ProduceBarcode); // Input the barcode into barcode.js, using the format Code128.
  }

  function PrintShelf() {
    ShelfCount++; 
    var ShelfBarcode = "S" + pad(ShelfCount,9).toString(); 
    JsBarcode("#code128", ShelfBarcode);
  }

  function PrintTray() {
    TrayCount++;
    var TrayBarcode = "T" + pad(TrayCount,9).toString(); 
    JsBarcode("#code128", TrayBarcode);
  }

  // Take input from textfield and make it into a barcode
  function ManualBarcodeEntry(){
    var text = document.getElementById("txt_input").value;
    JsBarcode("#code128", text);   
  }

  function DisplayPrintModal() {
    document.getElementById("Modal").showModal();
}

// Table code (thomas)
   var activeTable = document.getElementById("activeLotsTable");
        var inactiveTable = document.getElementById("inactiveLotsTable");
        var allLots = []; //TODO: fuld denne ud fra backend, og indsæt alle i dom. og det er nok egentligt kun active lots.
        var inactiveLots = []; //samme som ovenfor. Bruges nok ikke, men bør den det?
        var rowCount = 0;

        //TODO: Der skal nok lige laves settere. Og inde i de settere skal databasen så opdateres?
        class Lot {
            //bruges når der skal mappes eksisterende lots til javascript.
            constructor(id, shelf, tray, lot, type, status, sown, underLight, partialHarvest, harvested, weight, sentTo, newLot = false) {
                this.id = id;
                this.shelf = shelf;
                this.tray = tray;
                this.lot = lot;
                this.type = type;
                this.status = status; //TODO: skal nok laves til enum.
                this.sown = sown;
                this.underLight = underLight;
                this.partialHarvest = partialHarvest;
                this.harvested = harvested;
                this.weight = weight;
                this.sentTo = sentTo;
                

                if (newLot) {
                    this.getIdAndInsert(this);
                }
                else {
                    this.addToTable();
                }
            }

            //bruges når der skal laves helt nye lots.
            static createNewLot(tray, type) {
                var lotNumber = "0000001"; //TODO: her skal simons betode kaldes til at oprette nye lot numre.
                var sownTime = new Date();
                //TODO: indsæt i database.
                return new Lot(null, null, tray, lotNumber, type, "sown", sownTime, null, null, null, null, null, true);
            }

            //TODO: get sownAge, get underlight age. hvor den retunerer tidsforskellen. eg. 3 days, 5 hours.
            //setter and getters:
            //setShelf osv.
            set setShelf(value) {
                this.updateDB(`updateLot?id=${this.id}&value=${value}&attribute=shelf`);
                this.shelf = value;
                console.log(this.shelf);
            }



                


            timeDif(oldDate) {
                var newDate = new Date();
                var diffInSeconds = (newDate.getTime() - oldDate.getTime()) / 1000;
                var diffInHours = diffInSeconds / (60 * 60);
                var diffDaysTmp = diffInHours / 24;
                var diffDays = Math.floor(diffDaysTmp);
                var remainingHours = Math.floor(diffInHours % 24);

                return `${diffDays} days, ${remainingHours} hours ago`;
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
            <tr id="row${rowCount}">
                <td>${this.shelf}</td>
                <td>${this.tray}</td>
                <td>${this.lot}</td>
                <td>${this.type}</td>
                <td>
                    <select class="status" onchange="Lot.typeChange(this.value, ${rowCount})">
                        <option ${sownSelected} value="sown">sown</option>
                        <option ${underLightSelected} value="underLight">under light</option>
                        <option ${harvestedSelected} value="harvested">harvested</option>
                    </select>
                </td>
                <td>${this.timeDif(this.sown)}</td>
                <td id="underlight${rowCount}">${this.underLight}</td>
                <td><input placeholder="${this.partialHarvest}" /></td>
                <td id="harvested${rowCount}">${this.harvested}</td>
                <td><input placeholder="${this.weight}" /></td>
                <td><input placeholder="${this.sentTo}" /></td>
            </tr>`;
                activeTable.insertAdjacentHTML('beforeend', htmlCode);

                rowCount++;
            }


            static typeChange(value, rowCount) { //TODO: igen, skal nok være noget enum halløj.

                if (value == "underLight") {
                    var element = document.getElementById("underlight" + rowCount);
                    allLots[rowCount].status = "underLight";
                    allLots[rowCount].sown = new Date();
                    element.innerHTML = allLots[rowCount].timeDif(allLots[rowCount].sown);
                }
                else if (value == "harvested") {
                    //flytter rækken ned.
                    var row = document.getElementById("row" + rowCount);
                    inactiveTable.appendChild(row);

                    //opdaterer harvested value. 
                    var element = document.getElementById("harvested" + rowCount);
                    allLots[rowCount].status = "harvested";
                    allLots[rowCount].harvested = new Date();
                    element.innerHTML = allLots[rowCount].timeDif(allLots[rowCount].harvested);
                }

            }

            getIdAndInsert(lotObject) {
                var urlQuery = `newLot?values=${lotObject.shelf}_${lotObject.tray}_${lotObject.lot}_${lotObject.type}_${lotObject.status}_${lotObject.sown.toISOString()}_${lotObject.underLight}_${lotObject.partialHarvest}_${lotObject.harvested}_${lotObject.weight}_${lotObject.sentTo}`;
                lotObject.updateDB(urlQuery);

                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        lotObject.id = this.responseText;
                        allLots.push(lotObject);
                        lotObject.addToTable();
                    }
                };
                xmlhttp.open("GET", "getNewestId", true);
                xmlhttp.send();
            }

            updateDB(url) {
                //url eksempel: "searching?lot=" + lotField.value + "&action=" + actionField.value
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        //document.getElementById("message2").innerHTML = this.responseText;
                        //TODO: måske lav en eller anden response message der bliver vist?
                    }
                };
                xmlhttp.open("GET", url, true);
                xmlhttp.send();
            }
        }