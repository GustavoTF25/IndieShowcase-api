var mysql = require('mysql');
var pool = mysql.createPool({
    "user": "root",
    "password": "",
    "database": "indiedb",
    "host": "localhost",
    "port": 3306
})