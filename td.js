const TD = {
    width: 10, height: 7, towers: [], enemies: [],
    wave: 1, enemiesKilled: 0,
    selectedType: 'archer',

    path: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 9, y: 5 }],

    // Base de données des tours
    towerTypes: {
        archer: { cost: { wood: 50, stone: 10 }, damage: 10, range: 2, css: "td-tower-archer" },
        canon: { cost: { wood: 150, stone: 50 }, damage: 40, range: 1, css: "td-tower-canon" },
        baliste: { cost: { wood: 400, stone: 150 }, damage: 100, range: 4, css: "td-tower-baliste" }
    },

    init() {
        let b = document.getElementById("td-board"); if (!b) return; b.innerHTML = "";

        // Dessin de la grille
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let p = this.path.some(pt => pt.x === x && pt.y === y);
                let c = document.createElement("div");
                c.className = "td-cell" + (p ? " td-path" : ""); c.id = `td-cell-${x}-${y}`;
                if (!p) c.onclick = () => this.buildTower(x, y);
                b.appendChild(c);
            }
        }

        // Affichage de la vague actuelle
        let wUI = document.getElementById("td-wave"); if (wUI) wUI.innerText = this.wave;

        // Rendu des tours sauvegardées (avec compatibilité pour les vieilles sauvegardes)
        this.towers.forEach(t => {
            if (!t.type) t.type = 'archer';
            let def = this.towerTypes[t.type];
            let c = document.getElementById(`td-cell-${t.x}-${t.y}`);
            if (c) c.innerHTML = `<div class="td-tower ${def.css}"></div>`;
        });
    },

    // Changer le type de tour à construire
    selectTower(type) {
        this.selectedType = type;
        document.querySelectorAll(".td-select-btn").forEach(b => b.classList.remove("active"));
        document.getElementById("btn-sel-" + type).classList.add("active");
    },

    buildTower(x, y) {
        if (this.towers.some(t => t.x === x && t.y === y)) return;

        let def = this.towerTypes[this.selectedType];
        if (ResourceDB.wood.amount >= def.cost.wood && ResourceDB.stone.amount >= def.cost.stone) {
            ResourceDB.wood.amount -= def.cost.wood;
            ResourceDB.stone.amount -= def.cost.stone;

            this.towers.push({ x: x, y: y, type: this.selectedType, damage: def.damage, range: def.range });

            let c = document.getElementById(`td-cell-${x}-${y}`);
            if (c) c.innerHTML = `<div class="td-tower ${def.css}"></div>`;
            UI.updateScreen();
        }
    },

    tick() {
        // Avancée des ennemis
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].pathIndex++;
            if (this.enemies[i].pathIndex >= this.path.length) this.enemies.splice(i, 1);
        }

        // Apparition (Les PV augmentent de 20% par vague)
        if (Math.random() < 0.3) {
            let maxHp = Math.floor(50 * Math.pow(1.2, this.wave - 1));
            this.enemies.push({ pathIndex: 0, hp: maxHp, maxHp: maxHp });
        }

        // Dégâts des tours
        for (let t of this.towers) {
            for (let e of this.enemies) {
                let p = this.path[e.pathIndex];
                if (Math.abs(t.x - p.x) + Math.abs(t.y - p.y) <= t.range) {
                    e.hp -= t.damage; break;
                }
            }
        }

        // Mort et butin (Le butin augmente de 10% par vague)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].hp <= 0) {
                this.enemies.splice(i, 1);
                ResourceDB.food.amount += Math.floor(15 * Math.pow(1.1, this.wave - 1));

                this.enemiesKilled++;
                // Passer à la vague suivante tous les 10 kills
                if (this.enemiesKilled >= 10) {
                    this.enemiesKilled = 0;
                    this.wave++;
                    let wUI = document.getElementById("td-wave"); if (wUI) wUI.innerText = this.wave;
                }
            }
        }

        // Rendu visuel
        this.path.forEach(p => { let c = document.getElementById(`td-cell-${p.x}-${p.y}`); if (c) c.innerHTML = ""; });
        this.enemies.forEach(e => {
            let p = this.path[e.pathIndex]; let c = document.getElementById(`td-cell-${p.x}-${p.y}`);
            if (c) c.innerHTML = `<div class="td-enemy"><div class="td-hp-bar"><div class="td-hp-fill" style="width:${Math.max(0, (e.hp / e.maxHp) * 100)}%"></div></div></div>`;
        });
    }
};