let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a',
    parent: 'game-wrapper',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

let paddle, ball, bricks;
let balls = [];
let score = 0;
let scoreText;
let nexusCoins = 0;
let nexusCoinsText;
let isLaunched = false;
let startButton;
let nexusBonusCaught = false;
let bonusGroup;
let paddleSizeLevel = 0;
let currentPaddleSize = 120;
let ballSpeedLevel = 0; // -1 = lent, 0 = normal, 1 ou 2 = rapide
let isGameStopped = false;
let isLevelTransition = false;
let prevPaddleX = 400; // Position de départ du paddle (au centre)
let isSoundOn = true; // true = sons activés, false = muet
let nexusBonusCount = 0; // Nombre de NexusCoin bonus attrapés/spawnés dans le niveau courant

// 🟦 Table de correspondance couleur par ID
const brickColors = {
    1: 0xaaaaaa, // 🟪 argentée (2 coups)
    2: 0xff4d4d, // 🔴 rouge (normal)
    3: 0xffff66, // 🟨 dorée (15 coups)
    4: 0x66ccff, // 🔵 bleu
    5: 0x66ff66, // 🟢 vert
    6: 0xff99ff, // 🌸 rose
    7: 0xff9900  // 🟧 orange (brique dorée fatiguée)
};

function forceBallSpeed(ball, speedTarget) {
    if (!ball.body) return;
    let vx = ball.body.velocity.x;
    let vy = ball.body.velocity.y;
    let norm = Math.sqrt(vx * vx + vy * vy);
    if (norm === 0) return;
    let ratio = speedTarget / norm;
    ball.body.velocity.x = vx * ratio;
    ball.body.velocity.y = vy * ratio;
}

// 🎨 Texture dynamique des paddles
function generatePaddleTextures(scene) {
    const widths = [60, 80, 120, 160, 200];
    for (let w of widths) {
        const key = `paddle_${w}`;
        if (!scene.textures.exists(key)) {
            const canvas = scene.textures.createCanvas(key, w, 24);
            const ctx = canvas.getContext();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, 24);
            canvas.refresh();
        }
    }
}

// 🎨 Génère dynamiquement les textures de briques
function generateBrickTextures(scene) {
    for (const [type, color] of Object.entries(brickColors)) {
        const key = `brick_${type}`;
        if (!scene.textures.exists(key)) {
            const canvas = scene.textures.createCanvas(key, 48, 24);
            const ctx = canvas.getContext();
            ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
            ctx.fillRect(0, 0, 48, 24);
            canvas.refresh();
        }
    }
}

let currentLevel = 0;

function createBrick(x, y, type = 2) {
    const brick = bricks.create(x, y, `brick_${type}`);
    brick.setDisplaySize(48, 24);
    brick.refreshBody();

    brick.setActive(true).setVisible(true);
    brick.setData('type', type);

    // 🔁 Réinitialise toujours les HP même si brique existait déjà
    if (type === 1) {
        brick.setData('hp', 2);
        brick.clearTint();
    } else if (type === 3) {
        brick.setData('hp', 15);        // dorée : 15 coups
        brick.setTint(brickColors[3]);  // couleur jaune initiale
    } else {
        brick.setData('hp', 1);
        brick.clearTint();
    }
}

function preload() {
    this.load.image('ball', 'assets/shinyball.png');
    this.load.image('bonus_nexus', 'assets/bonus_nexus.png');
    this.load.image('bonus_paddle_plus', 'assets/bonus_paddle_plus.png');
    this.load.image('bonus_paddle_minus', 'assets/bonus_paddle_minus.png');
    this.load.image('bonus_speed_up', 'assets/bonus_speed_up.png');
    this.load.image('bonus_speed_down', 'assets/bonus_speed_down.png');
    this.load.image('bonus_multi_ball', 'assets/bonus_multi_ball.png');
    this.load.image('nexuslogo', 'assets/NexusIA_logo2.png');
    // Sons
    this.load.audio('paddle', 'assets/sounds/paddle.wav');
    this.load.audio('paddleRetreci', 'assets/sounds/paddleRetreci.wav');
    this.load.audio('lvlSuivant', 'assets/sounds/lvlSuivant.wav');
    this.load.audio('GameOver', 'assets/sounds/GameOver.wav');
    this.load.audio('briqueArgent', 'assets/sounds/briqueArgent.wav');
    this.load.audio('brique', 'assets/sounds/brique.wav');
    this.load.audio('bonus_nexuscoin', 'assets/sounds/bonus_nexuscoin.wav');
}

function create() {
    generateBrickTextures(this);
    generatePaddleTextures(this);

    // ✅ Timer qui tente de faire spawn le bonus NexusCoin toutes les 20 à 35 secondes
    this.time.addEvent({
        delay: Phaser.Math.Between(20000, 35000),
        callback: () => {
            if (nexusBonusCount >= 3) return;
            if (
                nexusBonusCaught ||
                bonusGroup.getChildren().some(b => b.texture.key === 'bonus_nexus')
            ) {
                return;
            }
            if (Math.random() < 0.3) {
                const bonusSprite = bonusGroup.create(
                    Phaser.Math.Between(100, 700),
                    0,
                    'bonus_nexus'
                ).setScale(0.9);
                bonusSprite.setVelocityY(150);
                bonusSprite.setData('type', 'nexuscoin');
                nexusBonusCount++;
            }
        },
        callbackScope: this,
        loop: true
    });
    
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Orbitron'
    });
    nexusCoinsText = this.add.text(16, 40, 'NexusCoins : 0', {
        fontSize: '18px',
        fill: '#ffd700',
        fontFamily: 'Orbitron'
    });

    startLevel(this);
}

function launchBall() {
    isLaunched = true;
    ball.setData('onPaddle', false);

    ball.setVelocity(
        Phaser.Math.Between(-100, 100),
        -300
    );
}

function hitBrick(ball, brick) {
    let hp = brick.getData('hp');

    if (hp === -1) {
        // Brique invincible (au cas où d'autres types utiliseraient -1)
        brick.setTint(0xffcc00);
        if (isSoundOn && ball.scene.sound) {
            ball.scene.sound.play('briqueArgent');
        }
        return;
    }

    hp--;
    brick.setData('hp', hp);

    // 🔶 Brique dorée : devient orange quand il reste <= 5 coups
    if (brick.getData('type') === 3 && hp > 0) {
        brick.setTexture(hp <= 5 ? 'brick_7' : 'brick_3');
    }

    if (hp <= 0) {
        brick.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);
    } else {
        // 🟪 Brique argent (1 coup restant) ➜ change de couleur
        brick.setTint(0x888888);
    }
    
    if (brick.getData('type') === 1 || brick.getData('type') === 3) {
        if (isSoundOn && ball.scene.sound) {
            ball.scene.sound.play('briqueArgent');
        }
    } else {
        if (isSoundOn && ball.scene.sound) {
            ball.scene.sound.play('brique');
        }
    }

    if (bricks.getChildren().every(b =>
        b.getData('hp') === -1         // indestructible (optionnel)
        || b.getData('type') === 3     // brique jaune, on l'ignore
        || !b.active                   // déjà cassée
    )) {
        cleanScene(this);
        showNextLevelButton(this);
    }
    
    if (Math.random() < 0.10) {
        const bonusOptions = [
            { texture: 'bonus_paddle_plus', type: 'paddle_plus' },
            { texture: 'bonus_paddle_minus', type: 'paddle_minus' },
            { texture: 'bonus_speed_up', type: 'speed_up' },
            { texture: 'bonus_speed_down', type: 'speed_down' },
            { texture: 'bonus_multi_ball', type: 'multi_ball' }
        ];

        const chosen = Phaser.Utils.Array.GetRandom(bonusOptions);

        const bonusSprite = bonusGroup.create(brick.x, brick.y, chosen.texture).setScale(0.9);
        bonusSprite.setVelocityY(100);
        bonusSprite.setData('type', chosen.type);
    }
}

function hitPaddle(ball, paddle, scene) {
    let diff = ball.x - paddle.x;
    let paddleVelocity = paddle.x - prevPaddleX;

    if (Math.abs(diff) < 5) {
        let bonus = Phaser.Math.Clamp(paddleVelocity * 6, -60, 60);
        ball.setVelocityX(Phaser.Math.Between(-10, 10) + bonus);
        ball.setVelocityY(-Math.abs(ball.body.velocity.y));
    } else {
        const maxBounce = 400;
        const ratio = diff / (paddle.displayWidth / 2);
        let bonus = Phaser.Math.Clamp(paddleVelocity * 6, -60, 60);
        ball.setVelocityX(ratio * maxBounce + bonus);
        ball.setVelocityY(-Math.abs(ball.body.velocity.y));
    }
    if (isSoundOn && scene.sound) {
        scene.sound.play('paddle');
    }
}

function catchBonus(paddle, bonusSprite) {
    if (isGameStopped) return;

    const type = bonusSprite.getData('type');
    bonusSprite.destroy();
    
    if (type === 'nexuscoin') {
        const possibleValues = [40, 60, 80, 120, 160, 200];
        const randomCoins = possibleValues[Math.floor(Math.random() * possibleValues.length)];
        nexusCoins += randomCoins;
        if (nexusCoinsText) nexusCoinsText.setText('NexusCoins : ' + nexusCoins);
        
        if (isSoundOn && paddle.scene.sound) {
            paddle.scene.sound.play('bonus_nexuscoin');
        }
        return;
    }

    if (type === 'paddle_plus') {
        if (paddleSizeLevel < 2) {
            paddleSizeLevel++;
            const newSize = 120 + paddleSizeLevel * 40;
            changePaddleSize(newSize);
            if (isSoundOn && paddle.scene.sound) {
                paddle.scene.sound.play('paddleRetreci');
            }
        }
    } else if (type === 'paddle_minus') {
        if (paddleSizeLevel > -2) {
            paddleSizeLevel--;
            const newSize = 120 + paddleSizeLevel * 40;
            changePaddleSize(newSize);
            if (isSoundOn && paddle.scene.sound) {
                paddle.scene.sound.play('paddleRetreci');
            }
        }
    } else if (type === 'speed_up') {
        if (ballSpeedLevel < 2) {
            ballSpeedLevel++;
            updateBallSpeed();
        }
    } else if (type === 'speed_down') {
        if (ballSpeedLevel > 0) {
            ballSpeedLevel--;
            updateBallSpeed();
        }
    } else if (type === 'multi_ball') {
        const baseSpeed = 490;
        const speedMultiplier = 1 + ballSpeedLevel * 0.4;

        for (let i = 0; i < 2; i++) {
            const newBall = createBall(paddle.scene, paddle.x, paddle.y - 30);

            const angle = Phaser.Math.DegToRad(Phaser.Math.Between(210, 330));
            const vx = Math.cos(angle) * baseSpeed * speedMultiplier;
            const vy = Math.sin(angle) * baseSpeed * speedMultiplier;

            newBall.setVelocity(vx, vy);
            balls.push(newBall);
        }
    }

    score += 50;
    scoreText.setText('Score: ' + score);
}

function updateBallSpeed() {
    const baseSpeed = 490;
    const speedMultiplier = 1 + ballSpeedLevel * 0.4;
    const speedTarget = baseSpeed * speedMultiplier;

    balls.forEach(b => {
        if (!b.body || b.getData('onPaddle')) return;
        forceBallSpeed(b, speedTarget);
    });
}

function createBall(scene, x, y, onPaddle = false) {
    const newBall = scene.physics.add.image(x, y, 'ball')
        .setCollideWorldBounds(true)
        .setBounce(1);
    newBall.setScale(0.5);
    newBall.body.setCircle(newBall.width * 0.25);
    newBall.setData('onPaddle', onPaddle);

    scene.physics.add.collider(newBall, bricks, hitBrick, null, scene);
    scene.physics.add.collider(newBall, paddle, function(ball, paddle) {
        hitPaddle(ball, paddle, scene);
    }, null, scene);

    return newBall;
}

function update() {
    if (isGameStopped || isLevelTransition) return;

    const baseSpeed = 490;
    const speedMultiplier = 1 + ballSpeedLevel * 0.4;
    const speedTarget = baseSpeed * speedMultiplier;

    balls.forEach((b, index) => {
        if (b.y > 600) {
            b.destroy();
            balls.splice(index, 1);
            return;
        }
        if (b.getData('onPaddle')) return;
        forceBallSpeed(b, speedTarget);
    });

    if (balls.length === 0 && !isGameStopped) {
        isGameStopped = true;
        cleanScene(this);
        showRestartButton(this);
        return;
    }

    bonusGroup.getChildren().forEach(b => {
        if (b.y > 600) b.destroy();
    });

    prevPaddleX = paddle.x;
}

function cleanScene(scene) {
    if (paddle) paddle.destroy();
    balls.forEach(b => b.destroy());
    balls = [];
    if (bricks) bricks.clear(true, true);
    if (bonusGroup) bonusGroup.clear(true, true);
    if (startButton) startButton.destroy();
    if (scene.nextLevelButton) scene.nextLevelButton.destroy();
    if (scene.levelCompletedText) scene.levelCompletedText.destroy();
    if (scene.restartButton) scene.restartButton.destroy();
}

function showRestartButton(scene) {
    if (scene.restartButton) scene.restartButton.destroy();
    if (scene.restartTitle) scene.restartTitle.destroy();
    if (scene.restartSubtitle) scene.restartSubtitle.destroy();
    
    if (isSoundOn && scene.sound) {
        scene.sound.play('GameOver');
    }

    scene.restartTitle = scene.add.text(400, 220, '💀 Tu as perdu.', {
        fontSize: '32px',
        fill: '#ff4444',
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(999);

    scene.restartSubtitle = scene.add.text(400, 260, 'Game Over', {
        fontSize: '24px',
        fill: '#cccccc'
    }).setOrigin(0.5).setDepth(999);

    scene.restartButton = scene.add.text(400, 320, '▶ Recommencer', {
        fontSize: '28px',
        fill: '#ffffff',
        backgroundColor: '#000',
        padding: { x: 10, y: 5 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(1000);

    scene.restartButton.on('pointerdown', () => {
        scene.restartTitle.destroy();
        scene.restartSubtitle.destroy();
        scene.restartButton.destroy();
        
        score = 0;
        nexusCoins = 0;
        if (scoreText) scoreText.setText('Score: 0');
        if (nexusCoinsText) nexusCoinsText.setText('NexusCoins : 0');

        if (currentLevel !== 0) {
            currentLevel = 0;
        }
        
        startLevel(scene);
    });
}

function showNextLevelButton(scene) {
    isLevelTransition = true;
    if (isSoundOn && scene.sound) {
        scene.sound.play('lvlSuivant');
    }
    scene.levelCompletedText = scene.add.text(400, 250, '✅ Niveau terminé !', {
        fontSize: '28px',
        fill: '#00ff88'
    }).setOrigin(0.5);

    scene.nextLevelButton = scene.add.text(400, 300, '➡️ Niveau suivant', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#333',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    scene.nextLevelButton.on('pointerdown', () => {
        scene.levelCompletedText.destroy();
        scene.nextLevelButton.destroy();
        cleanScene(scene);
        currentLevel++;
        if (currentLevel >= levels.length) currentLevel = 0;
        startLevel(scene);
    });
}

function changePaddleSize(newWidth) {
    newWidth = Phaser.Math.Clamp(newWidth, 60, 200);
    currentPaddleSize = newWidth;

    paddle.setTexture(`paddle_${newWidth}`);
    paddle.setDisplaySize(newWidth, 24);
    paddle.body.setSize(newWidth, 24);
    paddle.body.setOffset((paddle.displayWidth - newWidth) / 2, 0);
}

function startLevel(scene) {
    scene.input.removeAllListeners();
    prevPaddleX = 400;
    isLevelTransition = false;
    isGameStopped = false;
    nexusBonusCount = 0;

    if (scene.bgLogo) scene.bgLogo.destroy();

    scene.bgLogo = scene.add.image(400, 300, 'nexuslogo')
        .setOrigin(0.5)
        .setAlpha(0.13)
        .setDisplaySize(800, 600)
        .setDepth(-10);

    isLaunched = false;
    nexusBonusCaught = false;
    paddleSizeLevel = 0;
    ballSpeedLevel = 0;
    currentPaddleSize = 120;

    scoreText.setText('Score: ' + score);
    nexusCoinsText.setText('NexusCoins : ' + nexusCoins);

    paddle = scene.physics.add.image(400, 550, 'paddle_120').setImmovable();
    paddle.body.allowGravity = false;
    paddle.setCollideWorldBounds(true);

    balls = [];
    ball = createBall(scene, 400, 530, true);
    balls.push(ball);
    scene.physics.world.checkCollision.down = false;
    
    bricks = scene.physics.add.staticGroup();
    bonusGroup = scene.physics.add.group();

    const level = levels[currentLevel];
    const brickWidth = 48;
    const brickHeight = 24;
    const spacingX = 2;
    const spacingY = 2;
    const cols = level[0].length;
    const rows = level.length;
    const offsetX = (800 - cols * (brickWidth + spacingX)) / 2;
    const offsetY = 100;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const type = level[row][col];
            if (type !== 0) {
                const x = offsetX + col * (brickWidth + spacingX) + brickWidth / 2;
                const y = offsetY + row * (brickHeight + spacingY);
                createBrick(x, y, type);
            }
        }
    }

    startButton = scene.add.text(400, 300, '▶ Commencer', {
        fontSize: '28px',
        fill: '#22c55e',
        backgroundColor: '#000',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
        if (!isLaunched) {
            launchBall();
            startButton.setVisible(false);
        }
    });

    scene.physics.add.collider(ball, bricks, hitBrick, null, scene);
    scene.physics.add.collider(ball, paddle, function(ball, paddle) {
        hitPaddle(ball, paddle, scene);
    }, null, scene);
    scene.physics.add.overlap(paddle, bonusGroup, catchBonus, null, scene);

    scene.input.on('pointermove', pointer => {
        paddle.x = Phaser.Math.Clamp(pointer.x, paddle.displayWidth / 2, 800 - paddle.displayWidth / 2);
        if (ball.getData('onPaddle')) {
            ball.x = paddle.x;
        }
    });

    scene.input.on('pointerup', () => {
        if (ball.getData('onPaddle')) {
            launchBall();
            startButton.setVisible(false);
        }
    });
}
