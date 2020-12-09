// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


//https://stackoverflow.com/a/10126042
//realods the page every 5 min idle. In order to update the page without manual reload.
var inactivityTime = function () {
    var time;
    window.onload = resetTimer;
    // DOM Events
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    function logout() {
        location.reload();
    }

    function resetTimer() {
        clearTimeout(time);
        var fiveMinutes = 1000 * 60 * 5;
        time = setTimeout(logout, fiveMinutes)
        // 1000 milliseconds = 1 second
    }
};


inactivityTime();