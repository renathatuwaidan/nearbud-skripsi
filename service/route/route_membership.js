const express = require('express')
const app = express()
const membership_controller = require("../controller/membership")
const user_auth_controller = require("../controller/user_authentication")

// tambahkan data untuk community_link
app.post("/addCommunityLink", user_auth_controller.tokenVerif, function(req, res){
    let community_id = req.body.community_id
    let users_username = res.getHeader('users_username')

    membership_controller.add_communityLink(req, res, community_id, users_username)
})

// // get user yang terhubung dengan komunitas tertentu
// app.get("/community_link", function(req, res){})

// // menghapus koneksi antar user dan komunitas
// app.delete("/community_link", function(req, res){})

// // mengupdate status isApprove user ke komunitas
// app.put("/community_link", function(req, res){})

// // get user yang terhubung dengan event tertentu
app.get("/event_link", function(req, res){
    let users_id = req.query.users_id
    let users_username = req.query.users_username
    let event_id = req.query.event_id
    let isApproved = req.query.isApproved
})

// // tambahkan data untuk event_link
// app.post("/event_link", function(req, res){})

// // menghapus koneksi antar user dan event
// app.delete("/event_link", function(req, res){})

// // mengupdate status isApprove user ke komunitas
// app.put("/event_link", function(req, res){})

module.exports = app