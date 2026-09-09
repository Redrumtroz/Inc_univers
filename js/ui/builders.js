// Ajoute des fonctions au module UI principal
UI.buildResources = function() {
    let c = document.getElementById("resource-container"); 
    c.innerHTML = "<strong>Ressources du Studio</strong><br><br>";
    for(let k in ResourceDB) {
        if(ResourceDB[k].unlocked) {
            c.innerHTML += `<div class="resource-row"><span style="color:${ResourceDB[k].color}">${ResourceDB[k].name}</span><span id="val-${k}">0 / ${ResourceDB[k].max}</span></div>`;
        }
    }
};

UI.buildGenerators = function() {
    let c = document.getElementById("generator-container"); 
    c.innerHTML = "";
    for(let k in GeneratorDB) {
        if(GeneratorDB[k].unlocked) {
            let txt = ""; 
            for(let r in GeneratorDB[k].baseCost) {
                txt += `<span id="cost-${k}-${r}">${getCost(k,r)}</span> ${ResourceDB[r].name} `;
            }
            c.innerHTML += `<button id="btn-${k}" class="game-btn" onclick="Game.buyGenerator('${k}')"><strong>${GeneratorDB[k].name}</strong> (<span id="amt-${k}">${GeneratorDB[k].amount}</span>)<br>Coût: ${txt}</button>`;
        }
    }
};

UI.buildUpgrades = function() {
    let c = document.getElementById("upgrade-container"); 
    c.innerHTML = "";
    for(let k in UpgradeDB) {
        if(UpgradeDB[k].unlocked && !UpgradeDB[k].purchased) {
            let txt = ""; 
            for(let r in UpgradeDB[k].cost) {
                txt += `${UpgradeDB[k].cost[r]} ${ResourceDB[r].name} `;
            }
            c.innerHTML += `<button id="btn-upg-${k}" class="game-btn upgrade-btn" onclick="Game.buyUpgrade('${k}')"><strong>${UpgradeDB[k].name}</strong><br><small>${UpgradeDB[k].description}</small><br>Coût: ${txt}</button>`;
        }
    }
};

UI.updateResourcesScreen = function() {
    for(let k in ResourceDB) {
        if(ResourceDB[k].amount > ResourceDB[k].max) ResourceDB[k].amount = ResourceDB[k].max;
        let el = document.getElementById(`val-${k}`); 
        if(el) el.innerText = `${Math.floor(ResourceDB[k].amount)} / ${ResourceDB[k].max}`;
    }
};

UI.updateGeneratorsScreen = function() {
    for(let k in GeneratorDB) {
        let el = document.getElementById(`btn-${k}`);
        if(el) { 
            let aff = true; 
            for(let r in GeneratorDB[k].baseCost) {
                if(ResourceDB[r].amount < getCost(k,r)) aff = false;
            }
            el.disabled = !aff; 
        }
    }
};