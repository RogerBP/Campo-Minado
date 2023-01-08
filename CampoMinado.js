class CampoMinado {
    constructor() {
        this.gameStatus = {
            PLAYING: color(255, 200, 0),
            VICTORY: color(0, 200, 0),
            LOST: color(200, 0, 0),
        }
        this.margin = 10;
        this.limit = width - 100;
        this.createStartButton();
        this.createSliderLevel();
        this.startGame();
    }
    createSliderLevel() {
        this.sliderLevel = createSlider(1, 3, 1);
        this.sliderLevel.size(90);
    }
    createStartButton() {
        this.startButton = createButton('Start');
        this.startButton.size(100, 50);
        this.startButton.mousePressed(() => {
            this.startGame();
        });
    }
    drawBoard() {
        background(0);
        noFill();
        strokeWeight(this.margin);
        stroke(255, 0, 0);
        let w = Math.min(this.limit, height);
        this.cellSize = (w - this.margin * 2) / this.size;
        let x = this.margin / 2;
        let y = this.margin / 2;
        let s = this.cellSize * this.size + this.margin;
        rect(x, y, s);
        this.xBorder = x + s + this.margin / 2;
        this.startButton.position(this.xBorder, 0);
        this.sliderLevel.position(this.xBorder + 4, this.startButton.position().y + this.startButton.size().height + 10);
    }
    startGame() {
        this.status = this.gameStatus.PLAYING;
        this.size = 10 * this.sliderLevel.value();
        this.bombs = this.size * this.sliderLevel.value();
        this.cells = [];
        this.createCells();
        this.loadBombs();
        this.loadNears();
    }
    loadBombs() {
        let b = 0;
        while (b < this.bombs) {
            let x = Math.trunc(random(this.size));
            let y = Math.trunc(random(this.size));
            let c = this.cells[y][x];
            if (!c.bomb) {
                b++;
                c.bomb = 1;
            }
        }
    }
    createCells() {
        for (let y = 0; y < this.size; y++) {
            let line = [];
            this.cells.push(line);
            for (let x = 0; x < this.size; x++) {
                line.push({
                    x,
                    y,
                    open: false,
                    bomb: 0
                });
            }
        }
    }
    loadNears() {
        this.cells.forEach((line) => {
            line.forEach((cell) => {
                cell.nears = [];
                cell.bombs = 0;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx != 0 || dy != 0) {
                            let x = cell.x + dx;
                            let y = cell.y + dy;
                            if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
                                let c = this.cells[y][x];
                                cell.nears.push(c);
                                cell.bombs += c.bomb;
                            }
                        }
                    }
                }
            });
        });
    }
    update() {
        if (this.status != this.gameStatus.PLAYING) return;
        let total = this.size * this.size;;
        let good = total - this.bombs;
        let open = 0;
        this.cells.forEach(line => {
            line.forEach(cell => {
                if (cell.open) {
                    open++;
                    if (cell.bomb) this.status = this.gameStatus.LOST;
                }
            })
        })
        if (this.status == this.gameStatus.LOST) return;
        if (good == open) {
            this.status = this.gameStatus.VICTORY;
            this.openBombs();
        }
    }
    render() {
        this.drawBoard();
        this.cells.forEach((line) => {
            line.forEach((cell) => {
                this.drawCell(cell);
            });
        });
        this.drawState();
    }
    drawState() {
        let x = this.xBorder + 50;
        let y = this.sliderLevel.position().y + this.sliderLevel.size().height + 40;
        noStroke();
        fill(this.status);
        circle(x, y, 30);
    }
    paintCell(cell, color) {
        let s = this.cellSize;
        let x = cell.x * s + this.margin;
        let y = cell.y * s + this.margin;
        strokeWeight(2);
        stroke('#C6C6C6');
        fill('#808080 ');
        rect(x, y, s);
    }
    paindCellOpen(cell) {
        let s = this.cellSize;
        let x = cell.x * s + this.margin;
        let y = cell.y * s + this.margin;
        s -= 2;
        x++;
        y++;
        fill(150);
        noStroke();
        rect(x, y, s);
        this.paintBombs(cell);
    }
    paintBombs(cell) {
        if (cell.bombs <= 0 || cell.bomb) return;
        let s = this.cellSize;
        let x = cell.x * s + this.margin;
        let y = cell.y * s + this.margin;
        textSize(s);
        let w = textWidth(cell.bombs);
        let m = (s - w) / 2;
        x += m;
        m = (textLeading() - textSize()) / 2;
        y += s - m - 1;
        strokeWeight(2);
        fill('blue');
        stroke('blue');
        text(cell.bombs, x, y);
    }
    paintBomb(cell) {
        let s = this.cellSize;
        let x = cell.x * s + this.margin;
        let y = cell.y * s + this.margin;
        s -= 2;
        x++;
        y++;
        strokeWeight(2);
        fill(255, 0, 0);
        stroke(0);
        circle(x + s / 2, y + s / 2, s / 2);
    }
    drawCell(cell) {
        if (cell.open) {
            this.paindCellOpen(cell);
            if (cell.bomb) this.paintBomb(cell);
        } else {
            this.paintCell(cell);
        }
    }
    click(m) {
        if (this.status != this.gameStatus.PLAYING) return;
        if (m.x < this.margin || m.x > this.limit) return;
        if (m.y < this.margin) return;
        let x = Math.trunc((m.x - this.margin) / this.cellSize);
        let y = Math.trunc((m.y - this.margin) / this.cellSize);
        if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
        let c = this.cells[y][x];
        this.openCell(c, true);
    }
    openCell(cell, explode) {
        if (cell.open) return;
        if (cell.bomb && !explode) return;
        cell.open = true;
        if (cell.bomb) {
            this.openBombs();
            return;
        }
        if (cell.bombs == 0) {
            cell.nears.forEach(nc => {
                this.openCell(nc, false);
            })
        }
    }
    openBombs() {
        this.cells.forEach(line => {
            line.forEach(cell => {
                if (!cell.open && cell.bomb) this.openCell(cell, true);
            })
        })
    };
}