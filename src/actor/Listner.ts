export default class Listener {
  events = {};
  adapter;
  pusher;

  constructor(adapter: Adapter, pusher: Pusher) {
    this.adapter = adapter;
    this.pusher = pusher;
  }

  addEventListener(type, name, cb, options) {
    if (!this.events[type]) this.events[type] = [];

    this.events[type].push({
      name: name,
      type: type,
      cb: () => {
        cb();
        const index = this.events[type].findIndex((e) => e.name === name);
        this.events[type].splice(index, 1);
      },
    });
  }

  hasListener(type: string, name: string);
  hasListener(type: string, cb: Function);
  hasListener(a: string, b: string | Function) {
    if (typeof b === "string") return this.events[a].some((e) => e.name === b);
    return this.events[a].some((e) => e.cb === b);
  }

  getListener(type, name: string) {
    return this.events[type].find((e) => e.name === name);
  }

  getListeners(type) {
    return this.events[type];
  }

  getAllListeners() {
    return this.events;
  }
}
