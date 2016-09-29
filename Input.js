// costanti per gli input 
MOUSE_LEFT = 1;
MOUSE_MIDDLE = 2;
MOUSE_RIGHT = 3;
KEY_ENTER = 13;
KEY_ESC = 27;
KEY_SHIFT = 16;
KEY_SPACE = 32;
KEY_W = 87;
KEY_A = 65;
KEY_S = 83;
KEY_D = 68;

Inputs = function () { }

Inputs.mouseX = 0;
Inputs.mouseY = 0;

Inputs.mouseLeft = false;               //true se tasto sempre premuto
Inputs.mouseLeftDown = false;          //indica se in questo frame tasto premuto
Inputs.mouseLeftUp = false;            //true se tasto rilasciato
Inputs.mouseMiddle = false;
Inputs.mouseMiddleDown = false;
Inputs.mouseMiddleUp = false;
Inputs.mouseRight = false;
Inputs.mouseRightDown = false;
Inputs.mouseRightUp = false;

Inputs.key = [];
Inputs.keyPress = [];
Inputs.keyRel = [];

Inputs.Clear = function() {
     
    Inputs.mouseLeftDown = false;
    Inputs.mouseLeftUp = false;
    Inputs.mouseMiddleDown = false;
    Inputs.mouseMiddleRel   = false;
    Inputs.mouseRightDown = false;
    Inputs.mouseRightUp   = false;
    Inputs.mouseMoved = false;
    Inputs.keyPress = [];
    Inputs.keyRel   = [];
}

Inputs.GetPosition = function () {
    return (Inputs.mouseX, Inputs.mouseY)
}

Inputs.MouseInsideRect = function (x, y, w, h) {
    var inside = (Inputs.mouseX > x && Inputs.mouseY > y && Inputs.mouseX < x + w && Inputs.mouseY < y + h);

    return inside;
}

Inputs.GetKeyDown = function (k) {
    if (typeof (k) == "string") {
        k = k.charCodeAt(0);
    }
    return (Inputs.key[k] == true);
}

Inputs.GetKeyPress = function (k) {
    if (typeof (k) == "string") {
        k = k.charCodeAt(0);
    }
    return (Inputs.keyPress[k] == true);
}

Inputs.GetKeyRelease = function (k) {
    if (typeof (k) == "string") {
        k = k.charCodeAt(0);
    }
    return (Inputs.keyRel[k] == true);
}

Inputs.GetMouseDown = function (b) {

    if (b == 1) return Inputs.mouseLeft;
    if (b == 2) return Inputs.mouseMiddle;
    if (b == 3) return Inputs.mouseRight;
}

Inputs.GetMousePress = function (b) {

    if (b == 1) return Inputs.mouseLeftDown;
    if (b == 2) return Inputs.mouseMiddleDown;
    if (b == 3) return Inputs.mouseRightDown;
}

Inputs.GetMouseRelease = function (b) {

    if (b == 1) return Inputs.mouseLeftUp;
    if (b == 2) return Inputs.mouseMiddleRel;
    if (b == 3) return Inputs.mouseRightUp;
}

window.addEventListener("keydown", function (e) {

    if (!Inputs.key[e.keyCode]) {

        Inputs.keyPress[e.keyCode] = true;
        Inputs.key[e.keyCode] = true;
    }

}, false);


window.addEventListener("keyup", function (e) {

    Inputs.keyRel[e.keyCode] = true;
    Inputs.key[e.keyCode] = false;

}, false);

window.addEventListener("mousedown", function (e) {

    switch (e.which) {
        case 1:
            Inputs.mouseLeft = true;
            Inputs.mouseLeftDown = true;
            break;

        case 2:
            Inputs.mouseMiddle = true;
            Inputs.mouseMiddleDown = true;
            break;

        case 3:
            Inputs.mouseRight = true;
            Inputs.mouseRightDown = true;
            break;
    }
}, false);


window.addEventListener("mouseup", function (e) {
 
    switch (e.which) {
        case 1:
            Inputs.mouseLeft = false;
            Inputs.mouseLeftUp = true;
            break;

        case 2:
            Inputs.mouseMiddle = false;
            Inputs.mouseMiddleRel = true;
            break;

        case 3:
            Inputs.mouseRight = false;
            Inputs.mouseRightUp = true;
            break;
    }
}, false);

window.addEventListener("mousemove", function (e) {

    Inputs.mouseX = Math.round(e.pageX);    //se le coordinate mouse risultano fuori, togliere offset del canvas rispetto al div(bordo pagina)
    Inputs.mouseY = Math.round(e.pageY);
    Inputs.mouseMoved = true;

}, false);

