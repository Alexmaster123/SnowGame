function Menu() {

    this.startRect = { x: 0, y: 0, w: 200, h: 50, color: "#000000" }
    this.editRect = { x: 0, y: 0, w: 200, h: 50, color: "#000000" }
    this.resetRect = { x: 0, y: 0, w: 200, h: 50, color: "#000000" }

    this.Draw = function () {

        var width = game.canvas.width
        var height = game.canvas.height

        // disegna lo sfondo
        game.ctx.save()
        var pattern = game.ctx.createPattern(game.resource.menuBackground, "repeat")
        game.ctx.fillStyle = pattern
        game.ctx.fillRect(0, 0, width, height)
        game.ctx.restore()

        //Disegno il rettangolo del menu testuale
        game.ctx.strokeStyle = "#000000"
        var cx = width / 2
        var cy = height / 2
        var offset = 200
        var dimX = 300
        var dimY = 400
        game.ctx.strokeRect(cx - offset, cy - offset, dimX, dimY)
        var logo = game.resource.menuLogo
        game.ctx.drawImage(logo, 0, 0, logo.width, logo.height,
                                    cx - offset, cy - offset, dimX, dimY)

        //disegno i bottoni del menu
        game.ctx.font = "30px Arial"
        game.ctx.strokeStyle = this.startRect.color
        game.ctx.fillStyle = this.startRect.color
        this.startRect.x = cx - offset + 50
        this.startRect.y = cy - offset + 100
        game.ctx.strokeRect(this.startRect.x, this.startRect.y, this.startRect.w, this.startRect.h)
        game.ctx.fillText("Start game", this.startRect.x + 20, this.startRect.y + 35)

        if (Inputs.MouseInsideRect(this.startRect.x, this.startRect.y, this.startRect.w, this.startRect.h)) {       
            this.startRect.color = "#0000FF"
            if (Inputs.GetMousePress(MOUSE_LEFT))
                game.state = STATE.LEVEL    
        }
        else
            this.startRect.color = "#000000"

        game.ctx.strokeStyle = this.editRect.color
        game.ctx.fillStyle = this.editRect.color
        this.editRect.x = this.startRect.x
        this.editRect.y = this.startRect.y + this.startRect.h + 20
        game.ctx.strokeRect(this.editRect.x, this.editRect.y, this.editRect.w, this.editRect.h)
        game.ctx.fillText("Edit Level", this.editRect.x + 20, this.editRect.y + 35)

        if (Inputs.MouseInsideRect(this.editRect.x, this.editRect.y, this.editRect.w, this.editRect.h)) {
            this.editRect.color = "#0000FF"
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                game.state = STATE.EDIT
            }
        }
        else
            this.editRect.color = "#000000"

        game.ctx.strokeStyle = this.resetRect.color
        game.ctx.fillStyle = this.resetRect.color
        this.resetRect.x = this.editRect.x
        this.resetRect.y = this.editRect.y + this.editRect.h + 20
        game.ctx.strokeRect(this.resetRect.x, this.resetRect.y, this.resetRect.w, this.resetRect.h)
        game.ctx.fillText("Reset Save", this.resetRect.x + 20, this.resetRect.y + 35)

        if (Inputs.MouseInsideRect(this.resetRect.x, this.resetRect.y, this.resetRect.w, this.resetRect.h)) {
            this.resetRect.color = "#0000FF"
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                if (window.confirm("Sicuro? tutti i progressi andranno persi")) {
                    localStorage.clear()
                }
            }
        }
        else
            this.resetRect.color = "#000000"
    }
}

function LevelRectangle(x,y,w,h,c,f,t){
    this.x = x
    this.y = y
    this.width = w
    this.height = h
    this.color = c
    this.fill = f
    this.text = t               
}

function LevelsMenu(dim, g) {

    this.levelRectArray = []
    //creo i rettangoli che rappresentano i livelli(in Levels.js)
    for (var i = 0; i < dim; i++) {
        var dimq = 100
        var stx = 30
        var ofx = (Math.round(i % 8) * (dimq + 10))
        var sty = 30 + ((dimq + 30) * (Math.trunc(i / 8)))
        this.levelRectArray[i] = new LevelRectangle(stx + ofx, sty, dimq, dimq, "#000000", "#ccff99", "" + i)
        
    }

    this.backRect = { x: 0, y: 0, w: 200, h: 50, color: "#000000"}

    this.LevelSelectionHandler = function () {

        for (var i = 0; i < this.levelRectArray.length; i++) {
            var current = this.levelRectArray[i]
            if (Inputs.MouseInsideRect(current.x, current.y, current.width, current.height) && !current.completed) {
                this.levelRectArray[i].fill = "#0000FF"
                var current = "" + i
                if (Inputs.GetMousePress(MOUSE_LEFT) && parseInt(localStorage[current]) != i) {
                    game.level = game.levelsArray[i]            
                    game.level.LoadBlocks()
                    game.player = new Player(game)
                    game.state = STATE.PLAY
                }
            }
            else
                this.levelRectArray[i].fill = "#ccff99"
        }
        if (Inputs.MouseInsideRect(this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
            this.backRect.color = "#0000FF"
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                game.state = STATE.WAIT
            }
        }
        else
            this.backRect.color = "#000000"
        //controllo livelli completati
        for (var i = 0; i < this.levelRectArray.length; i++) {
            var current = "" + i
            var box = this.levelRectArray[i]
            if (parseInt(localStorage[current]) == i)
                box.fill = "#00ff00"
        }
    }

    this.Draw = function () {                   

        var pattern = game.ctx.createPattern(game.resource.menuBackground, "repeat")
        game.ctx.fillStyle = pattern
        game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height)

        game.ctx.font = "30px Arial"
        for (var i = 0; i < this.levelRectArray.length; i++) {
            var current = this.levelRectArray[i]
            game.ctx.strokeStyle = current.color
            game.ctx.fillStyle = current.fill
            game.ctx.strokeRect(current.x, current.y, current.width, current.height)
            game.ctx.fillRect(current.x, current.y, current.width, current.height)
            game.ctx.fillStyle = current.color
            game.ctx.fillText(current.text, current.x + (current.width / 2) - 10, current.y + (current.height / 2) + 10)
        }
        //bottone BACK
        game.ctx.strokeStyle = this.backRect.color
        game.ctx.fillStyle = this.backRect.color
        this.backRect.x = game.canvas.width / 2 - (this.backRect.w / 2)
        this.backRect.y = game.canvas.height - (this.backRect.h + 10)
        game.ctx.strokeRect(this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)
        game.ctx.fillText("Back", this.backRect.x + 60, this.backRect.y + 35)
 
    }
}

function PauseMenu() {

    this.win = false
    this.lose = false

    this.continueRect = {x: 0, y: 0, w: 200, h: 50, color: "#000000" }
    this.exitRect = { x: 0, y: 0, w: 200, h: 50, color: "#000000" }

    this.Draw = function () {
        game.ctx.save()
        game.ctx.strokeStyle = "#000000"
        var cx = game.canvas.width / 2
        var cy = game.canvas.height / 2
        var offset = 200
        var dimX = 300
        var dimY = 400
        game.ctx.strokeRect(cx - offset, cy - offset, dimX, dimY)
        var logo = game.resource.menuLogo
        game.ctx.drawImage(logo, 0, 0, logo.width, logo.height,
                                    cx - offset, cy - offset, dimX, dimY)

        //disegno i bottoni del menu
        game.ctx.font = "30px Arial"
        this.continueRect.x = cx - offset + 50
        this.continueRect.y = cy - offset + 100
        if (!this.win && !this.lose) {
            game.ctx.strokeStyle = this.continueRect.color
            game.ctx.fillStyle = this.continueRect.color
            game.ctx.strokeRect(this.continueRect.x, this.continueRect.y, this.continueRect.w, this.continueRect.h)
            game.ctx.fillText("Continue", this.continueRect.x + 20, this.continueRect.y + 35)

            if (Inputs.MouseInsideRect(this.continueRect.x, this.continueRect.y, this.continueRect.w, this.continueRect.h)) {
                this.continueRect.color = "#0000FF"
                if (Inputs.GetMousePress(MOUSE_LEFT)) {
                    game.state = STATE.PLAY
                }
            }
            else
                this.continueRect.color = "#000000"
        }
        if (this.win) {
            game.ctx.fillStyle = "#ffff00"
            game.ctx.fillText("VICTORY!!", this.continueRect.x + 20, this.continueRect.y + 35)
        }
        if (this.lose) {
            game.ctx.fillStyle = "#003366"
            game.ctx.fillText("GAME OVER!", this.continueRect.x + 20, this.continueRect.y + 35)
        }

        game.ctx.strokeStyle = this.exitRect.color
        game.ctx.fillStyle = this.exitRect.color
        this.exitRect.x = this.continueRect.x
        this.exitRect.y = this.continueRect.y + this.continueRect.h + 20
        game.ctx.strokeRect(this.exitRect.x, this.exitRect.y, this.exitRect.w, this.exitRect.h)
        game.ctx.fillText("Exit", this.exitRect.x + 20, this.exitRect.y + 35)

        if (Inputs.MouseInsideRect(this.exitRect.x, this.exitRect.y, this.exitRect.w, this.exitRect.h)) {
            this.exitRect.color = "#0000FF"
            if (Inputs.GetMousePress(MOUSE_LEFT)) {
                this.win = false
                this.lose = false
                if (game.level.import == null)  //se è uno dei livelli non creati torna alla selezione livelli
                    game.state = STATE.LEVEL
                else
                    game.state = STATE.EDIT
                game.ResetLevel()
            }
        }
        else
            this.exitRect.color = "#000000"

        game.ctx.restore()
    }
}

function HUD() {

    this.Draw = function () {                   
        var sprite = game.resource.life
        var x = 5
        var y = 5
        for (var i = 0; i < game.player.life; i++) {
            var offset = i * sprite.width
            game.ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height, x + offset, y, sprite.width, sprite.height)
        }
    }
}