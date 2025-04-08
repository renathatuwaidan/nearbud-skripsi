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

// // menghapus koneksi antar user dan komunitas
// app.delete("/community_link", function(req, res){})

// // mengupdate status isApprove user ke komunitas
// app.put("/community_link", function(req, res){})

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
// app.post("/event_link", function(req, res){})

// // menghapus koneksi antar user dan event
// app.delete("/event_link", function(req, res){})

// // mengupdate status isApprove user ke komunitas
// app.put("/event_link", function(req, res){})

module.exports = app