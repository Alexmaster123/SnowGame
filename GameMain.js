function LoadGame(callback) {

    this.resources = 0;
    this.resOnLoading = 0;

    this.errors = [];
    this.stat = 0;

    this.loading = false;

    this.LoadSprite = function (url, frames, funct) {
        this.loading = true;
        var img = new Image();
        img.src = url;
        img.rh = this;

        this.resources++;
        img.frames = frames;

        this.w = this.width / this.frames;

        img.onload = function () {

            if (funct != undefined) {
                funct();
            }

            this.w = this.width / this.frames;
            this.rh.resOnLoading++;
            this.rh.CheckLoaded();
        };

        img.addEventListener("error", function (e) {

            this.rh.resources--;
            this.rh.errors.push([url, e]);
            this.rh.CheckLoaded();
        });

        return img;
    }

    this.CheckLoaded = function() {
        if(!this.loading) return null;
     
        this.DrawLoading();
     
        if (this.resOnLoading + this.errors.length >= this.resources) {
            callback();
            this.resources = 0;
            this.resOnLoading = 0;
            this.loading = false;
        }
    }

    this.DrawLoading = function () {

        //percentuale di caricamento
        this.status = (this.resLoaded) / (this.resNumber + this.errors.length);

        //centro del canvas
        var cx = game.canvas.width / 2;
        var cy = game.canvas.height / 2;

        //imposta il colore di riempimento
        game.ctx.fillStyle = "#333";

        //disegna un rettangolo grande quanto il canvas
        game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

        //avvia il path di disegno primitive
        game.ctx.beginPath();
        game.ctx.strokeStyle = "#222";

        //imposta lo spessore della linea da disegnare
        game.ctx.lineWidth = 25;

        //aggiunge un arco al path (una corona circolare di raggio 80)
        game.ctx.arc(cx, cy, 80, 0, Math.PI * 2, false);

        //disegna il path
        game.ctx.stroke();

        //calcola i radianti del secondo arco, 
        var radians = (360 * this.status) * Math.PI / 180;

        //disegna il secondo arco
        game.ctx.beginPath();
        game.ctx.strokeStyle = "#ddd";
        game.ctx.lineWidth = 25;
        game.ctx.arc(cx, cy, 80, 0 - 90 * Math.PI / 180, radians - 90 * Math.PI / 180, false);
        game.ctx.stroke();

        //Imposta un font e disegna il testo al centro del cerchio di caricamento
        game.ctx.font = '22pt Segoe UI Light';
        game.ctx.fillStyle = '#ddd';
        game.ctx.fillText(Math.floor(this.status * 100) + "%", cx - 25, cy + 10);
    }
}

function Game() {
    this.div = document.getElementById("GameDiv");

    this.canvas = document.getElementById("GameCanvas");

    this.cont = this.canvas.getContext("2d");

    this.paused = false;        //indica se il gioco è in pausa o no
    var playing = false;       //indica se si è nel menù oppure in gioco

    rh = new ResourcesHandler(function () {

        game.LoadLevel(0);
        game.GameLoop();
    });
    // Ricordiamo la sintassi di LoadSprite: 
    // ResourceHandler.LoadSprite(src, subimages, callback);
    this.backgroundMenu = rh.LoadSprite("Images/Snow_Background.png", 1, function () {
        game.patternMenu = game.ctx.createPattern(game.backgroundMenu, "repeat");
    });


    this.ResetLevel = function () {

        this.mainMenu = null;
        this.levelCompleted = null;
        this.score = 0;
    }

    this.LoadLevel = function (lev) {

        this.level = lev;

        this.ResetLevel();

        if (lev == 0) {
            this.mainMenu = new MainMenu();
        }
        else {
            //carica un livello di gioco
        }
    }

    this.Draw = function () {
        // disegna lo sfondo
        game.ctx.save();
        game.ctx.fillStyle = game.patternMenu;
        game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
        game.ctx.restore();

        // mostra logo e personaggio
        game.ctx.drawImage(game.sprLogo, game.canvas.width / 2 - game.sprLogo.width / 2, 80);
        game.ctx.drawImage(game.sprSplashLogo, 70, 180);
        game.ctx.shadowColor = "#000";
        game.ctx.shadowOffsetX = 1;
        game.ctx.shadowBlur = 3;

        // imposta il font
        game.ctx.font = "32pt 'PixelFont'"
        game.ctx.textAlign = "center";

        // centro del canvas
        var cx = game.canvas.width / 2;
        var cy = game.canvas.height / 2;

        // disegna il menu e rileva le azioni dell'utente
        if (Inputs.MouseInsideText("New Game", cx, cy + 10, "#eee", "#ea4") && Inputs.GetMousePress(MOUSE_LEFT)) {

            //carica il livello 1
            game.LoadLevel(1);
        }

        if (Inputs.MouseInsideText("Other games", cx, cy + 80, "#eee", "#ea4") && Inputs.GetMousePress(MOUSE_LEFT)) {

            window.location.href = "http://google.com";
        }

        game.ctx.shadowOffsetX = 0;
        game.ctx.shadowBlur = 0;
    }

    this.Update = function () {
    }

    this.GameLoop = function () {
        if(!this.paused)
            this.Update()   //funzione che aggiornerà le posizioni degli oggetti
        this.Draw()         //funzione che disegna gli oggetti

        window.requestAnimFrame(function () {
            game.GameLoop();
        });
    }

}

function Start() {
    game = new Game();
    game.GameLoop();
}

window.addEventListener('load', function () {
    Start();
}, true);