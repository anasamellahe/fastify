const database = require('better-sqlite3')
const db = new database('app.db')

db.exec("CREATE TABLE IF NOT EXISTS 'user' ( id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE);")
console.log("SQLite initialized.");
module.exports = db;