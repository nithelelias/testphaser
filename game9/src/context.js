import { SENIORITY_LEVELS } from "./constants.js";
import FOODS from "./data/foods.js";
import KNOWLEDGE_ROADMAP from "./data/knowledgeMap.js";
import STATE from "./state.js";
export function saveState() {
  STATE.num += 1;
  STATE.save();
}
export function addHour(plus = 1) {
  STATE.DATE.hour += plus;
  newDay();
}
export function newDay() {
  if (STATE.DATE.hour < 24) {
    return;
  }
  STATE.DATE.hour = 1;
  STATE.DATE.day += 1;
  if (STATE.DATE.day > 30) {
    STATE.DATE.day = 1;
    STATE.DATE.month += 1;
  }
  if (STATE.DATE.month > 12) {
    STATE.DATE.month = 1;
    STATE.DATE.year += 1;
  }
}
export function getSeniority() {
  return SENIORITY_LEVELS[STATE.SENIORITY];
}
export function getNextSeniority() {
  return SENIORITY_LEVELS[
    Math.min(STATE.SENIORITY + 1, SENIORITY_LEVELS.length - 1)
  ];
}
export function canAdanceSeniority() {
  let seniority = getSeniority();
  for (let i in KNOWLEDGE_ROADMAP[seniority]) {
    let mustknow = KNOWLEDGE_ROADMAP[seniority][i];
    let p = STATE.KNOWLEDGE[mustknow] || 0;
    if (p < 30) {
      return false;
    }
  }
  return true;
}
export function advanceSeniority() {
  if (!canAdanceSeniority()) {
    return;
  }
  // KNOW AT LEAST 1 to 30 to advance
  let next = getNextSeniority();
  {
    let mustknow_toadvance = KNOWLEDGE_ROADMAP[next][0];
    let p = STATE.KNOWLEDGE[mustknow_toadvance] || 0;
    if (p < 30) {
      return false;
    }
  }
  // ADVANCE!
  console.log("ADVANCE!");
  STATE.SENIORITY += 1;
}
export function getKnowledgeLevel(topic) {
  return STATE.KNOWLEDGE[topic] || 0;
}
export function progressOnKnowledge(topic, progress) {
  STATE.KNOWLEDGE[topic] = Math.min(100, progress);

  advanceSeniority();
}

export function expendMoney(value) {
  if (STATE.MONEY - value < 0) {
    return false;
  }

  STATE.MONEY = parseFloat((STATE.MONEY - value).toFixed(2));

  return true;
}

export function recoverHP(value) {
  STATE.HEALTH = Math.min(STATE.MAX_HEALTH, STATE.HEALTH + value);
}

export function recoverHPBySleep() {
  recoverHP(STATE.HEALT_RECOVER_RATE.sleep);
}
export function isPlayerFullHP() {
  return STATE.HEALTH >= STATE.MAX_HEALTH;
}
export function buyCoffee(n = 1) {
  if (!expendMoney(FOODS.coffee.cost * n)) {
    return false;
  }
  STATE.INVENTORY.coffee = Math.min(
    FOODS.coffee.max,
    STATE.INVENTORY.coffee + n
  );

  return true;
}
export function buyFoodIngredient(n = 1) {
  if (!expendMoney(FOODS.ingredient.cost * n)) {
    return false;
  }
  STATE.INVENTORY.ingredients = Math.min(
    FOODS.ingredient.max,
    STATE.INVENTORY.ingredients + n
  );

  return true;
}
export function spendHP(cost) {
  STATE.HEALTH = Math.max(0, STATE.HEALTH - cost);
}

export function buySkill(skill) {
  console.log("BUY SKILL", skill.cost);
  if (!expendMoney(skill.cost)) {
    return false;
  }
  // STORE THE SKILL
  if (!STATE.SKILLS.hasOwnProperty(skill.name)) {
    STATE.SKILLS[skill.name] = 0;
  }
  STATE.SKILLS[skill.name] += 1;
  switch (skill.name) {
    case "active learning":
      STATE.LEARNING.activeLevel += 2;
      break;
    case "passive learning":
      STATE.LEARNING.passiveLevel += 1;
      break;
    case "active working":
      STATE.WORKING.activeLevel += 2;
      break;
    case "passive working":
      STATE.WORKING.passiveLevel += 1;
      break;
    case "total life":
      STATE.MAX_HEALTH += 10;
      break;
    case "sleep recovery":
      STATE.HEALT_RECOVER_RATE.sleep += 5;
      break;
    case "meal recovery":
      STATE.HEALT_RECOVER_RATE.meal += 2;
      break;
    case "coffy recovery":
      STATE.HEALT_RECOVER_RATE.coffee += 2;
      break;
  }
  return true;
}
