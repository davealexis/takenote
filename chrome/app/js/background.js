// Window defaults
var defaults = {
    width: 800,
    height: 600,
    left: 50,
    top: 50
};

/*chrome.app.runtime.onLaunched.addListener( function() {
    chrome.app.window.create( "index.html", {
        "bounds": {
            "width": 1024,
            "height": 600
        }
    });
});*/

chrome.app.runtime.onLaunched.addListener( function() {
    chrome.app.window.create( "index.html", {
        "bounds": defaults,
        "id": "takenote:main",
        "minWidth": 800,
        "minHeight": 500,
    },
    function (win) {
        console.info("Launched!");
    });
});

/*var launch = function(launchData) {

    //we delay opening the actual window to give multiple file events time to fire
    if (pending !== null) return;

    //do not open windows when an upgrade is running
    if (upgrading) return;

    pending = setTimeout(openWindow, 250);

};

chrome.app.runtime.onLaunched.addListener(launch);*/

/*
onload = function () {
    document.getElementById("usbDev").onclick = function() {
        getUsb();
    };
};
*/

function onResize() {
    var container = document.getElementById("container");
    var left = container.offsetLeft;
    var top = container.offsetTop;
    //var width = document.documentElement.clientWidth - left;
    var height = document.documentElement.clientHeight - top - 150;
    //container.style.width = width + 'px';
    container.style.height = height + 'px';
    //container.resize();
}

onload = function () {
    window.onresize = onResize;

    // Do resize once to get everything in a happy place.
    onResize();
    //container.resize();
}


