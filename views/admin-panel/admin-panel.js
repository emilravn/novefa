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