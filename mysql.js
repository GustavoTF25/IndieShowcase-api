const mysql = require('mysql2');

const pool = mysql.createPool({
    "user": "root",         //process.env.MYSQL_USER,
    "password":"",              //process.env.MYSQL_PASSWORD,
    "database":"indiedb",                //process.env.MYSQL_DATABASE,
    "host":"localhost",                   //process.env.MYSQL_HOST,
    "port":"3306"                    //process.env.MYSQL_PORT
});

exports.pool = pool;