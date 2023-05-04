var HEALTH = 100;
var MAX_HEALTH = 100;
var HEALT_RECOVER_RATE = {
  sleep: 1,
  meal: 1,
  coffee: 1,
};
var SENIORITY = 0;
var MONEY = 0;
var ACTION_COST = 0.2;
var ACTUAL_JOB = null;
var tutorial = true;
const DATE = {
  day: 1,
  month: 1,
  year: 1,
  hour: 6,
};
const INVENTORY = {
  coffee: 5, //0 - 5
  ingredients: 4, //0 - 10
};
const LEARNING = {
  passiveLevel: 1,
  activeLevel: 1,
};
const WORKING = {
  passiveLevel: 1,
  activeLevel: 1,
};
const KNOWLEDGE = {};
const SKILLS = {
  "active learning": 0,
  "passive learning": 0,
  "active working": 0,
  "passive working": 0,
  "total life": 0,
  "sleep recovery": 0,
  "meal recovery": 0,
  "coffy recovery": 0,
};
const STATE = Object.assign(
  {
    num: 0,
    tutorial,
    DATE,
    INVENTORY,
    KNOWLEDGE,
    LEARNING,
    WORKING,
    SKILLS,
    MONEY,
    SENIORITY,
    MAX_HEALTH,
    HEALTH,
    HEALT_RECOVER_RATE,
    ACTION_COST,
    ACTUAL_JOB,
    save,
  },
  JSON.parse(localStorage.getItem("game_state") || "{}")
);
function save() {
  STATE.num += 1;
  localStorage.setItem("game_state", JSON.stringify(STATE));
}

export default STATE;
