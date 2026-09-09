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
        let c = document.getElementById("skill-tree-container"); c.innerHTML = "";
        for(let k in SkillDB) {
            let txt = ""; for(let r in SkillDB[k].cost) txt += `${SkillDB[k].cost[r]} ${ResourceDB[r].name} `;
            c.innerHTML += `<div id="skill-${k}" class="skill-node" onclick="Game.buySkill('${k}')"><strong>${SkillDB[k].name}</strong><br><small>${SkillDB[k].desc}</small><br>Coût: ${txt}</div>`;
        }
    },
    updateScreen() {
        for(let k in ResourceDB) {
            if(ResourceDB[k].amount > ResourceDB[k].max) ResourceDB[k].amount = ResourceDB[k].max;
            let el = document.getElementById(`val-${k}`); if(el) el.innerText = `${Math.floor(ResourceDB[k].amount)} / ${ResourceDB[k].max}`;
        }
        for(let k in GeneratorDB) {
            let el = document.getElementById(`btn-${k}`);
            if(el) { let aff = true; for(let r in GeneratorDB[k].baseCost) if(ResourceDB[r].amount < getCost(k,r)) aff = false; el.disabled = !aff; }
        }
        for(let k in SkillDB) {
            let el = document.getElementById(`skill-${k}`);
            if(el) {
                el.className = "skill-node";
                let req = !SkillDB[k].req || SkillDB[SkillDB[k].req].purchased;
                let aff = true; for(let r in SkillDB[k].cost) if(ResourceDB[r].amount < SkillDB[k].cost[r]) aff = false;
                if(SkillDB[k].purchased) { el.classList.add("purchased"); }
                else if(req && aff) { el.classList.add("available"); }
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