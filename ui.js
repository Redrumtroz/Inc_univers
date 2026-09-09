const UI = {
    setupEvents() {
        document.getElementById("btn-manual-gather").addEventListener("click", () => {
            Game.manualGather("food");
        });
        document.getElementById("btn-save").addEventListener("click", () => Game.save());
        document.getElementById("btn-reset").addEventListener("click", () => Game.reset());
    },

    openTab(event, tabId) {
        document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
        document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
        event.currentTarget.classList.add("active");
    },

    showSaveMessage() {
        const msg = document.getElementById("save-msg");
        if (msg) {
            msg.style.display = "block";
            setTimeout(() => { msg.style.display = "none"; }, 2000); // Disparaît après 2 secondes
        }
    },

    buildResources() {
        const container = document.getElementById("resource-container");
        container.innerHTML = "<strong>Ressources</strong><br><br>";
        for (const key in ResourceDB) {
            const res = ResourceDB[key];
            if (res.unlocked) {
                container.innerHTML += `
                    <div class="resource-row" id="row-${key}">
                        <span style="color: ${res.color}">${res.name}</span>
                        <span id="val-${key}">0 / ${res.max}</span>
                    </div>`;
            }
        }
    },

    buildGenerators() {
        const container = document.getElementById("generator-container");
        container.innerHTML = ""; 
        for (const key in GeneratorDB) {
            const gen = GeneratorDB[key];
            if (gen.unlocked) {
                let costText = "";
                for (const res in gen.baseCost) {
                    costText += `<span id="cost-${key}-${res}">${getCost(key, res)}</span> ${ResourceDB[res].name} `;
                }
                const btn = document.createElement("button");
                btn.id = `btn-${key}`;
                btn.className = "game-btn";
                btn.innerHTML = `<strong>${gen.name}</strong> (<span id="amt-${key}">0</span>) <br> Coût : ${costText}`;
                btn.onclick = () => Game.buyGenerator(key);
                container.appendChild(btn);
            }
        }
    },

    buildUpgrades() {
        const container = document.getElementById("upgrade-container");
        container.innerHTML = "";
        for (const key in UpgradeDB) {
            const upg = UpgradeDB[key];
            // On affiche seulement si débloqué ET non acheté
            if (upg.unlocked && !upg.purchased) {
                let costText = "";
                for (const res in upg.cost) {
                    costText += `<span id="upg-cost-${key}-${res}">${upg.cost[res]}</span> ${ResourceDB[res].name} `;
                }
                const btn = document.createElement("button");
                btn.id = `btn-upg-${key}`;
                btn.className = "game-btn upgrade-btn";
                btn.innerHTML = `<strong>${upg.name}</strong><br><small style="color:#ccc;">${upg.description}</small><br><br>Coût : ${costText}`;
                btn.onclick = () => Game.buyUpgrade(key);
                container.appendChild(btn);
            }
        }
    },

    buildSkills() {
        const container = document.getElementById("skill-tree-container");
        container.innerHTML = "";

        for (const key in SkillDB) {
            const skill = SkillDB[key];
            const btn = document.createElement("div");
            btn.id = `skill-${key}`;

            let costText = "";
            for (const res in skill.cost) costText += `${skill.cost[res]} ${ResourceDB[res].name} `;
            let reqText = skill.req ? `<br><small>Requis: ${SkillDB[skill.req].name}</small>` : "";

            btn.innerHTML = `<strong>${skill.name}</strong><br><small>${skill.desc}</small><br><br>Coût: ${costText}${reqText}`;
            btn.onclick = () => Game.buySkill(key);
            container.appendChild(btn);
        }
    },

    setupEvents() {
        const btnGather = document.getElementById("btn-manual-gather");
        if (btnGather) btnGather.addEventListener("click", () => Game.manualGather("food"));

        const btnSave = document.getElementById("btn-save");
        if (btnSave) btnSave.addEventListener("click", () => Game.save());

        const btnReset = document.getElementById("btn-reset");
        if (btnReset) btnReset.addEventListener("click", () => Game.reset());
    },

    updateScreen() {
        // Rafraichir les ressources
        for (const key in ResourceDB) {
            const res = ResourceDB[key];
            if (res.amount > res.max) res.amount = res.max; // Limite max
            if (res.unlocked && document.getElementById(`val-${key}`)) {
                document.getElementById(`val-${key}`).innerText = `${Math.floor(res.amount)} / ${res.max}`;
            }
        }

        // Rafraichir l'état (cliquable/grisé) des générateurs
        for (const genId in GeneratorDB) {
            const gen = GeneratorDB[genId];
            if (gen.unlocked && document.getElementById(`btn-${genId}`)) {
                let canAfford = true;
                for (const res in gen.baseCost) {
                    if (ResourceDB[res].amount < getCost(genId, res)) canAfford = false;
                }
                document.getElementById(`btn-${genId}`).disabled = !canAfford;
            }
        }

        // Rafraichir l'état des améliorations
        for (const upgId in UpgradeDB) {
            const upg = UpgradeDB[upgId];
            if (upg.unlocked && !upg.purchased && document.getElementById(`btn-upg-${upgId}`)) {
                let canAfford = true;
                for (const res in upg.cost) {
                    if (ResourceDB[res].amount < upg.cost[res]) canAfford = false;
                }
                document.getElementById(`btn-upg-${upgId}`).disabled = !canAfford;
            }
        }

        // Mise à jour de l'arbre de compétences
        for (const key in SkillDB) {
            const skill = SkillDB[key];
            const btn = document.getElementById(`skill-${key}`);
            if (!btn) continue;

            btn.className = "skill-node"; // Reset des classes

            let reqMet = !skill.req || SkillDB[skill.req].purchased;
            let canAfford = true;
            for (const res in skill.cost) if (ResourceDB[res].amount < skill.cost[res]) canAfford = false;

            if (skill.purchased) {
                btn.classList.add("purchased");
                btn.onclick = null;
            } else if (reqMet && canAfford) {
                btn.classList.add("available");
            } else {
                btn.classList.add("locked");
            }
        }
    }
};

window.openTab = UI.openTab;
