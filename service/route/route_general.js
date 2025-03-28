const express = require('express')
const app = express()
const general_controller = require("../controller/general")
const user_auth_controller = require("../controller/user_authentication")

app.get("/getProvince", user_auth_controller.tokenVerif, function(req,res){
    let province_id = req.query.province_id
    let province_name = req.query.province_name
    let page = req.query.page
    let size = req.query.size

    general_controller.getProvince(req, res, province_id, province_name, page, size)
})

app.get("/getCity", user_auth_controller.tokenVerif, function(req,res){
    let province_id = req.query.province_id
    let province_name = req.query.province_name
    let city_id = req.query.city_id
    let city_name = req.query.city_name
    let page = req.query.page
    let size = req.query.size

    general_controller.getCity(req, res, province_id, province_name, city_id, city_name, page, size)
})

app.get("/getInterestCategory", user_auth_controller.tokenVerif, function(req, res){
    let interest_name = req.query.interest_name
    let category_name = req.query.category_name
    let page = req.query.page
    let size = req.query.size

    general_controller.getInterestCateory(req, res, interest_name, category_name, page, size)
})

app.get("/getUser", user_auth_controller.tokenVerif, function (req, res){
    let suspended = req.query.suspended
    let users_id = req.query.users_id
    let users_name = req.query.users_name
    let users_username = req.query.users_username
    let users_gender = req.query.users_gender
    let category = req.query.category
    let interest = req.query.interest
    let province = req.query.province
    let city = req.query.city
    let page = req.query.page
    let size = req.query.size

    general_controller.getUser(req, res, suspended, users_id, users_name, users_username, users_gender, category, interest, province, city, page, size)
})

app.get("/getSingleUser", user_auth_controller.tokenVerif, function (req, res) {
    let users_id = req.query.users_id
    let users_name = req.query.users_name
    let users_username = req.query.users_username
    let users_username_token = res.getHeader('users_username')

    general_controller.getSingleUser(req, res, users_id, users_name, users_username, users_username_token)
})

app.put("/updateProfile", user_auth_controller.tokenVerif, function(req, res){
    let users_name = req.body.users_name
    let users_email = req.body.users_email
    let users_dob = req.body.users_dob
    let users_gender = req.body.users_gender
    let users_province = req.body.users_province
    let users_city = req.body.users_city
    let users_description = req.body.users_description
    let interest = req.body.interest
    let users_username_token = res.getHeader('users_username')

    general_controller.updateProfile(req, res, users_name, users_email, users_dob, users_gender, users_province, users_city, users_description, interest, users_username_token)
})

app.put("/updatePassword", user_auth_controller.tokenVerif, function(req, res){
    let password_new = req.body.password_new
    let password_old = req.body.password_old
    let users_username_token = res.getHeader('users_username')

    general_controller.updatePassword(req, res, password_new, password_old, users_username_token)
})

app.get("/getReportType", user_auth_controller.tokenVerif, function(req, res){
    let page = req.query.page
    let size = req.query.size

    general_controller.getReportType(req, res, page, size)
})

app.post("/addReportUser", user_auth_controller.tokenVerif, function(req, res){
    let reportee = req.body.reportee
    let report_type = req.body.report_type
    let report_detail = req.body.report_detail
    let users_username_token = res.getHeader('users_username')

    general_controller.addReportUser(req, res, reportee, report_type, report_detail, users_username_token)
})

module.exports = app