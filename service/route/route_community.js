const express = require('express')
const app = express()
const community_controller = require("../controller/community")

// get semua community yang ada

app.get("/getCommunity", function(req, res){
    let community_id = req.query.community_id
    let community_name = req.query.community_name
    let interest = req.query.interest
    let category = req.query.category
    let interest_id1 = req.query.interest_id1
    let interest_id2 = req.query.interest_id2 
    let interest_id3 = req.query.interest_id3 

    general_controller.getCommunity(req, res, community_id, community_name, interest, category, interest_id1, interest_id2, interest_id3)
}), 

// tambahkan data event
app.post("/addEvent", function(req, res){})

// meng-disable event exisitng (NEED TO DISCUSS)
app.patch("/deleteEvent", function(req, res){})

// mengupdate event existing
app.put("/updateEvent", function(req, res){})


// get bulletin

// tambah bulletin

// edit bulletin

// delete bulletin



module.exports = app