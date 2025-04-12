const express = require('express')
const app = express()
const user_auth_controller = require("../controller/user_authentication")

// checkin username dan email availability
app.get("/check/existUser", function(req,res){
    let username = req.query.username
    let email = req.query.email

    user_auth_controller.checkExistedUser(req, res, username, email)
})

// login user
app.post("/loginUser", function(req, res){
    let users_username = req.body.users_username
    let users_password = req.body.users_password

    user_auth_controller.loginUser(req, res, users_username, users_password)
})

// register user - tahap 1
app.post("/registerUser", function(req, res){
    let users_name = req.body.users_name
    let users_email = req.body.users_email
    let users_username = req.body.users_username
    let users_password = req.body.users_password
    let agree_tnc = req.body.agree_tnc
    let users_dob = req.body.users_dob

    user_auth_controller.registerUser(req, res, users_name, users_email, users_username, users_password, agree_tnc, users_dob)
})

app.post("/verifyOtpEmail", function(req, res){
    let users_email = req.body.users_email
    let otp = req.body.otp
    let process = req.body.process

    user_auth_controller.verifyOtpEmail(req, res, users_email, otp, process)
})

app.post("/reqForgetPassword", function(req, res){
    let users_email = req.body.users_email

    user_auth_controller.reqForgetPassword(req, res, users_email)
})

app.post("/resetPassword", function(req, res){
    let newPassword = req.body.newPassword
    let users_email = req.body.users_email
    
    user_auth_controller.resetPassword(req, res, users_email, newPassword)
})

app.get("/isTokenValid", user_auth_controller.tokenVerif, function(req, res){
    let users_username_token = res.getHeader('users_username')
    let token = res.getHeader('token')

    user_auth_controller.isTokenValid(req, res, users_username_token, token)
})

// register user - optional
app.patch("/registerUser/optional", user_auth_controller.tokenVerif, function(req, res){
    let users_gender = req.body.users_gender
    let province_name = req.body.province_name
    let city_name = req.body.city_name
    let users_description = req.body.users_description
    let users_interest = req.body.users_interest
    let users_community = req.body.users_community
    let users_username = res.getHeader('users_username')

    user_auth_controller.registerUser_optional(req, res, users_gender, province_name, city_name, users_description, users_interest, users_community, users_username)
})

app.patch("/updatePassword", user_auth_controller.tokenVerif, function(req, res){
    let old_pass = req.body.old_pass
    let new_pass = req.body.new_pass
    let users_username = res.getHeader('users_username')

    user_auth_controller.updatePassword(req, res, old_pass, new_pass, users_username)
})

module.exports = app