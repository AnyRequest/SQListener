import models from "../util/tool";

export default function Listen() {
  return function (target, propertyKey, callback) {
    console.log(target.name);
    // models[target.name] = target;
    models.push(target);
  };
}
