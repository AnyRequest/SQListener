import type { Knex as KNEX } from "knex";
import Knex from "knex";
import type { Express } from "express";
import Pusher from "./Pusher";

export default class Adapter {
  private knex;

  constructor(app: Express) {
    app.use(function (req, res, next) {
      next();
    });
  }

  createPusher(type: string, name: string) {
    console.log("knex check create pusher");
    return new Pusher(type, name, this.knex);
  }

  async init(options: AdapterOption) {
    const knex = Knex({
      client: options.type || "mysql2",
      connection: {
        host: options.host,
        port: options.port,
        user: options.user,
        password: options.password,
        database: options.database,
      },
    });

    const exists = await knex.schema.hasTable("eventlist");
    if (!exists) {
      await knex.schema.createTable("eventlist", function (table) {
        table.increments("id").primary();
        table.string("type");
        table.string("name");
        table.timestamp("time").defaultTo(knex.fn.now());
        table.timestamps(true, true);
      });
    }
    console.log("[SQListener] knex initialize");

    this.setManager(knex);
  }

  private setManager(knex) {
    this.knex = knex;
  }

  getManager() {
    return this.knex;
  }
}
