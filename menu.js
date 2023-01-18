import { HighScores, Settings } from "./localStorage.js";

export class Menu {
    elements = {
        main: {
            title: 'One piece sweeper',
            items: [
                { type: 'b', text: 'Play', w: 200, h: 48, action() { this.activateScreen('play') } },
                { type: 'b', text: 'Highscores', w: 200, h: 48, action() { this.createScores() } },
                { type: 'b', text: 'Settings', w: 200, h: 48, action() { this.activateScreen('settings') } }
            ]
        },
        play: {
            title: 'Level select',
            items: [
                { type: 'b', text: 'super ez', w: 200, h: 48, action() { this.play(0) } },
                { type: 'b', text: 'Ez', w: 200, h: 48, action() { this.play(1) } },
                { type: 'b', text: 'Mid', w: 200, h: 48, action() { this.play(2) } },
                { type: 'b', text: 'One Piece', w: 200, h: 48, action() { this.play(3) } },
                { type: 'b', text: 'Back', w: 200, h: 48, action() { this.activateScreen('main') } },
            ]
        },
        settings: {
            title: 'Zettings',
            items: [
                {
                    type: 'r', text: 'Zolume', w: 400, h: 48,
                    value() {
                        console.log({ value: Settings.settings })
                        return Settings.settings.volume;
                    }, action(v) {
                        console.log({ volume: v })
                        Settings.settings.volume = v;
                    }
                },
                {
                    type: 'b', text: 'Reset localZtorage', w: 400, h: 48, action() {
                        HighScores.reset();
                        Settings.reset();
                        window.location.reload();
                    }
                },
                {
                    type: 'b', text: 'Back', w: 400, h: 48, action() {
                        Settings.save();
                        this.activateScreen('main')
                    }
                },
            ]
        }
    };


    constructor(canvas, ctx, play) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.w = canvas.width;
        this.h = canvas.height;
        this.mx = 0;
        this.my = 0;
        this.items = [];
        this.play = play;
        this.activateScreen('main');
    }

    activateScreen(name) {
        this.items = [];
        let y = Math.round(this.h / 3);
        this.items.push({ type: 't', x: this.w / 2, y, text: this.elements[name].title });
        y += 100;
        this.elements[name].items.forEach((el) => {
            let { type, text, w, h } = el;
            let action = el.action ?? (() => { });
            this.items.push({ type, x: (this.w - w) / 2, y, w, h, text, action, value: el.value });
            y += el.h + 10;
        });
        this.draw();
    }

    createScores() {
        this.items = []
        let y = Math.round(this.h / 3);

        this.items.push({ type: 't', x: this.w / 2, y, text: 'Najjaci 💪' });
        y += 100;
        const hs = HighScores.top(5);

        for (let i = 0; i < 5; i++) {

            const text = !hs[i] ? `${i + 1}. -` :
                `${hs[i].size}x${hs[i].size} - ${hs[i].time}  - ${hs[i].score}`;

            this.items.push({ type: 's', x: this.w / 2, y, text });
            y += 50;
        }
        y += 50;
        this.items.push({ type: 'b', x: (this.w - 200) / 2, y, w: 200, h: 48, text: 'back', action: () => this.activateScreen('main') });

        this.draw();
    }

    hover(x, y, hold) {
        this.mx = x;
        this.my = y;

        if (hold) {
            this.rangeMouse(x, y);
        }

        this.draw();
    }

    hittest(x, y, w, h) {
        const ox = this.mx - x, oy = this.my - y;
        return !(ox < 0 || oy < 0 || ox > w || oy > h);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.items.forEach(item => {
            this.ctx.font = `36px sans-serif`;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            switch (item.type) {
                case 'b':
                    const hb = [item.x, item.y, item.w, item.h];
                    this.ctx.font = `36px sans-serif`;
                    this.ctx.fillStyle = this.hittest(item.x, item.y, item.w, item.h) ? '#f44' : '#f88';
                    this.ctx.fillRect(...hb);
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillText(item.text, item.x + item.w / 2, item.y + item.h / 2);
                    break;
                case 't':
                    this.ctx.font = `72px sans-serif`;
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillText(item.text, item.x, item.y);
                    break;
                case 's':
                    this.ctx.font = `36px sans-serif`;
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillText(item.text, item.x, item.y);
                    break;
                case 'r':
                    const rhb = [item.x, item.y, item.w, item.h];
                    this.ctx.font = `36px sans-serif`;
                    this.ctx.fillStyle = this.hittest(item.x, item.y, item.w, item.h) ? '#4f4' : '#8f8';
                    this.ctx.strokeRect(...rhb);
                    rhb[2] *= item.value?.() ?? 1;
                    this.ctx.fillRect(...rhb);
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillText(item.text, item.x + item.w / 2, item.y + item.h / 2);
                    break;
            }

        });
    }


    click(x, y) {
        this.rangeMouse(x, y);
        const btn =
            this.items
                .filter(x => x.type == 'b')
                .find(({ x, y, w, h }) => this.hittest(x, y, w, h));

        btn?.action?.bind(this)?.(x - btn.x, y - btn.y);
    }

    rangeMouse(x, y) {
        const sld =
            this.items
                .filter(x => x.type == 'r')
                .find(({ x, y, w, h }) => this.hittest(x, y, w, h));

        sld?.action?.bind(this)?.(Math.round(((x - sld.x) / sld.w) * 20) / 20);
        if (sld) {
            this.draw();
        }
    }
}