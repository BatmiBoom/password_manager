const process = require("node:process");
const readline = require("node:readline");
const e = require("./encrypt.js");

const db = require("better-sqlite3")("db/pass.db");

const rl = readline.promises.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  db_init();
  console.log("Welcome to password manager X \n");

  user = await login();

  while (true) {
    const selected_option = await renderMenu();

    switch (selected_option) {
      case 1:
        await add_password();
        break;
      case 2:
        await delete_password();
        break;
      case 3:
        await search_password();
        break;
      case 4:
        await list_websites();
        break;
      case 5:
        await import_password();
        break;
      case 6:
        console.log("Gracias por usar este programa! \n");
        rl.close();
        process.exit(0);
        break;
      default:
        console.log("Invalid Option \n");
        break;
    }
  }
}

function db_init() {
  db.prepare(
    "CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT, hash TEXT)",
  ).run();
  db.prepare(
    "CREATE TABLE IF NOT EXISTS websites (url TEXT, password TEXT, hash TEXT)",
  ).run();
}

async function add_password() {
  const url = await rl.question("Ponga la url del sitio : ");
  const password = await rl.question("Entre la password del sitio : ");

  const pass = e.encrypt(password);

  db.prepare("INSERT INTO websites (url, password, hash) VALUES (?, ?, ?)").run(
    url,
    pass.content,
    pass.iv,
  );

  return {
    url: url,
    password: pass.content,
    hash: pass.iv,
  };
}

async function delete_password() {
  const url = await rl.question("Entre el url del sitio que desea borrar : ");

  const site = db
    .prepare(`SELECT * FROM websites WHERE url LIKE '%${url}%'`)
    .get();

  if (!site) {
    console.log("No existe un password para ese URL");
    return;
  }

  const no = await rl.question(
    `Esta seguro de que desea borrar la contrasena de [y/n]: ${site.url}`,
  );

  if (no === "n") {
    return;
  }

  db.prepare("DELETE FROM websites where url = ?").run(site.url);
}

async function search_password() {
  const url = await rl.question("Entre el url del sitio que desea borrar : ");

  const site = db
    .prepare(`SELECT * FROM websites WHERE url LIKE '%${url}%'`)
    .get();

  if (!site) {
    console.log("No existe un password para ese URL");
    return;
  }

  const pass = e.decrypt({ iv: site.hash, content: site.password });

  console.log(`La contrasena para este URL : ${pass}`);
}
async function list_websites() {
  const sites = db.prepare("SELECT * FROM websites").all();

  for (const site of sites) {
    console.log(`URL : ${site.url} \n`);
  }
}
async function import_password() {}

async function renderMenu() {
  console.log("Tus opciones son : \n");
  console.log("1 - Add a password \n");
  console.log("2 - Delete a password \n");
  console.log("3 - Search password \n");
  console.log("4 - List all password \n");
  console.log("5 - Import password from browser (CSV) \n");
  console.log("6 - Quit \n");

  const selection = await rl.question("Enter Option : ");

  return Number.parseInt(selection, 10);
}

async function login() {
  let new_user = true;
  const user = db.prepare("SELECT * FROM users").get();

  if (user !== undefined) {
    new_user = false;
  }

  if (new_user) {
    console.log(
      "This is your first time entering this app, please register \n",
    );

    const username = await rl.question("Enter Username : ");
    const password = await rl.question("Enter Password : ");

    const pass = e.encrypt(password);

    db.prepare(
      "INSERT INTO users (username, password, hash) VALUES (?, ?, ?)",
    ).run(username, pass.content, pass.iv);

    return {
      username: username,
      password: pass.content,
      hash: pass.iv,
    };
  }

  console.log("LOGIN \n");

  const username = await rl.question("Enter Username : ");
  const password = await rl.question("Enter Password : ");

  if (
    user.username !== username ||
    e.decrypt({ iv: user.hash, content: user.password }) !== password
  ) {
    console.error("ERROR : You entered the Wrong password | Wrong username");
    process.exit(1);
  }

  return user;
}

main();
