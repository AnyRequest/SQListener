declare type AdapterOption = {
  type: "mysql" | "mysql2" | "postgres";
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

declare interface Adapter {
  constructor(app: Express);

  init(options: AdapterOption): void;
}

declare interface Pusher {}
