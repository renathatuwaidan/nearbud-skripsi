const {Pool} = require('pg')
// menggunakan konsep POOL untuk memaksimalkan proses koneksi ke DB untuk multiple HIT secara concurrent

const pool = new Pool({
    user : 'postgres',
    host : 'localhost',
    database : 'postgres',
    password : 'postgres',
    port : '5432',
    max : '20'
})

module.exports = pool