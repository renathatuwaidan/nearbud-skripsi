const {Pool} = require('pg')
// menggunakan konsep POOL untuk memaksimalkan proses koneksi ke DB untuk multiple HIT secara concurrent

const pool = new Pool({
    // user : 'nearbud_vpdp_user',
    // host : 'cvqko8h5pdvs73agcd60-a.oregon-postgres.render.com',
    // database : 'nearbud_vpdp',
    // password : 'PvkGBDlW0ATubChqccHiy9TkzhqAlQWW',
    // port : '5432',
    // max : '20',
    // connectionTimeoutMillis : 18000000
    connectionString: 'postgres://nearbud_vpdp_user:PvkGBDlW0ATubChqccHiy9TkzhqAlQWW@cvqko8h5pdvs73agcd60-a.oregon-postgres.render.com:5432/nearbud_vpdp?sslmode=no-verify'
})

module.exports = pool