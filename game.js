import { HighScores, Settings } from "./localStorage.js";

function array2d(w, h, fn) {
    return [...Array(h)].map(x => [...Array(w)].map(fn));
}

const BOMB = 9;
const SQUARE_SIZES = [64, 48, 32, 16];
const PI2 = Math.PI * 2;
const COLORS = {
    1: 'pink',
    2: 'yellow',
    3: 'cyan',
    4: 'green',
    5: 'orange',
    6: 'lime',
    7: 'red',
    8: 'purple'
}

function banSquare(banX, banY, allowedX, allowedY) {
    const dx = banX - allowedX;
    const dy = banY - allowedY;
    const d = Math.sqrt(dx * dx + dy * dy);

    return d >= 2;
}

export class Game {
    constructor(canvas, ctx, size, bombs) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.size = size;
        this.bombs = bombs;

        this.w = canvas.width;
        this.h = canvas.height;

        this.game = array2d(size, size, () => 0);
        this.revealed = array2d(size, size, () => false);
        this.flag = array2d(size, size, () => false);

        this.squareSize = SQUARE_SIZES.find(x => this.size * x < Math.min(this.w, this.h));

        this.fieldSize = this.squareSize * size;
        this.fieldX = (this.w - this.fieldSize) / 2;
        this.fieldY = (this.h - this.fieldSize) / 2;

        this.cursorX = 0;
        this.cursorY = 0;

        this.spread = false;
        this.dead = false;

        this.music = new Audio();
        this.music.src = "Music/bigDub.flac";
        this.music.volume = Settings.settings.volume;

        this.start = Date.now();

        this.correctFlags = 1;
    }

    spreadBombs(ix, iy) {
        for (let i = 0; i < this.bombs; i++) {
            let bx, by;

            do {
                by = Math.ceil(Math.random() * this.size) - 1;
                bx = Math.ceil(Math.random() * this.size) - 1;
            } while (!banSquare(ix, iy, bx, by) || this.game[bx][by] == BOMB);

            this.game[bx][by] = BOMB;
            for (let x = bx - 1; x <= bx + 1; x++)
                for (let y = by - 1; y <= by + 1; y++) {
                    if (typeof this.game[x]?.[y] == 'number' && this.game[x][y] != BOMB) {
                        this.game[x][y]++;
                    }
                }
        }
    }

    flagTile() {
        if (this.dead) return false;
        if (this.flag[this.cursorX][this.cursorY] && this.game[this.cursorX][this.cursorY]) this.correctFlags--;
        if (!this.revealed[this.cursorX][this.cursorY]) {
            if (this.game[this.cursorX][this.cursorY] == BOMB)
                this.correctFlags++;
            this.flag[this.cursorX][this.cursorY] = !this.flag[this.cursorX][this.cursorY];
            this.draw();
        }
        return true;
    }

    checkWin() {
        let count = 0
        for (let x = 0; x < this.size; x++)
            for (let y = 0; y < this.size; y++)
                if (!this.revealed[x][y]) count++;

        return count == this.bombs;
    }

    revealTile() {
        if (this.dead) return false;
        if (!this.spread) {
            this.spreadBombs(this.cursorX, this.cursorY);
            this.spread = true;
        }

        if (!this.flag[this.cursorX][this.cursorY]) {
            // this.revealed[this.cursorX][this.cursorY] = true;
            this.fillFrom(this.cursorX, this.cursorY);

            if (this.game[this.cursorX][this.cursorY] == BOMB) {
                this.ctx.fillStyle = "#f008";
                this.ctx.fillRect(0, 0, this.w, this.h);
                this.dead = true;
                this.drawFinish(false);
                return false;
            }

            this.draw();

            if (this.checkWin()) {
                this.ctx.fillStyle = "#0808";
                this.ctx.fillRect(0, 0, this.w, this.h);
                this.dead = true;
                this.drawFinish(true);
                return false;
            }
        }
        return true;
    }

    fillFrom(bx, by) {
        if (this.revealed[bx][by] == false) {
            this.revealed[bx][by] = true;
            if (this.game[bx][by] == 0)
                for (let x = bx - 1; x <= bx + 1; x++)
                    for (let y = by - 1; y <= by + 1; y++) {
                        if (typeof this.game[x]?.[y] == 'number' && this.game[x][y] != BOMB) {
                            this.fillFrom(x, y)
                        }
                    }
        }
    }

    move(dir) {
        if (this.dead) return false;
        switch (dir) {
            case 0:
                if (this.cursorY > 0) this.cursorY--;
                break;
            case 1:
                if (this.cursorX < this.size - 1) this.cursorX++;
                break;
            case 2:
                if (this.cursorY < this.size - 1) this.cursorY++;
                break;
            case 3:
                if (this.cursorX > 0) this.cursorX--;
                break;
        }
        this.draw();
        return true;
    }

    testReveal(n) {
        for (let i = n; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                this.revealed[i][j] = true;

    }

    draw() {
        this.music.play();
        this.ctx.clearRect(0, 0, this.w, this.h);

        this.ctx.fillStyle = "#888888";
        this.ctx.fillRect(this.fieldX, this.fieldY, this.fieldSize, this.fieldSize);

        /**
         * @type {CanvasRenderingContext2D}
         */
        const ctx = this.ctx;
        this.ctx.font = `${this.squareSize / 2}px sans-serif`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        for (let x = 0; x < this.size; x++)
            for (let y = 0; y < this.size; y++) {
                const sX = x * this.squareSize + this.fieldX,
                    sY = y * this.squareSize + this.fieldY,
                    mX = sX + this.squareSize / 2,
                    mY = sY + this.squareSize / 2;

                if (this.revealed[x][y]) {
                    this.ctx.fillStyle = '#999';
                    this.ctx.fillRect(sX + 2, sY + 2, this.squareSize - 4, this.squareSize - 4);
                    const v = this.game[x][y];
                    switch (v) {
                        case 0:
                            break;
                        case BOMB:
                            this.ctx.fillStyle = 'red';
                            this.ctx.beginPath()
                            this.ctx.arc(mX, mY, this.squareSize / 4, 0, PI2);
                            this.ctx.fill();
                            break;
                        default:
                            this.ctx.fillStyle = COLORS[v];
                            this.ctx.fillText(v, mX, mY);
                    }
                } else {
                    this.ctx.fillStyle = '#CCC';
                    this.ctx.fillRect(
                        sX + 2,
                        sY + 2,
                        this.squareSize - 4,
                        this.squareSize - 4,
                    );

                    if (this.flag[x][y]) {
                        this.ctx.fillStyle = "#0F0";
                        this.ctx.beginPath()
                        this.ctx.arc(mX, mY, this.squareSize / 4, 0, PI2);
                        this.ctx.fill();
                    }
                }
            }

        this.ctx.strokeStyle = 'blue';
        ctx.lineWidth = 4;
        ctx.strokeRect(
            this.cursorX * this.squareSize + this.fieldX,
            this.cursorY * this.squareSize + this.fieldY,
            this.squareSize,
            this.squareSize
        );
    }

    drawFinish(win) {
        this.music.pause();
        const time = (Date.now() - this.start) / 1000;
        const cas = `Cas: ${time.toFixed(0)}s`;
        const nacin = `Nacin: ${this.size}x${this.size}, ${this.bombs} bomb`;
        let score = Math.floor((this.correctFlags * this.bombs) / time * 100);
        if (!win) score /= 10;
        const points = `Dosegel si: ${score} tock`;

        HighScores.add(this.size, Math.round(time), score);

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = `72px sans-serif`;
        this.ctx.strokeText(win ? 'Nasel si One Piece!' : 'Nisi nasu one piece', this.w / 2, this.h / 2 - 100);
        this.ctx.fillText(win ? 'Nasel si One Piece!' : 'Nisi nasu one piece', this.w / 2, this.h / 2 - 100);


        this.ctx.font = `36px sans-serif`;
        this.ctx.strokeText('Pritisni preslednico da gres nazaj na meni', this.w / 2, this.h / 2);
        this.ctx.fillText('Pritisni preslednico da gres nazaj na meni', this.w / 2, this.h / 2);

        this.ctx.strokeText(cas, this.w / 2, this.h / 2 + 50);
        this.ctx.fillText(cas, this.w / 2, this.h / 2 + 50);

        this.ctx.strokeText(nacin, this.w / 2, this.h / 2 + 100);
        this.ctx.fillText(nacin, this.w / 2, this.h / 2 + 100);

        this.ctx.strokeText(points, this.w / 2, this.h / 2 + 150);
        this.ctx.fillText(points, this.w / 2, this.h / 2 + 150);
    }

}