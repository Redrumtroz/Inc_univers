const RPG = {
    hero: { level: 1, hp: 100, maxHp: 100, atk: 10, upgradeCost: 50 },
    monster: { level: 1, name: "Slime", hp: 50, maxHp: 50, atk: 5 },
    combatTimer: 0,

    init() {
        this.updateUI();
    },

    upgradeHero() {
        if (ResourceDB.code.amount >= this.hero.upgradeCost) {
            ResourceDB.code.amount -= this.hero.upgradeCost;
            this.hero.level++;
            this.hero.maxHp = Math.floor(this.hero.maxHp * 1.2);
            this.hero.hp = this.hero.maxHp;
            this.hero.atk = Math.floor(this.hero.atk * 1.3);
            this.hero.upgradeCost = Math.floor(this.hero.upgradeCost * 1.5);
            this.updateUI();
            UI.updateScreen();
        }
    },

    spawnMonster() {
        this.monster.level = this.hero.level;
        this.monster.maxHp = 40 + (this.monster.level * 15);
        this.monster.hp = this.monster.maxHp;
        this.monster.atk = 4 + (this.monster.level * 2);
        this.monster.name = "Monstre Nv." + this.monster.level;
    },

    tick() {
        // Le combat ne s'active que si la compétence est débloquée
        if (!SkillDB.mini_game_rpg.purchased) return;

        this.combatTimer++;
        if (this.combatTimer >= 2) { // Attaque toutes les 2 secondes
            this.combatTimer = 0;

            // Le héros attaque
            this.monster.hp -= this.hero.atk;

            if (this.monster.hp <= 0) {
                // Victoire : Loot
                ResourceDB.gfx.amount += 5 * this.monster.level;
                ResourceDB.sound.amount += 2 * this.monster.level;
                this.spawnMonster();
            } else {
                // Le monstre riposte
                this.hero.hp -= this.monster.atk;
                if (this.hero.hp <= 0) {
                    // Défaite : Le héros ressuscite mais on génère un nouveau monstre
                    this.hero.hp = this.hero.maxHp;
                    this.spawnMonster();
                }
            }
            this.updateUI();
            UI.updateScreen();
        }
    },

    updateUI() {
        let elHeroHp = document.getElementById("hero-hp-bar");
        if (!elHeroHp) return; // Sécurité si l'onglet n'est pas encore chargé

        elHeroHp.style.width = Math.max(0, (this.hero.hp / this.hero.maxHp) * 100) + "%";
        document.getElementById("hero-hp-text").innerText = `${this.hero.hp}/${this.hero.maxHp}`;
        document.getElementById("hero-atk").innerText = this.hero.atk;
        document.getElementById("hero-lvl").innerText = `Nv.${this.hero.level}`;
        document.getElementById("hero-upg-cost").innerText = this.hero.upgradeCost;

        document.getElementById("monster-hp-bar").style.width = Math.max(0, (this.monster.hp / this.monster.maxHp) * 100) + "%";
        document.getElementById("monster-hp-text").innerText = `${this.monster.hp}/${this.monster.maxHp}`;
        document.getElementById("monster-atk").innerText = this.monster.atk;
        document.getElementById("monster-name").innerText = this.monster.name;
        document.getElementById("rpg-level").innerText = this.monster.level;
    }
};