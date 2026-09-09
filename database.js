const ResourceDB = {
    food: { name: "Nourriture", amount: 0, max: 500, color: "#a3e4d7", unlocked: true },
    wood: { name: "Bois", amount: 0, max: 200, color: "#edbb99", unlocked: true },
    stone: { name: "Pierre", amount: 0, max: 100, color: "#aeb6bf", unlocked: false }
};
const GeneratorDB = {
    farmer: { name: "Fermier", amount: 0, baseCost: { food: 10 }, costMultiplier: 1.15, production: { food: 1 }, unlocked: true },
    lumberjack: { name: "Bûcheron", amount: 0, baseCost: { food: 50 }, costMultiplier: 1.15, production: { wood: 1 }, unlocked: true },
    miner: { name: "Mineur", amount: 0, baseCost: { food: 100, wood: 50 }, costMultiplier: 1.15, production: { stone: 1 }, unlocked: false }
};
const UpgradeDB = {
    stone_tools: { name: "Outils rudimentaires", description: "Double le clic.", cost: { food: 50, wood: 20 }, purchased: false, unlocked: true },
    mining_tech: { name: "Technologie Minière", description: "Débloque la Pierre.", cost: { wood: 50 }, purchased: false, unlocked: true }
};
const SkillDB = {
    click_mastery: { name: "Maîtrise du Clic", desc: "Puissance +2", cost: { food: 150 }, req: null, purchased: false },
    forestry: { name: "Sylviculture", desc: "Double bois", cost: { wood: 200 }, req: "click_mastery", purchased: false }
};
function getCost(genId, resId) { return Math.floor(GeneratorDB[genId].baseCost[resId] * Math.pow(GeneratorDB[genId].costMultiplier, GeneratorDB[genId].amount)); }