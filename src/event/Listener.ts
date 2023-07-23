import Adapter from "../manage/Adapter";
import type { Express } from "express";

export default class Listener {
  events = {};
  adapter: Adapter;
  DONE = false;
  waitList = [];
  tables = [];

  constructor(app: Express) {
    this.adapter = new Adapter(app);
  }

  watch(entities?: any[]) {
    this.adapter.watch(entities);
    setInterval(async () => {
      if (this.DONE) {
        const list = await this.adapter
          .getManager()
          .raw(`SELECT * FROM eventlist`);
        // console.log(list[0]);
        const changed = list[0].filter(
          (tb, i) =>
            tb.time.toLocaleString("ko") !==
            this.tables[i]?.time.toLocaleString("ko")
        );

        if (changed.length > 0 && this.tables.length > 0) {
          // console.log("changed", changed, this.tables);
          // console.log("this.events", this.events);
          for (let found of changed) {
            this.events[found.type].forEach((ev) => {
              if (ev.name === found.name) {
                ev.cb.call(this);
              }
            });
          }
        } else {
          // console.log("not changed");
        }

        // console.log(list[0], this.tables);

        this.tables = list[0];
      }
    }, 16);
  }

  async init(options) {
    await this.adapter.init(options);
    this.DONE = true;
  }

  addEventListener(
    type?: string,
    name?: string,
    cb?: Function,
    options: any = {}
  ) {
    if (!this.events[type]) this.events[type] = [];

    const isExist = this.events[type].findIndex(
      (e) => e.name === name && e.cb === cb
    );

    if (isExist > -1) {
      this.events[type].splice(isExist, 1);
    }

    this.events[type].push({
      type,
      name,
      cb: () => {
        const index = this.events[type].findIndex((e) => e.name === name);
        cb.call(this, type, name, index);
        if (options.once) {
          this.events[type].splice(index, 1);
        }
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
