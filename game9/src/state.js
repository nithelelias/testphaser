var HEALTH = 50;
var HEALT_RECOVER_RATE = 1;
var SENIORITY = 0;
var MONEY = 0;
var ACTION_COST = 0.2;
var ACTION_STUDY = 1;
var ACTUAL_JOB = null;
var tutorial = true;
const DATE = {
  day: 1,
  month: 1,
  year: 1,
  hour: 8,
};
const INVENTORY = {
  coffee: 5, //0 - 5
  ingredients: 4, //0 - 10
};
const KNOWLEDGE = {};

const STATE = Object.assign(
  {
    num: 0,
    tutorial,
    DATE,
    INVENTORY,
    KNOWLEDGE,
    MONEY,
    SENIORITY,
    HEALTH,
    HEALT_RECOVER_RATE,
    ACTION_COST,
    ACTION_STUDY,
    ACTUAL_JOB,
    save,
  },
  JSON.parse(localStorage.getItem("game_state") || "{}")
);
function save() {
  STATE.num += 1;
  localStorage.setItem("game_state", JSON.stringify(STATE));
}
console.log(STATE);
export default STATE;
