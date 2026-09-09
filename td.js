const TD = {
    width: 10, height: 7, towers: [], enemies: [], towerCost: { wood: 50, stone: 10 },
    path: [{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:2,y:2},{x:2,y:3},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:5,y:2},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:8,y:1},{x:8,y:2},{x:8,y:3},{x:8,y:4},{x:8,y:5},{x:9,y:5}],
    init() {
        let b = document.getElementById("td-board"); if(!b) return; b.innerHTML = "";
        for(let y=0; y<this.height; y++) {
            for(let x=0; x<this.width; x++) {
                let p = this.path.some(pt => pt.x===x && pt.y===y);
                let c = document.createElement("div"); c.className = "td-cell" + (p ? " td-path" : ""); c.id = `td-cell-${x}-${y}`;
                if(!p) c.onclick = () => this.buildTower(x, y);
                b.appendChild(c);
            }
        }
        this.towers.forEach(t => { let c=document.getElementById(`td-cell-${t.x}-${t.y}`); if(c) c.innerHTML='<div class="td-tower"></div>'; });
    },
    buildTower(x, y) {
        if(this.towers.some(t => t.x===x && t.y===y)) return;
        if(ResourceDB.wood.amount >= this.towerCost.wood && ResourceDB.stone.amount >= this.towerCost.stone) {
            ResourceDB.wood.amount -= this.towerCost.wood; ResourceDB.stone.amount -= this.towerCost.stone;
            this.towers.push({x:x, y:y, damage:10, range:2});
            let c=document.getElementById(`td-cell-${x}-${y}`); if(c) c.innerHTML='<div class="td-tower"></div>'; UI.updateScreen();
        }
    },
    tick() {
        for(let i=this.enemies.length-1; i>=0; i--) { this.enemies[i].pathIndex++; if(this.enemies[i].pathIndex >= this.path.length) this.enemies.splice(i,1); }
        if(Math.random() < 0.3) this.enemies.push({pathIndex:0, hp:50, maxHp:50});
        for(let t of this.towers) {
            for(let e of this.enemies) {
                let p = this.path[e.pathIndex]; if(Math.abs(t.x-p.x) + Math.abs(t.y-p.y) <= t.range) { e.hp -= t.damage; break; }
            }
        }
        for(let i=this.enemies.length-1; i>=0; i--) { if(this.enemies[i].hp <= 0) { this.enemies.splice(i,1); ResourceDB.food.amount+=15; } }
        this.path.forEach(p => { let c = document.getElementById(`td-cell-${p.x}-${p.y}`); if(c) c.innerHTML = ""; });
        this.enemies.forEach(e => { let p = this.path[e.pathIndex]; let c = document.getElementById(`td-cell-${p.x}-${p.y}`); if(c) c.innerHTML = `<div class="td-enemy"><div class="td-hp-bar"><div class="td-hp-fill" style="width:${(e.hp/e.maxHp)*100}%"></div></div></div>`; });
    }
};