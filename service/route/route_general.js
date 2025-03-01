const express = require('express')
const app = express()

// const register_controller = require()
const general_controller = require("../controller/general")
const log = require("../utils/logger")

app.get("/getProvince", function(req,res){
    let name = req.query.name
    let page = req.query.page

    general_controller.getProvince(req, res, name, page)
})

app.get("/getCity", function(req,res){
    let province_name = req.query.province_name
    let city_name = req.query.city_name
    let page = req.query.page

    general_controller.getCity(req, res, province_name, city_name, page)
})

app.get("/getUser", function (req, res){
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

    general_controller.getUser(req, res, suspended, users_id, users_name, users_username, users_gender, category, interest, province, city, page)
})

app.get("/getInterestCategory", function(req, res){
    let interest_name = req.query.interest_name
    let category_name = req.query.category_name
    let page = req.query.page

    general_controller.getInterestCateory(req, res, interest_name, category_name, page)
})

module.exports = app