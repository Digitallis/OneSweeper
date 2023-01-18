import { Game } from "./game.js";
import { Menu } from "./menu.js";
import { Settings } from "./localStorage.js";

Settings.read();

let c = document.getElementById("canvas");
let w = c.width = document.body.scrollWidth;
let h = c.height = document.body.scrollHeight;
let ctx = c.getContext("2d");

let mode = 'menu';


let game = null;
let menu = null;


function createMenu() {
    menu = new Menu(c, ctx, (diff) => {
        switch (diff) {
            case 0:
                game = new Game(c, ctx, 16, 3);
                break;
            case 1:
                game = new Game(c, ctx, 9, 12);
                break;
            case 2:
                game = new Game(c, ctx, 16, 42);
                break;
            case 3:
                game = new Game(c, ctx, 32, 62);
                break;
        }
        game.draw();
        mode = 'game';
    });
}

createMenu();
menu.draw();

document.addEventListener('keydown', (e) => {
    if (mode == 'game')
        switch (e.key) {
            case 'w':
            case 'ArrowUp':
                return game.move(0);
            case 'd':
            case 'ArrowRight':
                return game.move(1);
            case 's':
            case 'ArrowDown':
                return game.move(2);
            case 'a':
            case 'ArrowLeft':
                return game.move(3);
            case 'f':
                return game.flagTile();
            case ' ':
                if (!game.dead) {
                    return game.revealTile();
                } else {
                    createMenu();
                    menu.draw();
                    mode = 'menu';
                }
        }
    else {

    }
});

c.addEventListener('click', (e) => {
    if (mode == 'menu')
        menu.click(e.offsetX, e.offsetY);
});
c.addEventListener('mousemove', (e) => {
    if (mode == 'menu')
        menu.hover(e.offsetX, e.offsetY, !!(e.buttons & 1));
});

