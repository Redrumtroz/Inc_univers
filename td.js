// td.js - Moteur du Tower Defense
const TD = {
    width: 10,
    height: 7,
    path: [
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
        { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 },
        { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 },
        { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 9, y: 5 }
    ],
    towers: [],
    enemies: [],
    towerCost: { wood: 50, stone: 10 },

    init() {
        this.drawBoard();
    },

    drawBoard() {
        const board = document.getElementById("td-board");
        if (!board) return;
        board.innerHTML = "";

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let isPath = this.path.some(p => p.x === x && p.y === y);
                let cell = document.createElement("div");
                cell.className = "td-cell" + (isPath ? " td-path" : "");
                cell.id = `td-cell-${x}-${y}`;

                if (!isPath) {
                    cell.onclick = () => this.buildTower(x, y);
                }
                board.appendChild(cell);
            }
        }

        // Affiche les tours déjà sauvegardées
        this.towers.forEach(t => {
            let cell = document.getElementById(`td-cell-${t.x}-${t.y}`);
            if (cell) cell.innerHTML = '<div class="td-tower"></div>';
        });
    },

    buildTower(x, y) {
        if (this.towers.some(t => t.x === x && t.y === y)) return;

        if (ResourceDB.wood.amount >= this.towerCost.wood && ResourceDB.stone.amount >= this.towerCost.stone) {
            ResourceDB.wood.amount -= this.towerCost.wood;
            ResourceDB.stone.amount -= this.towerCost.stone;

            this.towers.push({ x: x, y: y, damage: 10, range: 2 });
            document.getElementById(`td-cell-${x}-${y}`).innerHTML = '<div class="td-tower"></div>';
            UI.updateScreen();
        }
    },

    tick() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.pathIndex++;
            if (e.pathIndex >= this.path.length) this.enemies.splice(i, 1);
        }

        if (Math.random() < 0.30) {
            this.enemies.push({ pathIndex: 0, hp: 50, maxHp: 50 });
        }

        for (let t of this.towers) {
            for (let e of this.enemies) {
                let p = this.path[e.pathIndex];
                let dist = Math.abs(t.x - p.x) + Math.abs(t.y - p.y);

                if (dist <= t.range) {
                    e.hp -= t.damage;
                    break;
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].hp <= 0) {
                this.enemies.splice(i, 1);
                ResourceDB.food.amount += 15;
                ResourceDB.wood.amount += 5;
            }
        }

        this.renderEntities();
    },

    renderEntities() {
        this.path.forEach(p => {
            let cell = document.getElementById(`td-cell-${p.x}-${p.y}`);
            if (cell) cell.innerHTML = "";
        });

        this.enemies.forEach(e => {
            let p = this.path[e.pathIndex];
            let cell = document.getElementById(`td-cell-${p.x}-${p.y}`);
            if (cell) {
                let hpPercent = (e.hp / e.maxHp) * 100;
                cell.innerHTML = `
                    <div class="td-enemy">
                        <div class="td-hp-bar"><div class="td-hp-fill" style="width:${hpPercent}%"></div></div>
                    </div>`;
            }
        });
    }
};