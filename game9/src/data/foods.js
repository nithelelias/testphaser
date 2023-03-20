/**
 * preparation_time is in REAL seconds
 */
const FOODS = {
  coffee: {
    max: 5,
    preparation_time: 2,
    consume_time: 2,
    recover: 10,
    cost: 2,
  },
  water: {
    max: 1,
    preparation_time: 1,
    consume_time: 1,
    recover: 2,
    cost: 1,
  },
  ingredient: {
    max: 10,
    cost: 0.2,
    preparation_time: 2,
    recover: 5,
  },
  meal: {
    // THE MEAL  REQUIRE INGREDIENTS, BY EVERY INGREDIENT ADD N minutes and the N Recover
    recover: 20,
    consume_time: 10,
  },
};
export default FOODS;
