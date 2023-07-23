import type { Knex as KNEX } from "knex";
import Knex from "knex";
import type { Express } from "express";
import models from "../util/tool";

export default class Adapter {
  private host;
  private port;
  private user;
  private database;
  private password;
  private knex;
  private entities;

  constructor(app: Express) {
    app.use(function (req, res, next) {
      next();
    });
  }

  async init(options: AdapterOption) {
    this.host = options.host;
    this.port = options.port;
    this.user = options.user;
    this.password = options.password;
    this.database = options.database;

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

    for (let model of this.entities || models) {
      // console.log(model, "create trigger"); 4
      await this.createTrigger(model.name.toLowerCase());
    }
  }

  watch(entities: any[]) {
    this.entities = entities;
  }

  private setManager(knex) {
    this.knex = knex;
  }

  getManager() {
    return this.knex;
  }

  async createTrigger(tableName) {
    await this.knex.raw(
      `DROP TRIGGER IF EXISTS \`${this.database}\`.\`${tableName}_BEFORE_INSERT\`;`
    );
    await this.knex.raw(
      `CREATE TRIGGER \`${this.database}\`.\`${tableName}_BEFORE_INSERT\` BEFORE INSERT ON \`${tableName}\` FOR EACH ROW BEGIN UPDATE eventlist SET time = CURRENT_TIMESTAMP() WHERE name='${tableName}'; END;`
    );
  }
}
