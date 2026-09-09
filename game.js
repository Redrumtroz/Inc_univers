const Game = {
    clickPower: 1, multipliers: { wood:1, stone:1 },
    init() {
        this.load(); 
        UI.setupEvents(); UI.buildResources(); UI.buildGenerators(); UI.buildUpgrades(); UI.buildSkills(); 
        TD.init(); UI.updateScreen();
        setInterval(() => this.tick(), 1000); setInterval(() => this.save(), 10000);
    },
    manualGather(res) { ResourceDB[res].amount += this.clickPower; UI.updateScreen(); },
    buyGenerator(id) {
        let aff = true; for(let r in GeneratorDB[id].baseCost) if(ResourceDB[r].amount < getCost(id,r)) aff = false;
        if(aff) { for(let r in GeneratorDB[id].baseCost) ResourceDB[r].amount -= getCost(id,r); GeneratorDB[id].amount++; document.getElementById(`amt-${id}`).innerText = GeneratorDB[id].amount; UI.updateScreen(); }
    },
    buyUpgrade(id) {
        let u = UpgradeDB[id]; if(u.purchased) return;
        let aff = true; for(let r in u.cost) if(ResourceDB[r].amount < u.cost[r]) aff = false;
        if(aff) {
            for(let r in u.cost) ResourceDB[r].amount -= u.cost[r]; u.purchased = true;
            if(id==="stone_tools") this.clickPower*=2; if(id==="mining_tech") { ResourceDB.stone.unlocked=true; GeneratorDB.miner.unlocked=true; }
            UI.buildUpgrades(); UI.buildResources(); UI.buildGenerators(); UI.updateScreen();
        }
    },
    buySkill(id) {
        let s = SkillDB[id]; if(s.purchased || (s.req && !SkillDB[s.req].purchased)) return;
        let aff = true; for(let r in s.cost) if(ResourceDB[r].amount < s.cost[r]) aff = false;
        if(aff) {
            for(let r in s.cost) ResourceDB[r].amount -= s.cost[r]; s.purchased = true;
            if(id==="click_mastery") this.clickPower+=2; if(id==="forestry") this.multipliers.wood*=2; UI.updateScreen();
        }
    },
    save() {
        try {
            let data = { r: ResourceDB, g: GeneratorDB, u: UpgradeDB, s: SkillDB, cp: this.clickPower, m: this.multipliers, t: TD.towers, w: TD.wave };
            localStorage.setItem("JeuMultiSave", JSON.stringify(data));
            UI.showSaveMessage();
        } catch(e) { console.error("Erreur de sauvegarde:", e); }
    },
    load() {
        try {
            let d = JSON.parse(localStorage.getItem("JeuMultiSave"));
            if(d) {
                if(d.r) for(let k in d.r) if(ResourceDB[k]) Object.assign(ResourceDB[k], d.r[k]);
                if(d.g) for(let k in d.g) if(GeneratorDB[k]) Object.assign(GeneratorDB[k], d.g[k]);
                if(d.u) for(let k in d.u) if(UpgradeDB[k]) Object.assign(UpgradeDB[k], d.u[k]);
                if(d.s) for(let k in d.s) if(SkillDB[k]) Object.assign(SkillDB[k], d.s[k]);
                if (d.cp) this.clickPower = d.cp; if (d.m) this.multipliers = d.m;

                if (d.t) TD.towers = d.t;
                if (d.w) TD.wave = d.w;
            }
        } catch(e) { console.error("Erreur de chargement:", e); }
    },
    reset() { if(confirm("Effacer la progression ?")) { localStorage.removeItem("JeuMultiSave"); location.reload(); } },
    tick() {
        for(let k in GeneratorDB) if(GeneratorDB[k].amount > 0) for(let r in GeneratorDB[k].production) ResourceDB[r].amount += GeneratorDB[k].production[r] * GeneratorDB[k].amount * (this.multipliers[r]||1);
        TD.tick(); UI.updateScreen();
    }
};

window.onload = () => Game.init();