const express = require('express')
const app = express()
const event_controller = require("../controller/event")
const user_auth_controller = require("../controller/user_authentication")
const log = require("../utils/logger")

app.get("/getEvents/preview", user_auth_controller.tokenVerif, function (req, res){
    let interest_id1 = req.query.interest_id1
    let interest_id2 = req.query.interest_id2   
    let interest_id3 = req.query.interest_id3 
    let interest_id4 = req.query.interest_id4
    let interest_id5 = req.query.interest_id5
    let category_id1 = req.query.category_id1
    let category_id2 = req.query.category_id2 
    let category_id3 = req.query.category_id3 
    let category_id4 = req.query.category_id4
    let category_id5 = req.query.category_id5
    let event_date = req.query.event_date
    let city_id1 = req.query.city_id1
    let city_id2 = req.query.city_id2
    let city_id3 = req.query.city_id3
    let city_id4 = req.query.city_id4
    let city_id5 = req.query.city_id5
    let province_based = req.query.province_based
    let event_location = req.query.event_location 
    let event_number_participant = req.query.event_number_participant
    let event_creator = req.query.event_creator
    let status = req.query.status
    let size = req.query.size
    let page = req.query.page
    let pastEvent = req.query.pastEvent
    let users_username_token = res.getHeader('users_username')

    event_controller.getEventsPreview(req, res, interest_id1, interest_id2, interest_id3, interest_id4, interest_id5,category_id1, category_id2,
         category_id3, category_id4, category_id5, province_based, event_location,event_date, event_number_participant, status, event_creator,
         users_username_token, size, page, city_id1, city_id2, city_id3, city_id4, city_id5, pastEvent)
})

app.get("/getEvents/isCreator", user_auth_controller.tokenVerif, function (req, res){
    let id_creator = req.query.id_creator
    let id_community = req.query.id_community
    let page = req.query.page
    let size = req.query.size
    let users_username_token = res.getHeader('users_username')

    event_controller.getCreator(req, res, id_creator, id_community, users_username_token, page, size)
})

// tambahkan data event
app.post("/addEvent", user_auth_controller.tokenVerif, function(req, res){
    let event_name = req.body.event_name
    let event_description = req.body.event_description
    let event_date = req.body.event_date
    let event_duration = req.body.event_duration
    let event_location = req.body.event_location
    let event_city = req.body.event_city
    let event_address = req.body.event_address
    let event_number_participant = req.body.event_number_participant
    let event_id_profile = req.body.event_id_profile // onpending
    let event_category = req.body.event_category
    let event_interest = req.body.event_interest
    let event_creator = req.body.event_creator
    let event_coordinate = req.body.event_coordinate
    let users_username_token = res.getHeader('users_username')

    event_controller.addEvent(req, res, event_name, event_description, event_date, event_duration, event_location, event_city, 
        event_address, event_number_participant, event_id_profile, event_category, event_interest, event_creator, event_coordinate, users_username_token)
})

app.patch("/editEvent", user_auth_controller.tokenVerif, function(req, res){
    let event_id = req.body.event_id
    let event_name = req.body.event_name
    let event_description = req.body.event_description
    let event_date = req.body.event_date
    let event_duration = req.body.event_duration
    let event_location = req.body.event_location
    let event_city = req.body.event_city
    let event_address = req.body.event_address
    let event_number_participant = req.body.event_number_participant
    let event_id_profile = req.body.event_id_profile 
    let event_category = req.body.event_category
    let event_interest = req.body.event_interest
    let event_coordinate = req.body.event_coordinate
    let users_username_token = res.getHeader('users_username')

    event_controller.editEvent(req, res, event_id, event_name, event_description, event_date, event_duration, event_location, event_city, 
        event_address, event_number_participant, event_id_profile, event_category, event_interest, event_coordinate, users_username_token)
})

app.get("/getEvents/detail", user_auth_controller.tokenVerif, function(req, res){
    let event_name = req.query.event_name
    let event_id = req.query.event_id
    let status = req.query.status
    let users_username_token = res.getHeader('users_username')

    event_controller.getEventDetail(req, res, event_name, event_id, status, users_username_token)
})

app.delete("/deleteEvent", user_auth_controller.tokenVerif, function(req, res) {
    let event_id = req.body.event_id
    let users_username_token = res.getHeader('users_username')

    event_controller.deleteEvent(req, res, event_id, users_username_token)
})
module.exports = app