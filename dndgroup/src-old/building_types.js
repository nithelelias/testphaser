import RESOURCES from "./resources.js";

export const BUILDING_TYPES = {
  hq: {
    icon: RESOURCES.frames.buildings.hq,
    life: 100,
    add:{
      population:2
    },
    every: {
      gold: 1,
    },
    attack: {
      damage: 1,
      distance: 4,
      ticks: 3,
    },
    name: "hq",
    title: "hq-cuartel",
    description: "tu cuartel general",
    no_cost: true,
  },
  crops: {
    icon: RESOURCES.frames.buildings.crops,
    life: 1,
    cost: {
      gold: 1,
      population: 1,
    },
    every: {
      food: 4,
    },

    name: "crops",
    title: "crops-cultivos",
    description: "genera alimento",
  },
  house: {
    icon: RESOURCES.frames.buildings.house,
    life: 3,
    cost: {
      gold: 2,
    },
    add: {
      population: 1,
    },
    every: {
      gold: 1,
      food: -1,
    },
    name: "house",
    title: "house-casa",
    description: ["genera dinero"],
  },
  wall: {
    icon: RESOURCES.frames.buildings.wall,
    life: 6,
    cost: {
      gold: 5,
    },
    name: "wall",
    title: "wall - muro",
    description: "bloquea el paso",
  },

  tower: {
    icon: RESOURCES.frames.buildings.tower,
    life: 6,
    cost: {
      gold: 15,
      population: 1,
    },
    attack: {
      damage: 1,
      distance: 10,
      ticks: 1,
    },
    every: {
      food: -1,
      gold: -2,
    },

    name: "tower",
    title: "tower-torre",
    description: ["ataca al enemigo", "mas cercano"],
  },
};
