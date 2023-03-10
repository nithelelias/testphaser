var HEALTH = 100;
var HEALT_RECOVER_RATE = 1;
var SENIORITY = 0;
var MONEY = 0.0;
var ACTION_COST = 0.2;
var ACTION_STUDY = 1;
var ACTION_WORK = 1;
const DATE = {
  day: 1,
  month: 1,
  year: 1,
  hour: 0,
};
const KNOWLEDGE = {};

const STATE = Object.assign(
  {
    DATE,
    KNOWLEDGE,
    MONEY,
    SENIORITY,
    HEALTH,
    HEALT_RECOVER_RATE,
    ACTION_COST,
    ACTION_STUDY,
    ACTION_WORK,
    save,
  },
  JSON.parse(localStorage.getItem("game_state") || "{}")
);
function save() {
  localStorage.setItem("game_state", JSON.stringify(STATE));
}
console.log(STATE);
export default STATE;
