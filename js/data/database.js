const ResourceDB = {
    wood: { name: "Bois", amount: 150, max: 1000, color: "#8a6b4e", unlocked: true },
    stone: { name: "Pierre", amount: 50, max: 1000, color: "#a1a3a4", unlocked: true },
    gold: { name: "Or", amount: 0, max: 500, color: "#f59e0b", unlocked: true },
    mana: { name: "Mana", amount: 0, max: 100, color: "#8b5cf6", unlocked: false }
};

const BuildingDB = {
    house: { name: "Maison", type: "house", desc: "+4 Pop", cost: { wood: 20 }, unlocked: true, pop_bonus: 4 },
    tavern: { name: "Taverne", type: "tavern", desc: "+15 Pop", cost: { wood: 100, stone: 30 }, unlocked: true, pop_bonus: 15 },
    tower: { name: "Garde", type: "tower", desc: "+8 Pop", cost: { wood: 50, stone: 100 }, unlocked: true, pop_bonus: 8 },
    market: { name: "Halles", type: "market", desc: "+5 Pop", cost: { wood: 80, stone: 40, gold: 10 }, unlocked: false, pop_bonus: 5 },
    windmill: { name: "Moulin", type: "windmill", desc: "+2 Pop", cost: { wood: 150, stone: 50 }, unlocked: true, pop_bonus: 2 }
};

const CityData = { population: 0, happiness: 0, buildings_count: 0, entities: [] };

const GeneratorDB = {
    lumberjack: { name: "Bûcheron", amount: 0, baseCost: { wood: 10 }, costMultiplier: 1.15, production: { wood: 1 }, unlocked: true },
    miner: { name: "Carrière", amount: 0, baseCost: { wood: 50 }, costMultiplier: 1.15, production: { stone: 1 }, unlocked: true }
};

const UpgradeDB = {
    axes: { name: "Haches en Fer", description: "Clic (Bois) x2.", cost: { stone: 50 }, purchased: false, unlocked: true },
    market_unlock: { name: "Permis de Commerce", description: "Débloque les Halles.", cost: { wood: 200, stone: 100 }, purchased: false, unlocked: true }
};

const SkillDB = {
    magic_tower: { name: "Magie Ancienne", desc: "Débloque la ressource Mana.", icon: "🔮", cost: { gold: 50 }, req: null, purchased: false, x: 400, y: 250 }
};

function getCost(genId, resId) { return Math.floor(GeneratorDB[genId].baseCost[resId] * Math.pow(GeneratorDB[genId].costMultiplier, GeneratorDB[genId].amount)); }