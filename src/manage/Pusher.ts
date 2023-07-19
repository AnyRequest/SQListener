import { Knex } from "knex";

export default class Pusher {
  private type: string;
  private name: string;
  private time: number;
  private knex;

  constructor(type: string, name: string, knex: Knex) {
    this.type = type;
    this.name = name;
    this.time = +new Date();
    this.knex = knex;
  }

  async add() {
    const hasRaw = await this.knex("eventlist")
      .where("type", "=", this.type)
      .andWhere("name", "=", this.name);
    console.log(hasRaw);
    if (hasRaw.length > 0) console.log("already exists");
    if (hasRaw.length === 0)
      return await this.knex("eventlist").insert({
        type: this.type,
        name: this.name,
        time: this.knex.fn.now(),
      });
  }

  async update() {
    console.log("updating");
    return await this.knex("eventlist")
      .where("type", "=", this.type)
      .andWhere("name", "=", this.name)
      .update({ time: this.knex.fn.now() });
  }
}
