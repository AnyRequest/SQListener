# SQListener

A plugin that uses SQL to detect when a change, modify, delete, etc. query occurs.

## Version

0.0.2

## Usage

```bash
npm install --save sqlistener
```

현재 MySQL, MariaDB에서만 가능하며 사용법은 아래와 같습니다.

```javascript
import express from "express";
import SQListener from "../src/index";
import mysql from "mysql2";
import User from "./model/User";

const DB_CONFIG = {
  host: "localhost",
  port: 3307,
  database: "db_name",
  user: "root",
  password: "password",
};

const conn = mysql.createConnection(DB_CONFIG);

conn.connect();

const app = express();

/* 리스너 초기화 */
const listener = new SQListener(app);
listener.init({
  type: "mysql2",
  ...DB_CONFIG,
});
/* 이벤트 감지 시작 */
listener.watch([Model, ...]);

/* 이벤트 추가 */
listener.addEventListener("query", "user", (type, name, index) => {
  console.log("추가 감지!", this, type, name, index);
});

app.get("/", (req, res) => {
  console.log("hello world");
  res.send("done");
});
app.post("/", (req, res) => {
  conn.query(`INSERT INTO user (name) values('kimson')`);
  res.send("done");
});

app.listen(9090, () => {
  console.log("listening on http://localhost:9090");
});
```