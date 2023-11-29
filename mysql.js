const mysql = require('mysql2');
require('dotenv').config();


const pool = mysql.createPool({
    "user": process.env.MYSQL_USER,
    "password": process.env.MYSQL_PASSWORD,
    "database": process.env.MYSQL_DATABASE,
    "host": process.env.MYSQL_HOST,
    "port": process.env.MYSQL_PORT,

});
//console.log(process.env.MYSQL_DATABASE)

exports.pool = pool;