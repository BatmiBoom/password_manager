const { DB } = require("./db.js");

const db = new DB("user", "pass", "name", "SQLITE");

function main() {
	db.init();
	db.close();
}

main();
