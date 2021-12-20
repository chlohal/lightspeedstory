window.addEventListener("load", function() {
    Array.from(this.document.getElementsByClassName("starry")).forEach(x=>addStars(x));
});

var STAR_MARGIN_AREA = 60;
var STAR_SIZE = 2;

var ___canvasClearFunctions = {};

/**
 * 
 * @param {Element} elem 
 */
function addStars(elem) {
    //make sure things don't get double-starred
    if(elem.getAttribute("data-starred") == "true") return;
    elem.setAttribute("data-starred", "true");

    //elem.childNodes.forEach(x=>parallaxElem(x));
    
    var initialScrollY = window.scrollY;
    
    var box = elem.getClientRects()[0];
    
    var canvas = document.createElement("canvas");
    
    var h = canvas.height = box.height * 2;
    var w = canvas.width = box.width;
    
    var initialDistanceFromTop = box.y;
    
    canvas.classList.add("star-canvas");
    
    //make the canvas the first child
    if(elem.firstChild) elem.insertBefore(canvas, elem.firstChild);
    else elem.appendChild(canvas);
    
    var ctx = canvas.getContext("2d");
    
    var elemSeed = Math.random();

    writeStarsToCanvas(ctx, w, h, elemSeed);

    var canvasID = "c" + Math.random().toString().substring(2) + Date.now();
    ___canvasClearFunctions[canvasID] = function(seed) {
        ctx.clearRect(0, 0, w, h);
        writeStarsToCanvas(ctx, w, h, seed + elemSeed);
    }
    elem.setAttribute("data-star-canvas-id", canvasID);
    canvas.setAttribute("id", canvasID);
    
    requestAnimationFrame(animate);
    
    function animate() {
        var p = (((window.scrollY - initialScrollY) - initialDistanceFromTop) * 0.4) % h;
        canvas.style.transform = "translateY(" + p + "px)";
        requestAnimationFrame(animate);
    }
}

function writeStarsToCanvas(ctx, w, h, seed) {
    var randFunc = seededRandom(seed);
    for(var x = 0; x < w; x += STAR_MARGIN_AREA) {
        for(var y = 0; y < h; y += STAR_MARGIN_AREA) {
            addStarToCanvas(ctx, x, y, randFunc);
        }
    }
}

/**
 * 
 * @param {Element} elem 
 */
function parallaxElem(elem) {
    //don't try to parallax text nodes
    if(elem.nodeName == "#text") return;

    var initialScrollY = window.scrollY;
    var initialDistanceFromTop = elem.getClientRects()[0].top;

    var initialDistanceFromTopOfDocument = initialScrollY + initialDistanceFromTop;

    requestAnimationFrame(function anim() {
        elem.style.transform = `translateY(${(initialDistanceFromTopOfDocument - (window.scrollY + initialDistanceFromTop)) * 0.4 }px)`;
        requestAnimationFrame(anim);
    });
}

function addStarToCanvas(ctx, x, y, r) {
    var randDistX = r();
    var randDistY = r();
    
    ctx.fillStyle = "#CCC5B9";
    ctx.beginPath();
    ctx.ellipse(x + randDistX * STAR_MARGIN_AREA, y + randDistY * STAR_MARGIN_AREA, STAR_SIZE, STAR_SIZE, 0, 0, 360, false);
    ctx.fill();
}

function seededRandom(s) {
    s = s || 0;
    return function() {
        var t = s += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
} 