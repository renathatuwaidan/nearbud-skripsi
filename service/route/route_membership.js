const express = require('express')
const app = express()
const membership_controller = require("../controller/membership")
const user_auth_controller = require("../controller/user_authentication")

// tambahkan data untuk community_link
app.post("/addCommunityLink", user_auth_controller.tokenVerif, function(req, res){
    let community_id = req.body.community_id
    let users_username = res.getHeader('users_username')

    membership_controller.addCommunityLink(req, res, community_id, users_username)
})

// // get user yang terhubung dengan komunitas tertentu
app.get("/getCommunityMember", user_auth_controller.tokenVerif, function(req, res){
    let community_id = req.query.community_id
    
    membership_controller.getCommunityMember(req, res, community_id)
})

app.get("/getCommunity/preview",  user_auth_controller.tokenVerif, function(req, res){
    let users_id = req.query.users_id 
    let users_username_token = res.getHeader('users_username')
    let page = req.query.page
    let size = req.query.size

    membership_controller.getCommunity_preview(req, res, users_id, users_username_token, page, size)
})

// // mengupdate status isApprove user ke komunitas
app.put("/updateEventLink",  user_auth_controller.tokenVerif, function(req, res){
    let event_id = req.body.event_id
    let users_id = req.body.users_id
    let decision = req.body.decision

    membership_controller.updateEventLink(req, res, event_id, users_id, decision)
})

// // get user yang terhubung dengan event tertentu
app.get("/getEventLink", function(req, res){
    let users_id = req.query.users_id
    let users_username = req.query.users_username
    let event_id = req.query.event_id
    let isApproved = req.query.isApproved
    let page = req.query.page
    let size = req.query.size

    membership_controller.getEventLink(req, res, users_id, users_username, event_id, isApproved, page, size)
})

app.get("/getEvents/preview", user_auth_controller.tokenVerif, function(req, res){
    let users_id = req.query.users_id
    let community_id = req.query.community_id
    let status = req.query.status
    let users_username_token = res.getHeader('users_username')
    let page = req.query.page
    let size = req.query.size

    membership_controller.getEventLink_preview(req, res, users_id, community_id, status, users_username_token, page, size)
})

// // tambahkan data untuk event_link
app.post("/addEventLink",  user_auth_controller.tokenVerif, function(req, res){
    let users_id = req.body.users_id
    let event_id = req.body.event_id
    let users_username_token = res.getHeader('users_username')

    membership_controller.addEventLink(req, res, users_id, event_id, users_username_token)
})

// // menghapus koneksi antar user dan event
app.delete("/deleteEventLink", user_auth_controller.tokenVerif, function(req, res){
    let event_id = req.body.event_id
    let users_username_token = res.getHeader('users_username')

    membership_controller.deleteEventLink(req, res, event_id, users_username_token)
})

app.delete("/deleteCommunityLink", user_auth_controller.tokenVerif, function(req, res){
    let users_username_token = res.getHeader('users_username')
    let community_id = req.body.community_id

    membership_controller.deleteCommunityLink(req, res, community_id, users_username_token)
})

module.exports = app