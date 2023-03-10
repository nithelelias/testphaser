import { KNOWLEDGE_ROADMAP, SENIORITY_LEVELS } from "./constants.js";
import STATE from "./state.js";
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
export function advanceSeniority() {
  let seniority = getSeniority();
  let next = getNextSeniority();
  console.log(seniority, next);
  // NEED TO KNOW EVERY TOPIC ON HIS SENIORITY LEVEL AT LEAST 30%
  for (let i in KNOWLEDGE_ROADMAP[seniority]) {
    let mustknow = KNOWLEDGE_ROADMAP[seniority][i];
    let p = STATE.KNOWLEDGE[mustknow] || 0;
    if (p < 30) {
      return false;
    }
  }
  {
    let mustknow_toadvance = KNOWLEDGE_ROADMAP[next][0];
    let p = STATE.KNOWLEDGE[mustknow_toadvance] || 0;
    if (p < 30) {
      return false;
    }
  }
  // ADVANCE!
  console.log("ADVANCE!")
  STATE.SENIORITY += 1;
}
export function getKnowledgeLevel(topic) {
  return STATE.KNOWLEDGE[topic] || 0;
}
export function progressOnKnowledge(topic, progress) {
  STATE.KNOWLEDGE[topic] = Math.min(100, progress);
  if (STATE.KNOWLEDGE[topic] === 100) {
    STATE.ACTION_STUDY += 1;
  }
  advanceSeniority();
  console.log("STORE", STATE.KNOWLEDGE);
  STATE.save();
}
