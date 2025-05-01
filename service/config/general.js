require('dotenv').config()

module.exports = {
    base_response : {
        pagination : 100
    },
    auth : {
        secretKey : "sV0pBm6lZLAPINearbud",
        tokenExpired : "30d"
    },
    auth_email : {
        mail_user : "nearbud.application@gmail.com",
        mail_password : "imeckpydktyumnxq",
        mail_port : "465",
        mail_host : "smtp.gmail.com"
    }
}