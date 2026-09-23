// js/data/database.js

const ResourceDB = {
    wood: { name: "Bois", amount: 150, max: 500, color: "#8a6b4e", unlocked: true },
    stone: { name: "Pierre", amount: 50, max: 300, color: "#a1a3a4", unlocked: true },
    gold: { name: "Or", amount: 0, max: 150, color: "#f59e0b", unlocked: true },
    mana: { name: "Mana", amount: 0, max: 100, color: "#8b5cf6", unlocked: false }
};

// Les bâtiments du City Builder (fusion avec ton ancien code)
const BuildingDB = {
    house: {
        name: "Maison",
        type: "house", // Fait le pont avec le rendu Canvas
        desc: "+4 Population",
        cost: { wood: 20 },
        unlocked: true,
        pop_bonus: 4
    },
    tavern: {
        name: "Taverne",
        type: "tavern",
        desc: "+15 Pop. Débloque le Recrutement RPG.",
        cost: { wood: 100, stone: 30 },
        unlocked: true,
        pop_bonus: 15
    },
    tower: {
        name: "Tour de Garde",
        type: "tower",
        desc: "+8 Pop. Défense du village.",
        cost: { wood: 50, stone: 100 },
        unlocked: true,
        pop_bonus: 8
    },
    market: {
        name: "Halles",
        type: "market",
        desc: "+5 Pop. Permet le commerce.",
        cost: { wood: 80, stone: 40, gold: 10 },
        unlocked: false,
        pop_bonus: 5
    }
};

// Le registre des entités physiquement placées sur la carte
const CityData = {
    population: 0,
    happiness: 0,
    entities: [],       // Tes entités (x, y, type, détails)
    connections: [],    // Tes routes générées (a, b, dist)
    neighborhoods: []   // Les zones grises (Quartiers)
};