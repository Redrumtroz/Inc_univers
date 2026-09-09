const UI = {
    setupEvents() {
        let b1 = document.getElementById("btn-manual-gather"); if(b1) b1.onclick = () => Game.manualGather("food");
        let b2 = document.getElementById("btn-save"); if(b2) b2.onclick = () => Game.save();
        let b3 = document.getElementById("btn-reset"); if(b3) b3.onclick = () => Game.reset();
    },
    showSaveMessage() {
        let msg = document.getElementById("save-msg");
        if(msg) { msg.style.display = "block"; setTimeout(() => msg.style.display = "none", 2000); }
    },
    buildResources() {
        let c = document.getElementById("resource-container"); c.innerHTML = "<strong>Ressources</strong><br><br>";
        for(let k in ResourceDB) if(ResourceDB[k].unlocked) c.innerHTML += `<div class="resource-row"><span style="color:${ResourceDB[k].color}">${ResourceDB[k].name}</span><span id="val-${k}">0 / ${ResourceDB[k].max}</span></div>`;
    },
    buildGenerators() {
        let c = document.getElementById("generator-container"); c.innerHTML = "";
        for(let k in GeneratorDB) {
            if(GeneratorDB[k].unlocked) {
                let txt = ""; for(let r in GeneratorDB[k].baseCost) txt += `<span id="cost-${k}-${r}">${getCost(k,r)}</span> ${ResourceDB[r].name} `;
                c.innerHTML += `<button id="btn-${k}" class="game-btn" onclick="Game.buyGenerator('${k}')"><strong>${GeneratorDB[k].name}</strong> (<span id="amt-${k}">${GeneratorDB[k].amount}</span>)<br>Coût: ${txt}</button>`;
            }
        }
    },
    buildUpgrades() {
        let c = document.getElementById("upgrade-container"); c.innerHTML = "";
        for(let k in UpgradeDB) {
            if(UpgradeDB[k].unlocked && !UpgradeDB[k].purchased) {
                let txt = ""; for(let r in UpgradeDB[k].cost) txt += `${UpgradeDB[k].cost[r]} ${ResourceDB[r].name} `;
                c.innerHTML += `<button id="btn-upg-${k}" class="game-btn upgrade-btn" onclick="Game.buyUpgrade('${k}')"><strong>${UpgradeDB[k].name}</strong><br><small>${UpgradeDB[k].description}</small><br>Coût: ${txt}</button>`;
            }
        }
    },
    buildSkills() {
        let svg = document.getElementById("tree-svg");
        let nodes = document.getElementById("tree-nodes");
        if (!svg || !nodes) return;

        svg.innerHTML = "";
        nodes.innerHTML = "";

        for (let k in SkillDB) {
            let s = SkillDB[k];

            // 1. Dessiner la ligne de connexion si un prérequis existe
            if (s.req && SkillDB[s.req]) {
                let p = SkillDB[s.req];
                svg.innerHTML += `<line x1="${p.x}" y1="${p.y}" x2="${s.x}" y2="${s.y}" stroke="#334155" stroke-width="4" id="line-${k}" />`;
            }

            // 2. Créer le nœud visuel
            let txt = ""; for (let r in s.cost) txt += `${s.cost[r]} ${ResourceDB[r] ? ResourceDB[r].name : r} `;
            nodes.innerHTML += `
                <div id="skill-${k}" class="tree-node locked" style="left:${s.x}px; top:${s.y}px;" onclick="Game.buySkill('${k}')">
                    ${s.icon}
                    <div class="tooltip">
                        <strong style="color:#f1c40f;">${s.name}</strong><br>
                        <span style="color:#ccc;">${s.desc}</span><br>
                        <hr style="margin:5px 0; border-color:#444;">
                        Coût : ${txt}
                    </div>
                </div>`;
        }
    },
    updateScreen() {
        for (let k in ResourceDB) {
            if (ResourceDB[k].amount > ResourceDB[k].max) ResourceDB[k].amount = ResourceDB[k].max;
            let el = document.getElementById(`val-${k}`); if (el) el.innerText = `${Math.floor(ResourceDB[k].amount)} / ${ResourceDB[k].max}`;
        }
        for (let k in GeneratorDB) {
            let el = document.getElementById(`btn-${k}`);
            if (el) { let aff = true; for (let r in GeneratorDB[k].baseCost) if (ResourceDB[r].amount < getCost(k, r)) aff = false; el.disabled = !aff; }
        }
        for (let k in SkillDB) {
            let el = document.getElementById(`skill-${k}`);
            let line = document.getElementById(`line-${k}`);
            if (el) {
                let s = SkillDB[k];
                let reqMet = !s.req || SkillDB[s.req].purchased;
                let aff = true; for (let r in s.cost) if (ResourceDB[r].amount < s.cost[r]) aff = false;

                el.className = "tree-node";
                if (line) line.setAttribute("stroke", "#334155"); // Couleur de base

                if (s.purchased) {
                    el.classList.add("purchased");
                    if (line) line.setAttribute("stroke", "#f1c40f"); // Ligne dorée
                }
                else if (reqMet && aff) { el.classList.add("available"); }
                else { el.classList.add("locked"); }
            }
        }
    }
};
function openTab(e, id) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(id).classList.add("active"); e.currentTarget.classList.add("active");
}