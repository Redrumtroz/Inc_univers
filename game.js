const Game = {
    clickPower: 1, 
    multipliers: { wood: 1, stone: 1 },

    init() {
        UI.setupEvents(); 
        UI.buildResources();
        UI.buildGenerators();
        UI.buildUpgrades();
        UI.buildSkills();
        TD.init();


        UI.updateScreen();

        setInterval(() => this.tick(), 1000);
        setInterval(() => this.save(), 10000);
    },


    // --- SYSTEME DE SAUVEGARDE ---

    save() {
        const saveState = {
            resources: ResourceDB,
            generators: GeneratorDB,
            upgrades: UpgradeDB,
            skills: SkillDB,
            clickPower: this.clickPower,
            multipliers: this.multipliers,
            tdTowers: TD.towers
        };
        // Convertit l'objet en texte pour le navigateur
        localStorage.setItem("MonJeuIncrementalSave", JSON.stringify(saveState));
        UI.showSaveMessage();
    },

    load() {
        const saveStr = localStorage.getItem("MonJeuIncrementalSave");
        if (saveStr) {
            const saveState = JSON.parse(saveStr);

            // On restaure les données clés sans écraser la structure de base
            this.mergeData(ResourceDB, saveState.resources);
            this.mergeData(GeneratorDB, saveState.generators);
            this.mergeData(UpgradeDB, saveState.upgrades);
            this.mergeData(SkillDB, saveState.skills);

            if (saveState.clickPower) this.clickPower = saveState.clickPower;
            if (saveState.multipliers) this.multipliers = saveState.multipliers;
            if (saveState.tdTowers) TD.towers = saveState.tdTowers;
        }
    },

    // Fonction de sécurité pour appliquer la sauvegarde
    mergeData(baseDB, savedDB) {
        if (!savedDB) return;
        for (let key in savedDB) {
            if (baseDB[key]) {
                if (savedDB[key].amount !== undefined) baseDB[key].amount = savedDB[key].amount;
                if (savedDB[key].unlocked !== undefined) baseDB[key].unlocked = savedDB[key].unlocked;
                if (savedDB[key].purchased !== undefined) baseDB[key].purchased = savedDB[key].purchased;
            }
        }
    },

    reset() {
        if (confirm("Êtes-vous sûr de vouloir tout effacer ? Vous perdrez toute votre progression.")) {
            localStorage.removeItem("MonJeuIncrementalSave");
            location.reload(); // Rafraîchit la page pour repartir à zéro
        }
    },
    manualGather(resId) {
        ResourceDB[resId].amount += this.clickPower;
        UI.updateScreen();
    },

    buyGenerator(genId) {
        const gen = GeneratorDB[genId];
        let canAfford = true;
        for (const res in gen.baseCost) {
            if (ResourceDB[res].amount < getCost(genId, res)) canAfford = false;
        }
        if (canAfford) {
            for (const res in gen.baseCost) {
                ResourceDB[res].amount -= getCost(genId, res);
            }
            gen.amount++;
            document.getElementById(`amt-${genId}`).innerText = gen.amount;
            for (const res in gen.baseCost) {
                document.getElementById(`cost-${genId}-${res}`).innerText = getCost(genId, res);
            }
            UI.updateScreen();
        }
    },

    buyUpgrade(upgId) {
        const upg = UpgradeDB[upgId];
        if (upg.purchased) return;

        let canAfford = true;
        for (const res in upg.cost) {
            if (ResourceDB[res].amount < upg.cost[res]) canAfford = false;
        }

        if (canAfford) {
            // Déduction des coûts
            for (const res in upg.cost) {
                ResourceDB[res].amount -= upg.cost[res];
            }
            upg.purchased = true;
            
            // Appliquer l'effet spécifique de l'amélioration
            this.applyUpgradeEffect(upgId);
            
            // Refaire l'interface car on a peut-être débloqué de nouvelles choses
            UI.buildUpgrades();
            UI.buildResources();
            UI.buildGenerators();
            UI.updateScreen();
        }
    },

    applyUpgradeEffect(upgId) {
        if (upgId === "stone_tools") {
            this.clickPower *= 2;
        } 
        else if (upgId === "mining_tech") {
            // Débloque la pierre et le mineur !
            ResourceDB.stone.unlocked = true;
            GeneratorDB.miner.unlocked = true;
        }
    },

    buySkill(skillId) {
        const skill = SkillDB[skillId];
        if (skill.purchased) return;

        // Vérification du prérequis
        if (skill.req && !SkillDB[skill.req].purchased) return;

        let canAfford = true;
        for (const res in skill.cost) if (ResourceDB[res].amount < skill.cost[res]) canAfford = false;

        if (canAfford) {
            for (const res in skill.cost) ResourceDB[res].amount -= skill.cost[res];
            skill.purchased = true;

            // Appliquer les effets des compétences
            if (skillId === "click_mastery") this.clickPower += 2;
            if (skillId === "forestry") this.multipliers.wood *= 2;
            if (skillId === "masonry") this.multipliers.stone *= 2;

            UI.updateScreen();
        }
    },

    tick() {
        for (const key in GeneratorDB) {
            const gen = GeneratorDB[key];
            if (gen.amount > 0) {
                for (const resId in gen.production) {
                    // Application du multiplicateur spécifique s'il existe
                    let mult = this.multipliers[resId] || 1;
                    ResourceDB[resId].amount += gen.production[resId] * gen.amount * mult;
                }
            }
        }
        TD.tick();
        UI.updateScreen();
    }
};


Game.init();
