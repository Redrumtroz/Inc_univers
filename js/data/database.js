const ResourceDB = {
    ideas: { name: "Idées", amount: 0, max: 500, color: "#f59e0b", unlocked: true },
    code: { name: "Lignes de Code", amount: 0, max: 300, color: "#38bdf8", unlocked: true },
    gfx: { name: "Graphismes", amount: 0, max: 150, color: "#f43f5e", unlocked: false },
    sound: { name: "Audio", amount: 0, max: 100, color: "#a855f7", unlocked: false }
};

const GeneratorDB = {
    intern: { name: "Stagiaire", amount: 0, baseCost: { ideas: 10 }, costMultiplier: 1.15, production: { ideas: 1 }, unlocked: true },
    coder: { name: "Programmeur", amount: 0, baseCost: { ideas: 50 }, costMultiplier: 1.15, production: { code: 1 }, unlocked: true },
    designer: { name: "Graphiste", amount: 0, baseCost: { ideas: 100, code: 50 }, costMultiplier: 1.15, production: { gfx: 1 }, unlocked: false }
};

const UpgradeDB = {
    coffee: { name: "Machine à Café", description: "Double la puissance du clic (Idées).", cost: { ideas: 50 }, purchased: false, unlocked: true },
    git_repo: { name: "Dépôt Git", description: "Les programmeurs sont 2x plus efficaces.", cost: { code: 100 }, purchased: false, unlocked: true }
};

const SkillDB = {
    engine_2d: { name: "Moteur 2D", desc: "Débloque la création visuelle.", icon: "⚙️", cost: { ideas: 100, code: 50 }, req: null, purchased: false, x: 100, y: 250 },
    pixel_art: { name: "Pixel Art", desc: "Débloque le métier Graphiste.", icon: "🎨", cost: { code: 100 }, req: "engine_2d", purchased: false, x: 250, y: 150 },
    sfx_synth: { name: "Synthétiseur SFX", desc: "Débloque la ressource Audio.", icon: "🎵", cost: { code: 150 }, req: "engine_2d", purchased: false, x: 250, y: 350 },
    mini_game_td: { name: "Module Tower Defense", desc: "Création d'un mini-jeu !", icon: "🏹", cost: { code: 200, gfx: 50 }, req: "pixel_art", purchased: false, x: 400, y: 150 },
    mini_game_rpg: { name: "Module RPG", desc: "Création d'un jeu de rôle.", icon: "⚔️", cost: { code: 300, sound: 50 }, req: "sfx_synth", purchased: false, x: 400, y: 350 }
};

function getCost(genId, resId) { 
    return Math.floor(GeneratorDB[genId].baseCost[resId] * Math.pow(GeneratorDB[genId].costMultiplier, GeneratorDB[genId].amount)); 
}