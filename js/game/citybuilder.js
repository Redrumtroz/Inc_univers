const CityBuilder = {
    canvas: null, ctx: null, container: null,
    cam: { x: 0, y: 0, zoom: 1 },
    isDragging: false, lastMouse: { x: 0, y: 0 }, mouseWorld: { x: 0, y: 0 },
    selectedTool: 'house', canBuild: true, hoveredEntity: null, ghostHappiness: 0,

    globalConnections: [], closePairs: [], urbanProps: [],

    ASSETS: { windmillTower: new Image(), windmillBlades: new Image() },

    // COULEURS ORIGINALES RESTAUREES
    PALETTE: {
        grass: '#cdd9c2', path: '#e3d4b6', plazaBase: '#b8c2bc', roadUrban: '#969e9a',
        wallLight: '#f4f1ea', wallDark: '#e0dbd1', roofLight: '#b48a78', roofDark: '#997161',
        woodLight: '#8a6b4e', woodDark: '#6a5035', stoneLight: '#c2c4c4', stoneDark: '#a1a3a4', tree: '#6ea06a'
    },

    AFFINITIES: {
        house: { house: 0, tavern: 1, tower: -2, market: 1, windmill: 0, tree: 1 },
        tavern: { house: 1, tavern: -1, tower: -1, market: 0, windmill: 0, tree: 0 },
        tower: { house: -1, tavern: -1, tower: 1, market: 0, windmill: -1, tree: -1 },
        market: { house: 1, tavern: 0, tower: 0, market: -2, windmill: 1, tree: 0 },
        windmill: { house: 1, tavern: 0, tower: -1, market: 1, windmill: -2, tree: 0 },
        tree: { house: 1, tavern: 0, tower: -1, market: 0, windmill: 0, tree: 1 }
    },

    init() {
        this.ASSETS.windmillTower.src = 'https://raw.githubusercontent.com/Redrumtroz/Inc_univers/main/Images/Moulin_Tour.png';
        this.ASSETS.windmillBlades.src = 'https://raw.githubusercontent.com/Redrumtroz/Inc_univers/main/Images/Moulin_Palles.png';

        this.container = document.getElementById('tab-1'); // Le parent direct
        this.canvas = document.getElementById('worldCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        // Attribution propre des évènements au canvas
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', () => this.onMouseUp());

        this.initUI();
        if (CityData.entities.length === 0) this.generateStartingCity();
        this.recalculateNetwork();
        this.updateStats();

        requestAnimationFrame((t) => this.loop(t));
    },

    initUI() {
        let tb = document.getElementById('ui-panel');
        if (!tb) return;
        tb.innerHTML = "";

        for (let k in BuildingDB) {
            if (!BuildingDB[k].unlocked) continue;
            let cst = ""; for (let r in BuildingDB[k].cost) { cst += BuildingDB[k].cost[r] + " " + ResourceDB[r].name.substring(0, 3) + " "; }
            tb.innerHTML += `<button class="build-btn ${this.selectedTool === k ? 'selected' : ''}" id="cb-btn-${k}" onclick="CityBuilder.selectTool('${k}')">
                <canvas class="btn-icon" id="cb-icon-${k}" width="45" height="45"></canvas>
                <span class="btn-label">${BuildingDB[k].name}</span>
                <span class="btn-cost">${cst}</span>
            </button>`;
        }

        tb.innerHTML += `<button class="build-btn ${this.selectedTool === 'tree' ? 'selected' : ''}" onclick="CityBuilder.selectTool('tree')">
            <canvas class="btn-icon" id="cb-icon-tree" width="45" height="45"></canvas>
            <span class="btn-label">Arbre</span><span class="btn-cost">Gratuit</span>
        </button>`;

        tb.innerHTML += `<button class="build-btn ${this.selectedTool === 'remove' ? 'selected' : ''}" style="border-color:#fca5a5; background:#fef2f2;" onclick="CityBuilder.selectTool('remove')">
            <div style="font-size:20px; margin-bottom: 2px;">🗑️</div>
            <span class="btn-label" style="color:#dc2626;">Détruire</span>
        </button>`;

        setTimeout(() => this.generateUIcons(), 100);
    },

    selectTool(type) {
        this.selectedTool = type;
        document.querySelectorAll('.build-btn').forEach(b => b.classList.remove('selected'));
        let btn = document.getElementById(`cb-btn-${type}`);
        if (btn) btn.classList.add('selected');
        if (type === 'tree' || type === 'remove') event.currentTarget.classList.add('selected');
    },

    screenToWorld(sx, sy) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (sx - rect.left - this.canvas.width / 2) / this.cam.zoom + this.cam.x,
            y: (sy - rect.top - this.canvas.height / 2) / this.cam.zoom + this.cam.y
        };
    },

    onMouseDown(e) {
        if (e.target !== this.canvas) return; // Sécurité clics UI

        if (e.button === 2 || e.shiftKey) {
            this.isDragging = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
        } else if (e.button === 0) {
            let w = this.screenToWorld(e.clientX, e.clientY);
            if (this.selectedTool === 'remove') {
                this.removeEntityAt(w.x, w.y);
            } else if (this.canBuild) {
                if (this.selectedTool !== 'tree') {
                    let bld = BuildingDB[this.selectedTool];
                    if (!bld) return;
                    let afford = true;
                    for (let r in bld.cost) { if (ResourceDB[r].amount < bld.cost[r]) afford = false; }
                    if (!afford) return;
                    for (let r in bld.cost) { ResourceDB[r].amount -= bld.cost[r]; }
                    UI.updateScreen();
                }
                this.addEntity(w.x, w.y, this.selectedTool);
            }
        }
    },

    onMouseMove(e) {
        if (this.isDragging) {
            this.cam.x -= (e.clientX - this.lastMouse.x) / this.cam.zoom;
            this.cam.y -= (e.clientY - this.lastMouse.y) / this.cam.zoom;
            this.lastMouse = { x: e.clientX, y: e.clientY };
        }
        this.mouseWorld = this.screenToWorld(e.clientX, e.clientY);
        this.hoveredEntity = null;
        this.canBuild = true;
        let minDist = 40;
        this.ghostHappiness = 0;

        for (let i = 0; i < CityData.entities.length; i++) {
            let ent = CityData.entities[i];
            let d = Math.hypot(ent.x - this.mouseWorld.x, ent.y - this.mouseWorld.y);
            if (d < minDist) { minDist = d; this.hoveredEntity = ent; }
            if (d < 45 && this.selectedTool !== 'remove') { this.canBuild = false; }
            if (d < 180 && this.selectedTool !== 'remove' && this.AFFINITIES[this.selectedTool]) {
                this.ghostHappiness += (this.AFFINITIES[this.selectedTool][ent.type] || 0);
            }
        }
    },

    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'crosshair';
    },

    addEntity(x, y, type) {
        let flip = Math.random() > 0.5;
        if (type === 'market' || type === 'tree' || type === 'windmill') flip = false;
        let props = [];
        if (type !== 'tree') {
            for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
                let a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 15;
                props.push({ type: ['barrel', 'flowerpot', 'bush'][Math.floor(Math.random() * 3)], dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.6 });
            }
        }
        CityData.entities.push({
            id: Math.random().toString(36).substr(2, 9),
            x: x, y: y, type: type, flip: flip, inNeighborhood: false,
            details: { hasChimney: Math.random() > 0.4, roofVariant: Math.random() > 0.7 ? '#8b6b5d' : null, leafVariant: Math.random() > 0.7 ? '#7fa16a' : this.PALETTE.tree, props: props }
        });
        this.recalculateNetwork();
        this.updateStats();
    },

    removeEntityAt(x, y) {
        let index = -1, minDist = 50;
        for (let i = 0; i < CityData.entities.length; i++) {
            let d = Math.hypot(CityData.entities[i].x - x, CityData.entities[i].y - y);
            if (d < minDist) { minDist = d; index = i; }
        }
        if (index > -1) {
            CityData.entities.splice(index, 1);
            this.recalculateNetwork();
            this.updateStats();
        }
    },

    distToSegment(p, v, w) {
        let l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
        if (l2 === 0) return { d: Math.hypot(p.x - v.x, p.y - v.y), pt: v, t: 0 };
        let t = Math.max(0, Math.min(1, ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2));
        let proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
        return { d: Math.hypot(p.x - proj.x, p.y - proj.y), pt: proj, t: t };
    },

    recalculateNetwork() {
        this.globalConnections = []; this.closePairs = []; this.urbanProps = [];
        CityData.entities.forEach(e => e.inNeighborhood = false);
        let blds = CityData.entities.filter(e => e.type !== 'tree');

        for (let i = 0; i < blds.length; i++) {
            for (let j = i + 1; j < blds.length; j++) {
                if (Math.hypot(blds[i].x - blds[j].x, blds[i].y - blds[j].y) < 220) {
                    this.closePairs.push({ a: blds[i], b: blds[j] });
                    blds[i].inNeighborhood = true; blds[j].inNeighborhood = true;
                    let midX = (blds[i].x + blds[j].x) / 2, midY = (blds[i].y + blds[j].y) / 2, s = Math.floor(midX + midY);
                    if (s % 3 === 0) this.urbanProps.push({ x: midX + (s % 50 - 25), y: midY + (s % 40 - 20), type: s % 2 === 0 ? 'prop_house' : 'prop_stall', flip: s % 4 === 0 });
                }
            }
        }
        if (blds.length < 2) return;
        let connected = [blds[0]], unconnected = blds.slice(1), edges = [];
        while (unconnected.length > 0) {
            let bD = Infinity, bU = null, bT = null;
            for (let u of unconnected) {
                for (let c of connected) { let d = Math.hypot(u.x - c.x, u.y - c.y); if (d < bD) { bD = d; bU = u; bT = { type: 'node', node: c }; } }
                for (let e of edges) {
                    let p = this.distToSegment(u, e.a, e.b);
                    if (p.t > 0.1 && p.t < 0.9 && p.d < bD) { bD = p.d; bU = u; bT = { type: 'edge', edge: e, pt: p.pt }; }
                }
            }
            if (!bT) break; // Sécurité anti-boucle infinie
            if (bT.type === 'node') edges.push({ a: bU, b: bT.node, d: bD });
            else if (bT.type === 'edge') {
                let o = bT.edge, wp = { x: bT.pt.x, y: bT.pt.y, inNeighborhood: (o.a.inNeighborhood && o.b.inNeighborhood) };
                connected.push(wp); edges = edges.filter(e => e !== o);
                edges.push({ a: o.a, b: wp, d: Math.hypot(o.a.x - wp.x, o.a.y - wp.y) });
                edges.push({ a: wp, b: o.b, d: Math.hypot(wp.x - o.b.x, wp.y - o.b.y) });
                edges.push({ a: bU, b: wp, d: bD });
            }
            connected.push(bU); unconnected = unconnected.filter(u => u !== bU);
        }
        this.globalConnections = edges;
    },

    updateStats() {
        CityData.buildings_count = 0; CityData.population = 0; CityData.happiness = 0;
        CityData.entities.forEach(e => {
            let bld = BuildingDB[e.type];
            if (bld && bld.pop_bonus) { CityData.buildings_count++; CityData.population += bld.pop_bonus; }
            e.happiness = 0;
            CityData.entities.forEach(o => {
                if (e === o) return;
                if (Math.hypot(e.x - o.x, e.y - o.y) < 180 && this.AFFINITIES[e.type]) e.happiness += (this.AFFINITIES[e.type][o.type] || 0);
            });
            CityData.happiness += e.happiness;
        });

        let elPop = document.getElementById('ui-pop'); if (elPop) elPop.innerText = CityData.population;
        let elBld = document.getElementById('ui-bld'); if (elBld) elBld.innerText = CityData.buildings_count;

        for (let k in BuildingDB) {
            let btn = document.getElementById(`cb-btn-${k}`);
            if (btn) {
                let afford = true;
                for (let r in BuildingDB[k].cost) { if (ResourceDB[r].amount < BuildingDB[k].cost[r]) afford = false; }
                if (!afford) btn.classList.add('disabled'); else btn.classList.remove('disabled');
            }
        }
    },

    // --- DRAWING FUNCTIONS ---
    iso(x, y, z = 0) { return { x: (x - y) * 0.866, y: (x + y) * 0.5 - z }; },
    drawIsoPoly(cx, pts, fill) {
        if (pts.length === 0) return;
        cx.beginPath(); let p0 = this.iso(pts[0].x, pts[0].y, pts[0].z); cx.moveTo(p0.x, p0.y);
        for (let i = 1; i < pts.length; i++) { let p = this.iso(pts[i].x, pts[i].y, pts[i].z); cx.lineTo(p.x, p.y); }
        cx.closePath(); if (fill) { cx.fillStyle = fill; cx.fill(); }
    },
    drawSmoke(cx, x, y, z, t) {
        cx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 3; i++) {
            let tm = t + i * 1.5, sz = 3 + Math.sin(tm) * 1.5, dx = Math.cos(tm * 0.7) * 3, dz = (tm % 4) * 5;
            let p = this.iso(x + dx, y, z + dz);
            cx.beginPath(); cx.arc(p.x, p.y, sz, 0, Math.PI * 2); cx.fill();
        }
    },
    drawHouse(cx, t = 0, d = {}) {
        let rD = d.roofVariant || this.PALETTE.roofDark, rL = d.roofVariant ? '#a17967' : this.PALETTE.roofLight;
        this.drawIsoPoly(cx, [{ x: -12, y: 12, z: 0 }, { x: -12, y: -12, z: 0 }, { x: -12, y: -12, z: 20 }, { x: -12, y: 12, z: 20 }], this.PALETTE.wallLight);
        this.drawIsoPoly(cx, [{ x: -12, y: 12, z: 0 }, { x: 12, y: 12, z: 0 }, { x: 12, y: 12, z: 20 }, { x: -12, y: 12, z: 20 }], this.PALETTE.wallDark);
        this.drawIsoPoly(cx, [{ x: -12, y: 12, z: 20 }, { x: -12, y: -12, z: 20 }, { x: -12, y: 0, z: 35 }], this.PALETTE.wallLight);
        this.drawIsoPoly(cx, [{ x: -12, y: 12, z: 20 }, { x: 12, y: 12, z: 20 }, { x: 12, y: 0, z: 35 }, { x: -12, y: 0, z: 35 }], rD);
        this.drawIsoPoly(cx, [{ x: -12, y: -12, z: 20 }, { x: 12, y: -12, z: 20 }, { x: 12, y: 0, z: 35 }, { x: -12, y: 0, z: 35 }], rL);
        if (d.hasChimney) {
            this.drawIsoPoly(cx, [{ x: 4, y: -6, z: 20 }, { x: 8, y: -6, z: 20 }, { x: 8, y: -6, z: 40 }, { x: 4, y: -6, z: 40 }], this.PALETTE.stoneLight);
            this.drawIsoPoly(cx, [{ x: 4, y: -6, z: 20 }, { x: 4, y: -2, z: 20 }, { x: 4, y: -2, z: 40 }, { x: 4, y: -6, z: 40 }], this.PALETTE.stoneDark);
            if (t > 0) this.drawSmoke(cx, 6, -4, 42, t);
        }
    },
    drawTavern(cx, t = 0) {
        this.drawIsoPoly(cx, [{ x: -18, y: 18, z: 0 }, { x: -18, y: -18, z: 0 }, { x: -18, y: -18, z: 15 }, { x: -18, y: 18, z: 15 }], this.PALETTE.woodLight);
        this.drawIsoPoly(cx, [{ x: -18, y: -22, z: 40 }, { x: 18, y: -22, z: 40 }, { x: 18, y: 0, z: 55 }, { x: -18, y: 0, z: 55 }], this.PALETTE.roofLight);
        this.drawIsoPoly(cx, [{ x: 2, y: 20, z: 0 }, { x: 10, y: 20, z: 0 }, { x: 10, y: 20, z: 12 }, { x: 2, y: 20, z: 12 }], this.PALETTE.woodDark);
        this.drawIsoPoly(cx, [{ x: -14, y: -16, z: 15 }, { x: -10, y: -16, z: 15 }, { x: -10, y: -16, z: 45 }, { x: -14, y: -16, z: 45 }], this.PALETTE.stoneLight);
        if (t > 0) this.drawSmoke(cx, -12, -16, 47, t);
    },
    drawTower(cx, t = 0) {
        let b = 12, h = 45, tb = 15, th = h + 15;
        this.drawIsoPoly(cx, [{ x: -b, y: b, z: 0 }, { x: -b, y: -b, z: 0 }, { x: -b, y: -b, z: h }, { x: -b, y: b, z: h }], this.PALETTE.stoneLight);
        this.drawIsoPoly(cx, [{ x: -b, y: b, z: 0 }, { x: b, y: b, z: 0 }, { x: b, y: b, z: h }, { x: -b, y: b, z: h }], this.PALETTE.stoneDark);
        this.drawIsoPoly(cx, [{ x: -tb, y: tb, z: h }, { x: -tb, y: -tb, z: h }, { x: -tb, y: -tb, z: th }, { x: -tb, y: tb, z: th }], this.PALETTE.stoneLight);
        this.drawIsoPoly(cx, [{ x: -tb, y: tb, z: h }, { x: tb, y: tb, z: h }, { x: tb, y: tb, z: th }, { x: -tb, y: tb, z: th }], this.PALETTE.stoneDark);
        for (let i = 0; i < 3; i++) {
            this.drawIsoPoly(cx, [{ x: -tb + i * 12, y: tb, z: th }, { x: -tb + i * 12 + 6, y: tb, z: th }, { x: -tb + i * 12 + 6, y: tb, z: th + 6 }, { x: -tb + i * 12, y: tb, z: th + 6 }], this.PALETTE.stoneDark);
            this.drawIsoPoly(cx, [{ x: -tb, y: -tb + i * 12, z: th }, { x: -tb, y: -tb + i * 12 + 6, z: th }, { x: -tb, y: -tb + i * 12 + 6, z: th + 6 }, { x: -tb, y: -tb + i * 12, z: th + 6 }], this.PALETTE.stoneLight);
        }
        if (t > 0) {
            let wave = Math.sin(t * 3) * 2;
            this.drawIsoPoly(cx, [{ x: 0, y: 0, z: th + 6 }, { x: 0, y: 0, z: th + 20 }], this.PALETTE.woodDark);
            this.drawIsoPoly(cx, [{ x: 0, y: 0, z: th + 18 }, { x: 10, y: wave, z: th + 18 }, { x: 10, y: wave, z: th + 10 }, { x: 0, y: 0, z: th + 10 }], '#ef4444');
        }
    },
    drawMarket(cx, t = 0) {
        let p = 16, h = 20, bob = Math.sin(t * 2) * 1.5;
        this.drawIsoPoly(cx, [{ x: -18, y: 18, z: 0 }, { x: -18, y: -18, z: 0 }, { x: -18, y: -18, z: 2 }, { x: -18, y: 18, z: 2 }], this.PALETTE.woodLight);
        this.drawIsoPoly(cx, [{ x: -18, y: 18, z: 0 }, { x: 18, y: 18, z: 0 }, { x: 18, y: 18, z: 2 }, { x: -18, y: 18, z: 2 }], this.PALETTE.woodDark);
        [[-p, -p], [p, -p], [p, p], [-p, p]].forEach(pt => {
            this.drawIsoPoly(cx, [{ x: pt[0] - 1, y: pt[1] + 1, z: 2 }, { x: pt[0] - 1, y: pt[1] - 1, z: 2 }, { x: pt[0] - 1, y: pt[1] - 1, z: h }, { x: pt[0] - 1, y: pt[1] + 1, z: h }], this.PALETTE.woodLight);
            this.drawIsoPoly(cx, [{ x: pt[0] - 1, y: pt[1] + 1, z: 2 }, { x: pt[0] + 1, y: pt[1] + 1, z: 2 }, { x: pt[0] + 1, y: pt[1] + 1, z: h }, { x: pt[0] - 1, y: pt[1] + 1, z: h }], this.PALETTE.woodDark);
        });
        this.drawIsoPoly(cx, [{ x: -10, y: 10, z: 2 + bob }, { x: 0, y: 10, z: 2 + bob }, { x: 0, y: 10, z: 8 + bob }, { x: -10, y: 10, z: 8 + bob }], '#ef4444');
        this.drawIsoPoly(cx, [{ x: 2, y: 0, z: 2 + bob }, { x: 12, y: 0, z: 2 + bob }, { x: 12, y: 0, z: 6 + bob }, { x: 2, y: 0, z: 6 + bob }], '#38bdf8');
        this.drawIsoPoly(cx, [{ x: -20, y: 20, z: h }, { x: -20, y: -20, z: h }, { x: -20, y: 0, z: h + 15 }], this.PALETTE.woodLight);
        this.drawIsoPoly(cx, [{ x: -20, y: 20, z: h }, { x: 20, y: 20, z: h }, { x: 20, y: 0, z: h + 15 }, { x: -20, y: 0, z: h + 15 }], this.PALETTE.roofDark);
        this.drawIsoPoly(cx, [{ x: -20, y: -20, z: h }, { x: 20, y: -20, z: h }, { x: 20, y: 0, z: h + 15 }, { x: -20, y: 0, z: h + 15 }], this.PALETTE.roofLight);
    },
    drawWindmill(cx, t = 0) {
        if (this.ASSETS.windmillTower.complete && this.ASSETS.windmillTower.naturalHeight > 0) {
            cx.save();
            let scale = 85 / this.ASSETS.windmillTower.naturalHeight, w = this.ASSETS.windmillTower.naturalWidth * scale, h = 85;
            cx.drawImage(this.ASSETS.windmillTower, -w / 2, -h + 10, w, h);
            if (this.ASSETS.windmillBlades.complete && this.ASSETS.windmillBlades.naturalHeight > 0) {
                cx.save(); cx.translate(0, -h * 0.70); cx.rotate(t * 1.5);
                let bw = this.ASSETS.windmillBlades.naturalWidth * scale, bh = this.ASSETS.windmillBlades.naturalHeight * scale;
                cx.drawImage(this.ASSETS.windmillBlades, -bw / 2, -bh / 2, bw, bh); cx.restore();
            }
            cx.restore();
        }
    },
    drawTree(cx, t = 0, d = {}) {
        let sway = Math.sin(t * 1.5) * 2;
        cx.fillStyle = this.PALETTE.woodDark; cx.fillRect(-3, -15, 6, 15);
        cx.fillStyle = d.leafVariant || this.PALETTE.tree; cx.beginPath(); cx.arc(sway, -25, 18, 0, Math.PI * 2); cx.fill();
    },
    drawPropHouse(cx) {
        this.drawIsoPoly(cx, [{ x: -6, y: 6, z: 0 }, { x: -6, y: -6, z: 0 }, { x: -6, y: -6, z: 10 }, { x: -6, y: 6, z: 10 }], this.PALETTE.wallLight);
        this.drawIsoPoly(cx, [{ x: -6, y: 6, z: 0 }, { x: 6, y: 6, z: 0 }, { x: 6, y: 6, z: 10 }, { x: -6, y: 6, z: 10 }], this.PALETTE.wallDark);
        this.drawIsoPoly(cx, [{ x: -6, y: 6, z: 10 }, { x: 6, y: 6, z: 10 }, { x: 6, y: 0, z: 18 }, { x: -6, y: 0, z: 18 }], this.PALETTE.roofDark);
        this.drawIsoPoly(cx, [{ x: -6, y: -6, z: 10 }, { x: 6, y: -6, z: 10 }, { x: 6, y: 0, z: 18 }, { x: -6, y: 0, z: 18 }], this.PALETTE.roofLight);
    },
    drawPropStall(cx) {
        this.drawIsoPoly(cx, [{ x: -8, y: 8, z: 0 }, { x: 8, y: 8, z: 0 }, { x: 8, y: 8, z: 4 }, { x: -8, y: 8, z: 4 }], this.PALETTE.woodDark);
        this.drawIsoPoly(cx, [{ x: -8, y: 8, z: 12 }, { x: 8, y: 8, z: 12 }, { x: 8, y: 0, z: 18 }, { x: -8, y: 0, z: 18 }], '#ef4444');
    },

    generateUIcons() {
        let drawFns = { house: this.drawHouse.bind(this), tavern: this.drawTavern.bind(this), tower: this.drawTower.bind(this), market: this.drawMarket.bind(this), windmill: this.drawWindmill.bind(this), tree: this.drawTree.bind(this) };
        for (let k in drawFns) {
            let c = document.getElementById(`cb-icon-${k}`); if (!c) continue;
            let cx = c.getContext('2d'); cx.clearRect(0, 0, c.width, c.height);
            cx.translate(c.width / 2, c.height - 8); cx.scale(0.5, 0.5);
            cx.fillStyle = this.PALETTE.grass; cx.beginPath(); cx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2); cx.fill();
            drawFns[k](cx, 0, {});
            cx.resetTransform();
        }
    },

    generateStartingCity() {
        this.addEntity(0, 0, 'tower');
        this.addEntity(-100, 80, 'house');
        this.addEntity(120, -40, 'tavern');
        this.addEntity(200, 100, 'windmill');
    },

    loop(timestamp) {
        if (!this.ctx) return;

        // AUTO-RESIZE: Répare le bug de l'écran noir si l'onglet était masqué !
        if (this.container && (this.canvas.width !== this.container.clientWidth || this.canvas.height !== this.container.clientHeight)) {
            if (this.container.clientWidth > 0) {
                this.canvas.width = this.container.clientWidth;
                this.canvas.height = this.container.clientHeight;
            }
        }

        let t = timestamp / 1000;
        this.ctx.fillStyle = this.PALETTE.grass;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.cam.zoom, this.cam.zoom);
        this.ctx.translate(-this.cam.x, -this.cam.y);

        const drawCurve = (a, b, d) => {
            let mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, off = d * 0.15;
            if (a.x + a.y > b.x + b.y) off = -off;
            this.ctx.moveTo(a.x, a.y); this.ctx.quadraticCurveTo(mx + (-b.y + a.y) / d * off, my + (b.x - a.x) / d * off, b.x, b.y);
        };

        this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round';
        this.ctx.beginPath(); this.globalConnections.forEach(c => drawCurve(c.a, c.b, c.d));
        this.ctx.strokeStyle = this.PALETTE.path; this.ctx.lineWidth = 22; this.ctx.stroke();

        if (this.closePairs.length > 0) {
            this.ctx.beginPath(); this.closePairs.forEach(p => { this.ctx.moveTo(p.a.x, p.a.y); this.ctx.lineTo(p.b.x, p.b.y); });
            this.ctx.strokeStyle = this.PALETTE.plazaBase; this.ctx.lineWidth = 140; this.ctx.stroke();
            this.ctx.fillStyle = this.PALETTE.plazaBase; this.ctx.beginPath();
            CityData.entities.forEach(e => { if (e.inNeighborhood && e.type !== 'tree') { this.ctx.moveTo(e.x, e.y); this.ctx.arc(e.x, e.y, 70, 0, Math.PI * 2); } });
            this.ctx.fill();
        }

        this.ctx.beginPath();
        this.globalConnections.forEach(c => { if (c.a.inNeighborhood && c.b.inNeighborhood) drawCurve(c.a, c.b, c.d); });
        this.ctx.strokeStyle = this.PALETTE.roadUrban; this.ctx.lineWidth = 16; this.ctx.stroke();

        let allRender = [...CityData.entities, ...this.urbanProps];
        CityData.entities.forEach(e => { if (e.details && e.details.props) e.details.props.forEach(p => allRender.push({ type: p.type, x: e.x + p.dx, y: e.y + p.dy, flip: false })); });
        allRender.sort((a, b) => a.y - b.y);

        allRender.forEach(e => {
            if (e.x < this.cam.x - this.canvas.width / 2 - 200 || e.x > this.cam.x + this.canvas.width / 2 + 200 || e.y < this.cam.y - this.canvas.height / 2 - 200 || e.y > this.cam.y + this.canvas.height / 2 + 200) return;
            this.ctx.save(); this.ctx.translate(e.x, e.y); if (e.flip) this.ctx.scale(-1, 1);
            if (e === this.hoveredEntity && !this.isDragging && !e.type.startsWith('prop_')) this.ctx.filter = 'brightness(1.15) drop-shadow(0px 0px 8px rgba(255,255,255,0.8))';

            let fns = { house: this.drawHouse, tavern: this.drawTavern, tower: this.drawTower, market: this.drawMarket, windmill: this.drawWindmill, tree: this.drawTree, prop_house: this.drawPropHouse, prop_stall: this.drawPropStall };
            if (fns[e.type]) fns[e.type].bind(this)(this.ctx, t, e.details);

            if (e.type !== 'tree' && !e.type.startsWith('prop_') && e.happiness !== undefined) {
                let bob = Math.sin(t * 4 + e.x) * 3;
                if (e.happiness < 0) { this.ctx.fillStyle = '#fff'; this.ctx.beginPath(); this.ctx.arc(0, -60 + bob, 11, 0, Math.PI * 2); this.ctx.fill(); this.ctx.font = '14px Arial'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle'; this.ctx.fillText('😠', 0, -60 + bob); }
                else if (e.happiness >= 2) { this.ctx.fillStyle = '#fff'; this.ctx.beginPath(); this.ctx.arc(0, -60 + bob, 11, 0, Math.PI * 2); this.ctx.fill(); this.ctx.font = '14px Arial'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle'; this.ctx.fillText('😍', 0, -60 + bob); }
            }
            this.ctx.restore();
        });

        if (!this.isDragging && this.selectedTool !== 'remove') {
            this.ctx.save(); this.ctx.translate(this.mouseWorld.x, this.mouseWorld.y);
            if (!this.canBuild) { this.ctx.fillStyle = 'rgba(239,68,68,0.4)'; this.ctx.beginPath(); this.ctx.ellipse(0, 0, 40, 20, 0, 0, Math.PI * 2); this.ctx.fill(); this.ctx.globalAlpha = 0.4; }
            else {
                if (this.ghostHappiness < 0) { this.ctx.fillStyle = 'rgba(239,68,68,0.3)'; this.ctx.beginPath(); this.ctx.ellipse(0, 0, 50, 25, 0, 0, Math.PI * 2); this.ctx.fill(); }
                else if (this.ghostHappiness > 0) { this.ctx.fillStyle = 'rgba(34,197,94,0.3)'; this.ctx.beginPath(); this.ctx.ellipse(0, 0, 50, 25, 0, 0, Math.PI * 2); this.ctx.fill(); }
                this.ctx.globalAlpha = 0.8;
            }
            let fns = { house: this.drawHouse, tavern: this.drawTavern, tower: this.drawTower, market: this.drawMarket, windmill: this.drawWindmill, tree: this.drawTree };
            if (fns[this.selectedTool]) fns[this.selectedTool].bind(this)(this.ctx, 0, {});
            if (this.canBuild && this.ghostHappiness !== 0) {
                let bob = Math.sin(t * 4) * 3; this.ctx.fillStyle = '#fff'; this.ctx.beginPath(); this.ctx.arc(0, -60 + bob, 14, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.font = '16px Arial'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle'; this.ctx.fillText(this.ghostHappiness < 0 ? '😠' : '😍', 0, -60 + bob);
            }
            this.ctx.restore();
        }
        if (!this.isDragging && this.selectedTool === 'remove') { this.ctx.strokeStyle = '#ef4444'; this.ctx.lineWidth = 4; this.ctx.beginPath(); this.ctx.arc(this.mouseWorld.x, this.mouseWorld.y, 35, 0, Math.PI * 2); this.ctx.stroke(); }

        this.ctx.restore();
        requestAnimationFrame((ts) => this.loop(ts));
    }
};
window.CityBuilder = CityBuilder;
