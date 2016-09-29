function LevelEditor() {

    this.cellSize = 40
    this.selected = null                        //tile selezionata (indice 0-5 se terreno, -5 se nemico)
    this.tileGrid = null                        //griglia contenente gli indici delle tile(oppre -1 se vuota)
    this.tileRow = 0
    this.tileCol = 0
    this.singleTileWidth = 39                      //dimensione tile singola

    this.newRect = { x: 0, y: 0, w: 100, h: 30, color: "#0000FF" }
    this.saveRect = { x: 0, y: 0, w: 100, h: 30, color: "#0000FF" }
    this.exitRect = { x: 0, y: 0, w: 100, h: 30, color: "#0000FF" }
    this.tileRect = { x: 0, y: 0, w: 100, h: 30 }
    this.enemyRect = { x: 0, y: 0, w: 40, h: 40 }
    this.enemyRect2 = { x: 0, y: 0, w: 40, h: 40 }
    this.singleEnemyWidth = 88
    this.singleEnemyStandWidth = 53

    this.playRect = { x: 0, y: 0, w: 100, h: 30, color: "#0000FF" }

    this.clear = function () {
        this.tileGrid = null
        this.selected = null
        document.getElementById("Output").value = ""
        document.getElementById("Output").style.display = "none"
    }

    this.positionToGrid = function (x, y) {
        var i = x / this.cellSize
        var j = y / this.cellSize
        return [i, j]
    }

    this.gridToPosition = function (x, y) {
        var i = x * this.cellSize
        var j = y * this.cellSize
        return [i, j]
    }

    //esporta in formato testo il livello creato
    this.export = function (play) {
        var n = 0
        var output = ""
        if (!play) {
            n = parseInt(prompt("Level Number", 0))
            output = "levels[" + n + "] = "
        }
        output += "["
        for (var x = 0; x < this.tileRow; x += 1) {
            output += "["
            for (var y = 0; y < this.tileCol; y += 1) {
                output += "[" + this.tileGrid[x][y] + "]"
                if (y < this.tileCol - 1)
                    output += ", "
            }
            output += "]"
            if (x < this.tileRow - 1)
                output += ", "
        }
        output += "]"
        document.getElementById("Output").value = output
    }

    this.InputHandler = function () {

        //Bottone NEW
        if (Inputs.MouseInsideRect(this.newRect.x, this.newRect.y, this.newRect.w, this.newRect.h)) {
            this.newRect.color = "#FAFF01"
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                if (window.confirm("Sicuro? tutti i progressi andranno persi")) {
                    this.clear()
                }
            }
        }
        else
            this.newRect.color = "#0000FF"

        //Bottone EXPORT
        if (Inputs.MouseInsideRect(this.saveRect.x, this.saveRect.y, this.saveRect.w, this.saveRect.h)) {
            this.saveRect.color = "#FAFF01"
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                if (this.tileGrid != null) {
                    this.export(false)
                    document.getElementById("Output").style.display = "block"
                }
            }
        }
        else
            this.saveRect.color = "#0000FF"

        //Bottone ESCI
        if (Inputs.MouseInsideRect(this.exitRect.x, this.exitRect.y, this.exitRect.w, this.exitRect.h)) {
            this.exitRect.color = "#FAFF01"
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                if (window.confirm("Sicuro di vole uscire? tutti i progressi andranno persi")) {
                    game.state = STATE.WAIT
                    this.clear()
                }
            }
        }
        else
            this.exitRect.color = "#0000FF"

        //Bottone PLAY
        if (Inputs.MouseInsideRect(this.playRect.x, this.playRect.y, this.playRect.w, this.playRect.h)) {
            this.playRect.color = "#FAFF01"
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                if (this.tileGrid != null) {
                    this.export(true)
                    var string = document.getElementById("Output").value
                    var array = JSON.parse("[" + string + "]")
                    var map = array[0]
                    game.level = new Level(200, game, map)
                    game.level.LoadBlocks()
                    game.player = new Player(game)
                    game.state = STATE.PLAY
                }
            }
        }
        else
            this.playRect.color = "#0000FF"

        //Click nel box selezione tile
        var tile = game.resource.tileMap
        if (Inputs.MouseInsideRect(this.tileRect.x, this.tileRect.y, this.tileRect.w, this.tileRect.h)) {
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                for (var i = 0; i < tile.frames; i++) {
                    var ofx = i * this.singleTileWidth
                    if (Inputs.MouseInsideRect(this.tileRect.x + ofx, this.tileRect.y, this.singleTileWidth, tile.height)) {
                        this.selected = i
                    }
                }
            }
        }

        //Click nel box selezione nemico
        if (Inputs.MouseInsideRect(this.enemyRect.x, this.enemyRect.y, this.enemyRect.w, this.enemyRect.h)) {
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                this.selected = -5
            }
        }
        if (Inputs.MouseInsideRect(this.enemyRect2.x, this.enemyRect2.y, this.enemyRect2.w, this.enemyRect2.h)) {
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                this.selected = -6
            }
        }

        //Click nella griglia
        if (this.selected != null) {  //una tile selezionata se click sx -> la metto in cella, se click dx -> la rimuovo
            var gameWidth = game.gameRectWidth
            var gameHeight = game.gameRectHeight
            if (Inputs.MouseInsideRect(0, 0, gameWidth, gameHeight)) {
                if (this.tileGrid == null) {    //inizializza la griglia se non è stato ancora fatto
                    var i = 0
                    this.tileGrid = []
                    for (var x = 0; x < game.gameRectWidth; x += this.cellSize) {
                        this.tileGrid[i] = []
                        var j = 0
                        for (var y = 0; y < game.gameRectHeight; y += this.cellSize) {
                            this.tileGrid[i][j] = -1
                            j += 1
                        }
                        i += 1
                    }
                    this.tileRow = i
                    this.tileCol = j
                }

                var pos = this.positionToGrid(Inputs.mouseX, Inputs.mouseY)
                if (Inputs.GetMousePress(MOUSE_LEFT)) {         //aggiungo tile selezionata
                    var x = Math.floor(pos[0])
                    var y = Math.floor(pos[1])
                    this.tileGrid[x][y] = this.selected         //BUG: manca un controllo sui riposizionamenti nemici/blocchi
                }
                if (Inputs.GetMousePress(MOUSE_RIGHT)) {        //rimuovo tile dalla griglia
                    var x = Math.floor(pos[0])
                    var y = Math.floor(pos[1])
                    this.tileGrid[x][y] = -1

                }
            }
        }
    }

    this.Draw = function () {
        var w = game.gameRectWidth
        var h = game.gameRectHeight

        var menuW = game.canvas.width
        var menuH = game.canvas.height

        game.ctx.strokeStyle = "#AEA0A0"
        game.ctx.beginPath()
        for (var x = 0; x <= w; x += this.cellSize) {
            game.ctx.moveTo(x - 0.5, 0)
            game.ctx.lineTo(x - 0.5, h)
        }
        for (var y = 0; y <= h; y += this.cellSize) {
            game.ctx.moveTo(0, y - 0.5)
            game.ctx.lineTo(w, y - 0.5)
        }
        game.ctx.closePath()
        game.ctx.stroke()

        game.ctx.fillStyle = "#FA7E7E"
        game.ctx.fillRect(w, 0, menuH, menuW)

        //bottone new
        this.newRect.x = w
        game.ctx.strokeStyle = "#000000"
        game.ctx.fillStyle = this.newRect.color
        game.ctx.fillRect(this.newRect.x, this.newRect.y, this.newRect.w, this.newRect.h)
        game.ctx.strokeText("New", this.newRect.x + 10, this.newRect.y + 25)

        //bottone salva
        this.saveRect.x = w
        this.saveRect.y = this.newRect.h + 5
        game.ctx.strokeStyle = "#000000"
        game.ctx.fillStyle = this.saveRect.color
        game.ctx.fillRect(this.saveRect.x, this.saveRect.y, this.saveRect.w, this.saveRect.h)
        game.ctx.strokeText("Export", this.saveRect.x + 10, this.saveRect.y + 25)

        //bottone esci
        this.exitRect.x = w
        this.exitRect.y = this.saveRect.y + this.saveRect.h + 5
        game.ctx.strokeStyle = "#000000"
        game.ctx.fillStyle = this.exitRect.color
        game.ctx.fillRect(this.exitRect.x, this.exitRect.y, this.exitRect.w, this.exitRect.h)
        game.ctx.strokeText("Exit", this.exitRect.x + 10, this.exitRect.y + 25)

        //Box per la selezione Tile
        var tile = game.resource.tileMap
        var ofx = 0
        this.tileRect.x = w
        this.tileRect.y = this.exitRect.y + this.exitRect.h + 5
        this.tileRect.w = tile.width + 1
        this.tileRect.h = tile.height + 1
        game.ctx.strokeStyle = "#0000FF"
        game.ctx.strokeRect(this.tileRect.x, this.tileRect.y, this.tileRect.w, this.tileRect.h)
        for (var i = 0; i < tile.frames; i++) {
            ofx = i * this.singleTileWidth
            if (this.selected == i) {
                game.ctx.strokeStyle = "#FAFF01"
                game.ctx.strokeRect(this.tileRect.x + ofx, this.tileRect.y, this.singleTileWidth, tile.height)
            }
            game.ctx.drawImage(tile, ofx, 0, this.singleTileWidth, tile.height,
                            this.tileRect.x + ofx, this.tileRect.y, this.singleTileWidth, tile.height)

        }

        //Box nemici
        var tileEnemy = game.resource.enemy
        var tileEnemy2 = game.resource.enemyStand
        this.enemyRect.x = w
        this.enemyRect.y = this.tileRect.y + this.tileRect.h + 5
        game.ctx.strokeStyle = "#0000FF"
        if (this.selected == -5)
            game.ctx.strokeStyle = "#FAFF01"
        game.ctx.strokeRect(this.enemyRect.x, this.enemyRect.y, this.enemyRect.w, this.enemyRect.h)
        game.ctx.drawImage(tileEnemy, 0, 0, this.singleEnemyWidth, tileEnemy.height,
                            this.enemyRect.x, this.enemyRect.y, this.enemyRect.h, this.enemyRect.h)
        this.enemyRect2.x = this.enemyRect.x + this.enemyRect.w + 10
        this.enemyRect2.y = this.enemyRect.y
        game.ctx.strokeStyle = "#0000FF"
        if (this.selected == -6)
            game.ctx.strokeStyle = "#FAFF01"
        game.ctx.strokeRect(this.enemyRect2.x, this.enemyRect2.y, this.enemyRect2.w, this.enemyRect2.h)
        game.ctx.drawImage(tileEnemy2, 0, 0, this.singleEnemyStandWidth, tileEnemy2.height,
                            this.enemyRect2.x, this.enemyRect2.y, this.enemyRect2.h, this.enemyRect2.h)

        //bottone gioca livello
        this.playRect.x = w
        this.playRect.y = menuH - this.playRect.h
        game.ctx.strokeStyle = "#000000"
        game.ctx.fillStyle = this.playRect.color
        game.ctx.fillRect(this.playRect.x, this.playRect.y, this.playRect.w, this.playRect.h)
        game.ctx.strokeText("Play it!", this.playRect.x + 10, this.playRect.y + 25)

        //disegno tile in griglia
        if (this.tileGrid != null) {
            for (var x = 0; x < this.tileRow; x += 1) {
                for (var y = 0; y < this.tileCol; y += 1) {
                    if (this.tileGrid[x][y] != -1) {
                        var pos = this.gridToPosition(x, y)
                        var px = Math.floor(pos[0])
                        var py = Math.floor(pos[1])
                        if (this.tileGrid[x][y] == -5) {
                            game.ctx.drawImage(tileEnemy, 0, 0, this.singleEnemyWidth, tileEnemy.height,
                                            px, py, this.cellSize, this.cellSize)
                        }
                        else if (this.tileGrid[x][y] == -6) {
                            game.ctx.drawImage(tileEnemy2, 0, 0, this.singleEnemyStandWidth, tileEnemy2.height,
                                            px, py, this.cellSize, this.cellSize)
                        }
                        else {
                            var ofx = this.tileGrid[x][y] * this.singleTileWidth
                            game.ctx.drawImage(tile, ofx, 0, this.singleTileWidth, tile.height,
                                            px, py, this.cellSize, this.cellSize)
                        }
                    }
                }
            }
        }
    }
}