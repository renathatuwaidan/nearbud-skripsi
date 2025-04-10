const express = require('express')
const app = express()
const community_controller = require("../controller/community")
const user_auth_controller = require("../controller/user_authentication")

app.get("/getCommunity/preview", user_auth_controller.tokenVerif, function(req, res){
    let community_id = req.query.community_id
    let community_name = req.query.community_name
    let community_number_participant = req.query.community_number_participant
    let category_id = req.query.category_id
    let interest_id1 = req.query.interest_id1
    let interest_id2 = req.query.interest_id2   
    let interest_id3 = req.query.interest_id3 
    let interest_id4 = req.query.interest_id4
    let interest_id5 = req.query.interest_id5
    let city_based = req.query.city_based
    let province_based = req.query.province_based 
    let status = req.query.status 
    let page = req.query.page
    let size = req.query.size 
    let users_username_token = res.getHeader('users_username')

    community_controller.getCommunityPreview(req, res, community_id, community_name, community_number_participant, category_id, interest_id1, interest_id2, interest_id3, interest_id4, interest_id5, city_based, province_based, status, page, size, users_username_token)
})

app.get("/getCommunity/detail", user_auth_controller.tokenVerif, function (req, res) {
    let community_id = req.query.community_id
    let community_name = req.query.community_name
    let users_username_token = res.getHeader('users_username')

    community_controller.getCommunityDetail(req, res, community_id, community_name, users_username_token)
})

app.get("/getCommunity/isCreator", user_auth_controller.tokenVerif, function(req, res){
    let id_creator = req.query.id_creator
    let id_community = req.query.id_community
    let page = req.query.page
    let size = req.query.size

    community_controller.getCommunityCreator(req, res, id_creator, id_community, page, size)
})

// tambahkan data event
app.post("/addCommunity", user_auth_controller.tokenVerif, function(req, res){
    let community_name = req.body.community_name
    let community_description = req.body.community_description
    let province_name = req.body.province_name
    let city_name = req.body.city_name
    let interest_id = req.body.interest_id
    // let image_id = req.body.image_id
    let users_username_token = res.getHeader('users_username')

    community_controller.addCommunity(req, res, community_name, community_description, province_name, city_name, interest_id, users_username_token)
})

// meng-disable event exisitng (NEED TO DISCUSS)
app.patch("/deleteEvent", function(req, res){})

// mengupdate event existing
app.patch("/editCommunity", user_auth_controller.tokenVerif, function(req, res){
    let users_username_token = res.getHeader('users_username')
    let community_name = req.body.community_name
    let community_description = req.body.community_description
    let province_name = req.body.province_name
    let city_name = req.body.city_name
    let interest_id = req.body.interest_id
    let community_id = req.body.community_id

    community_controller.editCommunity(req, res, community_name, community_description, province_name, city_name, interest_id, users_username_token, community_id)
})

// get bulletin

// tambah bulletin

// edit bulletin

// delete bulletin

module.exports = app