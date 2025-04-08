require('dotenv').config()

module.exports = {
    base_response : {
        pagination : 10
    },
    auth : {
        secretKey : process.env.SECRET_KEY
    }
}