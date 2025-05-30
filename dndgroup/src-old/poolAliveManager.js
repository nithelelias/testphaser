import IdGenerator from "./idGenerator.js";

export default function PoolAliveManager() {
  // IT REQUIRE __ALIVE
  const idPool = IdGenerator();
  const pool = [];
  const getNonAlive = () => {
    return pool.filter((entity) => !entity.__alive);
  };
  const getAlive = () => {
    return pool.filter((entity) => entity.__alive);
  };

  this.getNonAlive = () => {
    return getNonAlive();
  };
  this.getAlive = () => {
    return getAlive();
  };
  this.genNewId = () => {
    return idPool.next();
  };

  this.create = (scene, classObject) => {
    let entityList = getNonAlive();
    let entity = null;
    if (entityList.length === 0) {
      entity = new classObject(scene, 0.0);
      entity.__id = this.genNewId();
      entity.__alive = true;
      entity.isAlive = () => entity.__alive;
      entity.setAlive = (_state = true) => (entity.__alive = _state);
      pool.push(entity);
    } else {
      entity = entityList[0];
      entity.__alive = true;
    }

    return entity;
  };
}
