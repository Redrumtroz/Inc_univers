// --- 1. RESSOURCES ---
const ResourceDB = {
    food: { name: "Nourriture", amount: 0, max: 500, color: "#a3e4d7", unlocked: true },
    wood: { name: "Bois", amount: 0, max: 200, color: "#edbb99", unlocked: true },
    stone: { name: "Pierre", amount: 0, max: 100, color: "#aeb6bf", unlocked: false } // Caché
};

// --- 2. GENERATEURS (Bâtiments / Unités) ---
const GeneratorDB = {
    farmer: {
        name: "Fermier", amount: 0,
        baseCost: { food: 10 }, costMultiplier: 1.15,
        production: { food: 1 }, unlocked: true
    },
    lumberjack: {
        name: "Bûcheron", amount: 0,
        baseCost: { food: 50 }, costMultiplier: 1.15,
        production: { wood: 1 }, unlocked: true
    },
    miner: {
        name: "Mineur", amount: 0,
        baseCost: { food: 100, wood: 50 }, costMultiplier: 1.15,
        production: { stone: 1 }, unlocked: false // Caché jusqu'à l'amélioration
    }
};

// --- 3. AMELIORATIONS (Upgrades) ---
const UpgradeDB = {
    stone_tools: {
        name: "Outils de récolte rudimentaires",
        description: "Double la puissance de votre clic manuel.",
        cost: { food: 50, wood: 20 },
        purchased: false,
        unlocked: true
    },
    mining_tech: {
        name: "Technologie Minière",
        description: "Débloque la ressource Pierre et le métier de Mineur.",
        cost: { wood: 50 },
        purchased: false,
        unlocked: true
    }
};

// --- 4. ARBRE DE COMPÉTENCES ---
const SkillDB = {
    click_mastery: {
        name: "Maîtrise du Clic", desc: "Puissance de clic +2",
        cost: { food: 150 }, req: null, purchased: false
    },
    forestry: {
        name: "Sylviculture", desc: "Double la production de bois",
        cost: { wood: 200 }, req: "click_mastery", purchased: false
    },
    masonry: {
        name: "Maçonnerie", desc: "Double la production de pierre",
        cost: { stone: 80 }, req: "forestry", purchased: false
    }
};

// --- FONCTION UTILITAIRE ---
function getCost(genId, resId) {
    const gen = GeneratorDB[genId];
    return Math.floor(gen.baseCost[resId] * Math.pow(gen.costMultiplier, gen.amount));
}
