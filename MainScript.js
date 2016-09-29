var game = null
var STATE = {
    WAIT: 0,
    EDIT: 1,
    LEVEL: 2,
    PLAY: 3,
    PAUSE: 4
}

var TYPE = {
    PLAYER: 0,
    BLOCK: 1,
    ENEMY: 2,
    SHOT: 3,
    PRIZE: 4
}

var COLLISION_SIDE = {
    NONE: 0,
    TOP: 1,
    BOTTOM: 2,
    LEFT: 3,
    RIGHT: 4
}

function BoundingBox(x,y,w,h) {
    this.x = x
    this.y = y
    this.width = w
    this.height = h

    this.Move = function (x, y) {
        this.x = x
        this.y = y
    }

    this.Collide = function (box) {
        return !(this.x + this.width < box.x || box.x + box.width < this.x ||
                this.y + this.height < box.y || box.y + box.height < this.y)
    }

    this.CollideAt = function (box, ofx, ofy) {
        return !(this.x + ofx + this.width < box.x || box.x + box.width < this.x + ofx ||
                this.y + this.height + ofy < box.y || box.y + box.height < this.y + ofy)
    }
}

function GameObject(game, x, y, w, h, type) {
    this.positionX = x
    this.positionY = y
    this.width = w
    this.height = h
    this.boundingBox = new BoundingBox(x, y, w, h)
    this.type = type

    this.setBoundingBox = function (x, y) {
        this.boundingBox.Move(x,y)
    }

    this.drawBoundingBox = function () {
            game.ctx.save()
            if (this.boundingBox != null && Inputs.GetKeyDown(KEY_SHIFT)) {
                game.ctx.strokeStyle = "#000000"
                game.ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height)
            }
            game.ctx.restore()
    }

    this.GetCollision = function (gameObjList, ofx, ofy) {
        var dim = gameObjList.length
        for (var i = 0; i < dim; i++) {
            var current = gameObjList[i]
            var cur_box = current.boundingBox
            if(this.boundingBox.CollideAt(cur_box, ofx, ofy) && this.type != current.type)
                return gameObjList[i]
        }
        return null
    }

    this.Delete = function () {
        game.gameobjects.splice(game.gameobjects.indexOf(this), 1)
    }

    this.Draw = function () { 
        this.drawBoundingBox()      //va reinvocata se ridefinita la draw da una sottoclasse
    }
    this.UpdatePosition = function () { }

    this.Hit = function () { }

    game.gameobjects.push(this)
}

function Prize(game, x, y, w, h) {
    this.currentSprite = game.resource.prize
    GameObject.call(this, game, x, y, w, h, TYPE.PRIZE)

    this.speedY = 0
    this.gravity = 0.4

    this.UpdatePosition = function () {
        this.speedY += this.gravity
        var col = null
        for (var a = Math.abs(this.speedY) ; a > 0; a -= Math.abs(this.gravity)) {
            if (this.speedY > 0) {
                col = this.GetCollision(game.gameobjects, 0, a)
                if (col == null) {
                    this.positionY += a
                    break
                }
            }
        }
        if (col != null) {
            this.speedY = 0
        }
        this.setBoundingBox(this.positionX, this.positionY)
    }

    this.Draw = function () {
        game.ctx.save()
        game.ctx.drawImage(this.currentSprite, 0, 0, this.width, this.height,
                                this.positionX, this.positionY, this.width, this.height)
        game.ctx.restore()
        this.drawBoundingBox()
    }
}

function Shot(game, x, y, w, h) {
    this.currentSprite = game.resource.shot
    GameObject.call(this, game, x, y, w, h, TYPE.SHOT)

    this.speedX = -5
    this.speedY = 0
    this.gravity = 0.4
    this.scaling = 1
    this.delete = false

    this.UpdatePosition = function () {
        if (this.positionX > game.player.positionX + game.player.width / 2) {
            this.speedX = 5
            this.scaling = 1
        }
        else {
            this.speedXv = -5
            this.scaling = -1
        }

        var col = this.GetCollision(game.gameobjects, this.speedX / 2, 0)
        if (col != null) {
            switch (col.type) {
                case TYPE.BLOCK:
                    this.Delete()       
                    this.delete = true
                    break
                case TYPE.ENEMY:
                    col.Hit()
                    this.Delete()
                    this.delete = true
                    break
            }
        }
        this.positionX += this.speedX
        
        if (this.positionX + this.width > game.gameRectWidth) {
            this.Delete()
            this.delete = true
        }
        if (this.positionX < 0) {
            this.Delete()
            this.delete = true
        }
        if (this.positionY > game.gameRectHeight) {
            this.Delete()
            this.delete = true
        }
        
        if (!this.delete) { //se non c'è stata collisione orizzontale controllo verticalmente
            this.speedY += this.gravity
            var verColl = null
            for (var a = Math.abs(this.speedY) ; a > 0; a -= Math.abs(this.gravity)) {
                if (this.speedY > 0) {
                    verColl = this.GetCollision(game.gameobjects, 0, a)
                    if (verColl == null) {
                        this.positionY += a
                        break
                    }
                }
            }
            if (verColl != null) {
                switch (verColl.type) {
                    case TYPE.BLOCK:
                        this.Delete()
                        break
                    case TYPE.ENEMY:
                        verColl.Hit()
                        this.Delete()
                        break
                }
            }
        }
        this.setBoundingBox(this.positionX, this.positionY) //aggiorno la bounding box
    }

    this.Draw = function () {
        var Xrel = this.positionX
        if (this.scaling == -1)
            Xrel = ((this.positionX + this.width) * -1)
        game.ctx.save()
        game.ctx.scale(this.scaling, 1)
        game.ctx.drawImage(this.currentSprite, 0, 0, this.width, this.height,
                                Xrel, this.positionY, this.width, this.height)
        game.ctx.restore()
        this.drawBoundingBox()      
    }
}

function Fire(game, x, y, w, h, dir) {
    this.currentSprite = game.resource.fire
    GameObject.call(this, game, x, y, w, h, TYPE.ENEMY)

    this.speedX = 2 * dir
    this.delete = false

    this.Hit = function () {
        this.Delete()
    }

    this.UpdatePosition = function () {
        
        this.positionX += this.speedX

        var col = this.GetCollision(game.gameobjects, 0, 0)
        if (col != null) {
            if (col.type == TYPE.PLAYER)
                game.player.Hit()
        }
        if (this.positionX + this.width > game.gameRectWidth) {
            this.Delete()
        }
        if (this.positionX < 0) {
            this.Delete()
        }
        this.setBoundingBox(this.positionX, this.positionY)
    }

    this.Draw = function () {
        game.ctx.save()
        game.ctx.drawImage(this.currentSprite, 0, 0, this.width, this.height,
                                this.positionX, this.positionY, this.width, this.height)
        game.ctx.restore()
        this.drawBoundingBox()
    }
}

function EnemyStand(game, x, y, w, h) {
    this.currentSprite = game.resource.enemyStand
    GameObject.call(this, game, x, y, w, h, TYPE.ENEMY)

    this.currentFrame = 0
    this.speedY = 0
    this.scaling = 1
    this.gravity = 0.4

    this.tick = 0                                                   //timer animazione sprite
    this.tickMax = 8
    this.fireTimerMax = Math.floor((Math.random() * 200) + 1) + 100 //timer sparo
    this.fireTimer = this.fireTimerMax
    this.hitted = false
    this.hittedTick = 0                                             //timer colpito
    this.life = 3
    this.die = false
    this.dieTimerMax = 20                                           
    this.dieTimer = this.dieTimerMax

    this.prizePerc = 50                                             //percentuale drop premio

    this.Hit = function () {
        this.life--
        if (this.life == 0) {
            this.die = true
        }
        this.hitted = true
    }

    this.UpdatePosition = function () {
        if (this.die) {
            this.currentSprite = game.resource.enemyStandDie
            this.currentFrame = 0
            this.dieTimer--
            if (this.dieTimer == 0) {
                var randP = Math.floor((Math.random() * 100) + 1)
                if (randP < this.prizePerc) {
                    var w = game.resource.prize.width
                    var h = game.resource.prize.height
                    var p = new Prize(game, this.positionX, this.positionY, w, h)
                }
                this.Delete()
                game.level.enemys.splice(game.level.enemys.indexOf(this), 1)
            }
        }
        else {
            if (this.currentSprite != game.resource.enemyStand)
                this.currentSprite = game.resource.enemyStand
            var col = this.GetCollision(game.gameobjects, 0, 0)
            if (col != null) {
                if(col.type == TYPE.PLAYER)
                    game.player.Hit()
            }
            this.fireTimer--
            if (this.fireTimer <= 0) {                  //quando scade il timer attivo animazione di sputafuoco
                this.tick += 1
                if (this.tick > this.tickMax) {
                    this.tick = 0
                    if (game.player.positionX > this.positionX) {
                        this.scaling = -1
                    }
                    else {
                        this.scaling = 1
                    }
                    if (this.currentFrame < this.currentSprite.frames - 1) {
                        this.currentFrame += 1                             
                    }
                    else {
                        this.currentFrame = 0
                        this.fireTimer = this.fireTimerMax
                        var Xrel = this.positionX
                        if (this.scaling == -1)
                            Xrel = ((this.positionX + this.width))
                        var direction = -this.scaling
                        var f = new Fire(game, Xrel, this.positionY + 15, game.resource.fire.width, game.resource.fire.height, direction)
                    }
                }
            }
            //gestione gravità
            this.speedY += this.gravity
            var col = null
            for (var a = Math.abs(this.speedY) ; a > 0; a -= Math.abs(this.gravity)) {
                if (this.speedY > 0) {
                    col = this.GetCollision(game.gameobjects, 0, a)
                    if (col == null) {
                        this.positionY += a
                        break
                    }
                }
            }
            if (col != null) {
                switch (col.type) {
                    case TYPE.BLOCK:
                        this.speedY = 0
                        break
                    case TYPE.PLAYER:
                        game.player.Hit()
                        break
                }
            }
            //se cade fuori schermo
            if (this.positionY > game.gameRectHeight)
                this.Hit()
        }
        //animazione colpito
        if (this.hitted) {
            this.currentSprite = game.resource.enemyStandDie
            this.currentFrame = 0
            this.hittedTick += 1
            if (this.hittedTick > this.tickMax) {
                this.hittedTick = 0
                this.hitted = false
            }
        }
        this.setBoundingBox(this.positionX, this.positionY) 
    }

    this.Draw = function () {
        var enemySingleWidth = 52
        var ofx = this.currentFrame * enemySingleWidth
        var Xrel = this.positionX
        if (this.scaling == -1)
            Xrel = ((this.positionX + enemySingleWidth) * -1)
        game.ctx.save()
        game.ctx.scale(this.scaling, 1)
        if (this.currentSprite == game.resource.enemyStandDie) {
            ofx = 0
            enemySingleWidth = this.currentSprite.width
        }
        game.ctx.drawImage(this.currentSprite, ofx, 0, enemySingleWidth, game.resource.enemyStand.height,
                                Xrel, this.positionY, this.width, this.height)
        game.ctx.restore()
        this.drawBoundingBox()
    }
}

function Enemy(game, x, y, w, h) {
    this.currentSprite = game.resource.enemy
    GameObject.call(this, game, x, y, w, h, TYPE.ENEMY)

    this.currentFrame = 0
    this.speedX = 1
    this.speedY = 0
    this.scaling = 1
    this.gravity = 0.4
    this.timer = 0
    this.waitTime = Math.floor((Math.random() * 150) + 1) + 50  //durata dell'attesa fermo
    this.moveTime = this.waitTime * 5                           //durata del movimento
    this.tick = 0                                               //timer animazione 
    this.tickMax = 8

    this.life = 1
    this.die = false
    this.dieTimerMax = 20                                       //timer animazione morte
    this.dieTimer = this.dieTimerMax

    this.prizePerc = 10                                         //percentuale drop premio

    this.Hit = function () {
        this.life--
        if (this.life == 0) {
            this.die = true
        }
    }

    this.UpdatePosition = function () {

        if (this.die) {
            this.currentSprite = game.resource.enemyDie
            this.currentFrame = 0
            this.dieTimer--
            if (this.dieTimer == 0) {
                var randP = Math.floor((Math.random() * 100) + 1)
                if (randP < this.prizePerc) {
                    var w = game.resource.prize.width
                    var h = game.resource.prize.height
                    var p = new Prize(game,this.positionX,this.positionY, w,h)
                }
                this.Delete()
                game.level.enemys.splice(game.level.enemys.indexOf(this),1)
            }
        }
        else {                      //se non è stato colpito si puo muovere
            //collisioni verticali
            this.speedY += this.gravity
            var col = null
            for (var a = Math.abs(this.speedY) ; a > 0; a -= Math.abs(this.gravity)) {
                if (this.speedY > 0) {
                    col = this.GetCollision(game.gameobjects, 0, a)
                    if (col == null) {
                        this.positionY += a
                        break
                    }
                    else if (col.type == TYPE.PRIZE) {
                        this.positionY += a
                        break
                    }
                }
            }
            if (col != null) {
                switch (col.type) {
                    case TYPE.BLOCK:
                        this.speedY = 0
                        break
                    case TYPE.PLAYER:
                        game.player.Hit()
                        break
                }
            }
            this.timer++
            if (this.timer > this.waitTime) {       //sta fermo waitTime e poi si muove
                //collisioni dovute a movimento orizzontale
                var col = this.GetCollision(game.gameobjects, this.speedX , -0.1)
                if (col != null) {
                    switch (col.type) {
                        case TYPE.BLOCK:
                            this.speedX = -this.speedX
                            break
                        case TYPE.PLAYER:
                            game.player.Hit()
                            break
                    }
                }
                this.positionX += this.speedX

                //gestione rispetto a rettangolo di gioco
                if (this.positionX + this.width > game.gameRectWidth) {
                    this.positionX = game.gameRectWidth - this.width
                    this.speedX = -this.speedX
                }
                if (this.positionX < 0) {
                    this.positionX = 0
                    this.speedX = -this.speedX
                }
                if (this.positionY > game.gameRectHeight)
                    this.Hit()
                //gestione sprite frame
                this.tick += 1
                if (this.tick > this.tickMax) {
                    this.tick = 0
                    if (this.currentFrame < this.currentSprite.frames - 1) {
                        this.currentFrame += 1                              //cambio sprite non ogni invocazione ma ogni tickMax
                    }
                    else {
                        this.currentFrame = 1
                    }
                }

                if (this.speedX > 0) {
                    this.scaling = -1
                }
                else {
                    this.scaling = 1
                }

                if (this.timer > this.moveTime) {           //si muove per moveTime poi si riferma
                    this.timer = 0
                    this.currentFrame = 0
                    if (game.player.positionX > this.positionX)
                        this.speedX = 1
                    else
                        this.speedX = -1
                }
            }
        }
        this.setBoundingBox(this.positionX, this.positionY) //aggiorno la bounding box
    }

    this.Draw = function () {
        var enemySingleWidth = 87
        var enemyMoveWidth = 70
        var f1Offset = enemySingleWidth
        var f2Offset = enemySingleWidth + enemyMoveWidth
        var Xrel = this.positionX
        if (this.scaling == -1)
            Xrel = ((this.positionX + enemyMoveWidth) * -1) +9
        game.ctx.save()
        game.ctx.scale(this.scaling, 1)
        switch(this.currentFrame){
            case 0: game.ctx.drawImage(this.currentSprite, 0, 0, enemySingleWidth, game.resource.enemy.height,
                                Xrel, this.positionY, this.width, this.height)
                    break
            case 1: game.ctx.drawImage(this.currentSprite, f1Offset , 0, enemyMoveWidth, game.resource.enemy.height,
                                Xrel, this.positionY, this.width, this.height)
                    break
            case 2: game.ctx.drawImage(this.currentSprite, f2Offset, 0, enemySingleWidth, game.resource.enemy.height,
                                Xrel, this.positionY, this.width, this.height)
                    break
        }
        game.ctx.restore()
        this.drawBoundingBox()
    }
}

function Player(game) {

    this.spawnX = 300
    this.spawnY = 490
    this.currentSprite = game.resource.playerIdle
    this.sTileWidth = this.currentSprite.width
    this.sTileHeigth = this.currentSprite.height
    GameObject.call(this, game, this.spawnX, this.spawnY, this.sTileWidth, this.sTileHeigth, TYPE.PLAYER)

    this.currentFrame = 0
    this.speedX = 0
    this.speedY = 0
    this.maxSpeed = 3
    this.tick = 0                      //timer animazione
    this.tickMax = 10
    this.scaling = 1                   //variabile per gestire l'orientamento dell'animazione(sprites orientate solo a sx)
    this.gravity = 0.4

    this.hit = false
    this.dieFrame = 0
    this.dieTick = 10                   //timer animazione morte
    this.invulnerabile = false          //invulnerabilità dopo essere ucciso (durante il respawn)
    this.invTimerMax = 150
    this.invTimer = this.invTimerMax    //timer invulnerabilità
    this.alpha = false
    this.alphaTimerMax = 10             //timer per la trasparenza durante invulnerabilità
    this.alphaTimer = this.alphaTimerMax
    this.life = 3
    this.lifeMax = 5

    this.canShot = true
    this.shotTimerMax = 5               
    this.shotTimer = this.shotTimerMax
    this.shotFrame = 0

    this.Hit = function () {
        if (!this.invulnerabile && !this.hit) {
            this.hit = true
            this.life--
            if (this.life <= 0) {
                game.pauseMenu.lose = true
                game.state = STATE.PAUSE
            }
        }
    }

    this.Respawn = function () {
        this.positionX = this.spawnX
        this.positionY = this.spawnY
        this.speedX = 0
        this.currentSprite = game.resource.playerIdle
        this.currentFrame = 0
        this.hit = false
        this.dieTick = 10
        this.dieAnimationTimer = 100
        this.invulnerabile = true
    }

    this.UpdatePosition = function () {
        //Controllo movimento orizzontale
        if (Inputs.GetKeyDown(KEY_D) && !this.hit) {
            if (this.speedX < 0) this.speedX = 0
            if (this.speedX < this.maxSpeed) this.speedX += 0.2
            this.scaling = -1

        }
        else if (Inputs.GetKeyDown(KEY_A) && !this.hit) {
            if (this.speedX > 0) this.speedX = 0
            if (this.speedX > -this.maxSpeed) this.speedX -= 0.2
            this.scaling = 1
        }
        else {
            this.speedX /= 1.1             //rallenta fino a fermarsi quando smetto di premere
            if (Math.abs(this.speedX) < 1) {
                this.speedX = 0
                this.currentSprite = game.resource.playerIdle
                this.currentFrame = 0
            }
        }

        if (Inputs.GetKeyDown(KEY_W) && this.GetCollision(game.gameobjects, 0, 1) != null && !this.hit) {
            this.speedY -= 11
        }
        //collisioni Verticali                                  
        this.speedY += this.gravity
        var collides = false
        for (var a = Math.abs(this.speedY) ; a > 0; a -= Math.abs(this.gravity)) {  //controllo preventivo su collisione
            if (this.speedY > 0) {
                var col = this.GetCollision(game.gameobjects, 0, a)
                if (col == null) {           
                    this.positionY += a
                    break
                } else {
                    collides = true
                    if (col.type == TYPE.PRIZE) {
                        this.life++
                        if (this.life > this.lifeMax)
                            this.life = this.lifeMax
                        col.Delete()
                    }                    //gestisco collisioni verticali(poiche alcuni nemici non hanno movimenti vertcali(hit dall'alto/basso)
                    if (col.type == TYPE.ENEMY) { 
                        this.Hit()
                    }
                }
            }
            else {
                var coll = this.GetCollision(game.gameobjects, 0, -a)
                if (coll == null ) {
                    this.positionY -= a
                    break
                } else {
                    collides = true
                    if(coll.type == TYPE.PRIZE) {
                        this.life++
                        if (this.life > this.lifeMax)
                            this.life = this.lifeMax
                        coll.Delete()
                    }
                    if (coll.type == TYPE.ENEMY) {   
                        this.Hit()
                    }
                }
            }
        }
        if (collides) {
            this.speedY = 0       
        }

        //collisioni orizzontali
        var a = Math.abs(this.speedX)
        if (this.speedX > 0) {
            var col = this.GetCollision(game.gameobjects, a, -0.1)
            if (col == null) {
                this.positionX += a
            }
            else {
                switch (col.type) {
                        case TYPE.ENEMY:
                            this.positionX += a
                            break
                        case TYPE.PRIZE:
                            this.life++
                            if (this.life > this.lifeMax)
                                this.life = this.lifeMax
                            col.Delete()
                            break
                }
            }
        }
        else {
            var col = this.GetCollision(game.gameobjects, -a, -0.1)
            if (col == null) {
                this.positionX -= a
            }
            else {
                switch (col.type) {
                    case TYPE.ENEMY:
                        this.positionX -= a
                        this.Hit()
                        break
                    case TYPE.PRIZE:
                        this.life++
                        if (this.life > this.lifeMax)
                            this.life = this.lifeMax
                        col.Delete()
                        break
                }
            }
        }
        //gestione rettangolo di gioco
        if (this.positionX + this.width > game.gameRectWidth)
            this.positionX = game.gameRectWidth - this.width
        if (this.positionX < 0)
            this.positionX = 0
        if (this.positionY > game.gameRectHeight)
            this.Hit()

        //gestione sprite
        if (this.speedX != 0) {
            this.tick += 1
            if (this.currentSprite != game.resource.playerMove) {

                this.currentSprite = game.resource.playerMove
                this.currentFrame = 0
            }
            else if (this.tick > this.tickMax) {
                this.tick = 0
                if (this.currentFrame < this.currentSprite.frames - 1) {
                    this.currentFrame += 1                              //cambio sprite non ogni invocazione ma ogni tickMax
                }
                else {
                    this.currentFrame = 0
                }
            }
            if (this.speedX > 0) {          //se == 0 mantiene l'ultimo scaling usato
                this.scaling = -1
            }
            else if (this.speedX < 0) {
                this.scaling = 1
            }
        }
        if (this.speedY != 0) {
            if (this.currentSprite != game.resource.playerJump && this.speedY != 0) {

                this.currentSprite = game.resource.playerJump
                this.currentFrame = 0
            }
        }
        //gestione colpito
        if (this.hit) {
            if (this.currentSprite != game.resource.playerDie) {
                this.currentSprite = game.resource.playerDie
                this.currentFrame = this.dieFrame
            }
            this.dieTick--
            if (this.dieTick == 0) {
                this.dieTick = 10
                this.dieFrame += 1
                if (this.dieFrame > this.currentSprite.frames - 1) {
                    this.dieFrame = 0
                    this.Respawn()
                }
            }

        }
        if (this.invulnerabile) {
            this.invTimer--
            if (this.invTimer == 0) {
                this.invulnerabile = false
                this.invTimer = this.invTimerMax
            }
            else {
                this.alphaTimer--
                if (this.alphaTimer == 0) {
                    this.alpha = !this.alpha
                    this.alphaTimer = this.alphaTimerMax
                }
            }
        }
        //gestione sparo
        if (this.canShot) {
            if (Inputs.GetKeyPress(KEY_SPACE) && !this.hit) {
                var shotSize = 20
                var Xrel = this.positionX + 5
                if (this.scaling == -1)
                    Xrel = (this.positionX + this.sTileWidth - 5)
                var shot = new Shot(game, Xrel, this.positionY, shotSize, shotSize)
                this.canShot = false
                this.shotTimer = this.shotTimerMax
            }
        } else {
            if (this.currentSprite != game.resource.playerAttack) {
                this.currentSprite = game.resource.playerAttack
                this.currentFrame = this.shotFrame
            }
            this.shotTimer--
            if (this.shotTimer == 0) {
                this.shotTimer = this.shotTimerMax
                this.shotFrame += 1
                if (this.shotFrame > this.currentSprite.frames - 1) {
                    this.shotFrame = 0
                    this.canShot = true
                }
            }
        }

        this.setBoundingBox(this.positionX, this.positionY) //aggiorno la bounding box
    }

    this.Draw = function () {
        var ofx = this.currentFrame * this.sTileWidth
        var Xrel = this.positionX
        if (this.scaling == -1)
            Xrel = (this.positionX + this.sTileWidth) * -1
        game.ctx.save()
        if (this.invulnerabile) {
            if (this.alpha)
                game.ctx.globalAlpha = 0.3
            else
                game.ctx.globalAlpha = 0.6
        }
        game.ctx.scale(this.scaling, 1)
        if (this.currentSprite == game.resource.playerAttack) 
            ofx = this.currentFrame * (this.sTileWidth + 15)        //fix sprite dimension
        if (this.currentSprite == game.resource.playerDie)
            ofx = this.currentFrame * (this.sTileWidth + 3)
        game.ctx.drawImage(this.currentSprite, ofx, 0, this.sTileWidth, this.sTileHeigth,
                            Xrel, this.positionY, this.sTileWidth, this.sTileHeigth)
        game.ctx.restore()
        this.drawBoundingBox()
    }
}

function ResourceLoader() {
    this.menuBackground = new Image()
    this.menuBackground.src = "Images/Snow_Background.png"

    this.menuLogo = new Image()
    this.menuLogo.src = "Images/logo.png"

    this.background1 = new Image()
    this.background1.src = "Images/Background1.jpg"

    this.background2 = new Image()
    this.background2.src = "Images/Background2.jpg"

    this.background3 = new Image()
    this.background3.src = "Images/Background3.jpg"

    this.background4 = new Image()
    this.background4.src = "Images/Background4.jpg"

    this.tileMap = new Image()
    this.tileMap.src = "Images/TileMapSample.png"
    this.tileMap.frames = 5

    this.playerIdle = new Image()
    this.playerIdle.src = "Images/Idle2.png"
    this.playerIdle.frames = 1
 
    this.playerMove = new Image()
    this.playerMove.src = "Images/move.png"
    this.playerMove.frames = 3

    this.playerAttack = new Image()
    this.playerAttack.src = "Images/Attack.png"
    this.playerAttack.frames = 3

    this.playerDie = new Image()
    this.playerDie.src = "Images/Die.png"
    this.playerDie.frames = 7

    this.playerJump = new Image()
    this.playerJump.src = "Images/Jump.png"
    this.playerJump.frames = 5

    this.enemy = new Image()
    this.enemy.src = "Images/Enemy.png"
    this.enemy.frames = 3

    this.enemyDie = new Image()
    this.enemyDie.src = "Images/EnemyDie.png"
    this.enemyDie.frames = 1

    this.enemyStand = new Image()
    this.enemyStand.src = "Images/Enemy2.png"
    this.enemyStand.frames = 3

    this.enemyStandDie = new Image()
    this.enemyStandDie.src = "Images/Enemy2Die.png"
    this.enemyStandDie.frames = 1

    this.fire = new Image()
    this.fire.src = "Images/fire.png"
    this.fire.frames = 1

    this.shot = new Image()
    this.shot.src = "Images/Shot.png"
    this.shot.frames = 1

    this.prize = new Image()
    this.prize.src = "Images/prize.png"
    this.prize.frames = 1

    this.life = new Image()
    this.life.src = "Images/Life.png"
    this.life.frames = 1

}

function Game() {
    this.documentURL = document.location.href
    this.div = document.getElementById("GameDiv")
    this.canvas = document.getElementById("GameCanvas")
    this.ctx = this.canvas.getContext("2d")
    this.gameRectWidth = this.canvas.width - 200   //lascio una parte del canvas per il menù dell'editor
    this.gameRectHeight = this.canvas.height

    this.state = STATE.WAIT
    this.gameobjects = []

    this.resource = new ResourceLoader()            //risorse di gioco (sprite,sfondi,ecc..)
    this.menu = new Menu()                          //menu iniziale
    this.pauseMenu = new PauseMenu()                //menu di pausa/vittoria/gameover
    this.player = null                              
    this.levelEditor = new LevelEditor()            //editor di livelli

    this.levelsArray = []                           //array dei livelli (caricati al caricamneto della pagina, vedi giu*)
    this.level = null                               //livello attuale
    this.hud = new HUD()                            //HUD contatore vite rimaste

    //disabilito il click destro sul canvas
    this.canvas.addEventListener('contextmenu', function (e) {
        if (e.button === 2) {
            e.preventDefault()
            return false
        }
    }, false)

    this.ResetLevel = function () {
        this.gameobjects = []               //sarà il menu di selezione livello a ricreare tutti gli oggetti del livello
        this.level.Clear()
    }

    this.Draw = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.state == STATE.WAIT)
            this.menu.Draw()
        if (this.state == STATE.EDIT)
            this.levelEditor.Draw()
        if (this.state == STATE.LEVEL)
            this.levelsSelector.Draw()
        if (this.state == STATE.PLAY) {
            if(this.level != null)
                this.level.Draw()
            for (var i = 0; i < this.gameobjects.length; i++) {
                this.gameobjects[i].Draw()
            }
            this.hud.Draw()
        }
        if (this.state == STATE.PAUSE) {
            if (this.level != null)
                this.level.Draw()
            this.pauseMenu.Draw()
        }
    }

    this.UpdatePosition = function () {
        if (Inputs.GetKeyDown(KEY_ESC))
            this.state = STATE.PAUSE
        for (var i = 0; i < this.gameobjects.length; i++) {
            this.gameobjects[i].UpdatePosition()
        }
        if (this.level != null) {
            if (this.level.enemys.length == 0) {
                this.pauseMenu.win = true
                this.state = STATE.PAUSE
                var x = "" + this.level.ide
                localStorage[x] = this.level.ide
            }
        }
    }

    this.GameLoop = function () {
        if (this.state == STATE.PLAY)
            this.UpdatePosition()               //funzione che aggiornerà le posizioni degli oggetti
        if (this.state == STATE.EDIT) 
            this.levelEditor.InputHandler()     //funzione gestione dell'editor
        if(this.state == STATE.LEVEL)
            this.levelsSelector.LevelSelectionHandler()     //funzione gestione selezione livelli

        this.Draw()                     //funzione che disegna gli oggetti

        Inputs.Clear()

        window.requestAnimFrame(function () {
            game.GameLoop()
        })
    }
}

window.requestAnimFrame = (function (callback) {

    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||

           function (callback) {
               window.setTimeout(callback, 1000 / 60)
           }
})()

window.addEventListener('load', function () {
    game = new Game()
    for (var i = 0; i < levels.length; i++) {               //levels è l'arry contenente tutte le configurazioni dei livelli(vedi Levels.js)
        game.levelsArray[i] = new Level(i, game, null)          //*
    }
    game.levelsSelector = new LevelsMenu(levels.length, game)

    game.GameLoop()
}, true)