const process = require("node:process");
const sqlite3 = require("sqlite3").verbose();

class DB {
	constructor(user, pass, name, type) {
		this.user = user;
		this.pass = pass;
		this.name = name;
		this.type = type;
		this.db = null;
	}

	init() {
		switch (this.type) {
			case "SQLITE": {
				const db = new sqlite3.Database(`db/${this.name}.db`);
				db.serialize(() => {
					db.run(
						"CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)",
					);
					db.run(
						"CREATE TABLE IF NOT EXISTS passwords (id INTEGER PRIMARY KEY AUTOINCREMENT, website TEXT, password TEXT)",
					);
				});

				this.db = db;
				break;
			}
			default:
				console.log("DRIVER UNKNOW WHILE OPENNING");
				process.exit(1);
		}
	}

	close() {
		switch (this.type) {
			case "SQLITE": {
				this.db.close();
				break;
			}
			default:
				console.log("DRIVER UNKNOW WHILE CLOSING");
				process.exit(1);
		}
	}
}

module.exports = {
	DB,
};
