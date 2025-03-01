const express = require('express')
const app = express()

// const register_controller = require()
const user_auth_controller = require("../controller/user_authentication")
const log = require("../utils/logger")

app.get("/checkExistUser", function(req,res){
    let username = req.query.username
    let email = req.query.email

    user_auth_controller.checkExistedUser(req, res, username, email)
})

app.post("/registerUser", function(req, res){
    let users_name = req.body.users_name
    let users_email = req.body.users_email
    let users_username = req.body.users_username
    let users_password = req.body.users_password
    let agree_tnc = req.body.agree_tnc
    let users_dob = req.body.users_dob
    let users_gender = req.body.users_gender
    let province_name = req. body.province_name
    let city_name = req.body.city_name
    let users_description = req.body.users_description

    user_auth_controller.registerUser(req, res, users_name, users_email, users_username, users_password, agree_tnc, users_dob, users_gender, province_name, city_name, users_description)
})

module.exports = app