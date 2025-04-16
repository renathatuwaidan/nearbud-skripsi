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
    let city_id1 = req.query.city_id1
    let city_id2 = req.query.city_id2   
    let city_id3 = req.query.city_id3 
    let city_id4 = req.query.city_id4
    let city_id5 = req.query.city_id5
    let province_based = req.query.province_based 
    let status = req.query.status 
    let page = req.query.page
    let size = req.query.size 
    let users_username_token = res.getHeader('users_username')

    community_controller.getCommunityPreview(req, res, community_id, community_name, community_number_participant, category_id, interest_id1, interest_id2, interest_id3, interest_id4, interest_id5, 
        city_id1, city_id2, city_id3, city_id4, city_id5, province_based, status, page, size, users_username_token)
})

app.get("/getCommunity/detail", user_auth_controller.tokenVerif, function (req, res) {
    let community_id = req.query.community_id
    let community_name = req.query.community_name
    let users_username_token = res.getHeader('users_username')

    community_controller.getCommunityDetail(req, res, community_id, community_name, users_username_token)
})

app.get("/getCommunity/isCreator", user_auth_controller.tokenVerif, function(req, res){
    let id_creator = req.query.id_creator
    let users_username_token = res.getHeader('users_username')
    let page = req.query.page
    let size = req.query.size

    community_controller.getCommunityCreator(req, res, id_creator, users_username_token, page, size)
})

// tambahkan data event
app.post("/addCommunity", user_auth_controller.tokenVerif, function(req, res){
    let community_name = req.body.community_name
    let community_description = req.body.community_description
    let province_name = req.body.province_name
    let city_name = req.body.city_name
    let interest_id = req.body.interest_id
    let community_id_profile = req.body.community_id_profile
    let users_username_token = res.getHeader('users_username')

    community_controller.addCommunity(req, res, community_name, community_description, province_name, city_name, interest_id, users_username_token, community_id_profile)
})

// meng-disable event exisitng (NEED TO DISCUSS)
app.patch("/deleteEvent", function(req, res){})

app.post("/addAdmin", user_auth_controller.tokenVerif, function(req, res){
    let id_user = req.body.id_user
    let id_community = req.body.id_community
    let users_username_token = res.getHeader('users_username')

    community_controller.addAdmin(req, res, id_user, id_community, users_username_token)
})

app.delete("/deleteAdmin", user_auth_controller.tokenVerif, function(req, res){
    let id_user = req.body.id_user
    let id_community = req.body.id_community
    let users_username_token = res.getHeader('users_username')

    community_controller.deleteAdmin(req, res, id_user, id_community, users_username_token)
})


// mengupdate event existing
app.patch("/editCommunity", user_auth_controller.tokenVerif, function(req, res){
    let users_username_token = res.getHeader('users_username')
    let community_name = req.body.community_name
    let community_description = req.body.community_description
    let province_name = req.body.province_name
    let city_name = req.body.city_name
    let interest_id = req.body.interest_id
    let community_id = req.body.community_id
    let community_id_profile = req.body.community_id_profile

    community_controller.editCommunity(req, res, community_name, community_description, province_name, city_name, interest_id, users_username_token, community_id, community_id_profile)
})

// get bulletin
app.get("/getBulletin", user_auth_controller.tokenVerif, function(req, res){
    let community_id = req.query.community_id

    community_controller.getBulletin(req, res, community_id)
})

// tambah bulletin
app.post("/addBulletin", user_auth_controller.tokenVerif, function(req, res){
    let users_username_token = res.getHeader('users_username')
    let bulletin_title = req.body.bulletin_title
    let bulletin_body = req.body.bulletin_body
    let bulletin_id_picture = req.body.bulletin_id_picture
    let community_id = req.body.community_id

    community_controller.addBulletin(req, res, community_id, bulletin_title, bulletin_body, bulletin_id_picture, users_username_token)
})

// edit bulletin
app.patch("/editBulletin", user_auth_controller.tokenVerif, function (req, res) {
    let users_username_token = res.getHeader('users_username')
    let bulletin_title = req.body.bulletin_title
    let bulletin_body = req.body.bulletin_body
    let bulletin_id_picture = req.body.bulletin_id_picture
    let community_id = req.body.community_id
    let bulletin_id = req.body.bulletin_id
    
    community_controller.editBulletin(req, res, community_id, bulletin_title, bulletin_body, bulletin_id_picture, bulletin_id, users_username_token)
})

// delete bulletin
app.delete("/deleteBulletin", user_auth_controller.tokenVerif, function(req, res){
    let bulletin_id = req.body.bulletin_id
    let users_username_token = res.getHeader('users_username')
    let community_id = req.body.community_id

    community_controller.deleteBulletin(req, res, community_id, bulletin_id, users_username_token)

})

module.exports = app