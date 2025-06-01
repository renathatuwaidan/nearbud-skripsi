const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8888

// ROUTE LIST
const userAuthRoute = require('./route/route_user_authentication')
const generalRoute = require('./route/route_general')
const communityRoute = require('./route/route_community')
const eventRoute = require('./route/route_event')
const membershipRoute = require('./route/route_membership')

app.use(bodyParser.json())
app.use("/general", generalRoute)
app.use("/auth", userAuthRoute)
app.use("/community", communityRoute)
app.use("/event", eventRoute)
app.use("/membership", membershipRoute)

app.listen(port, ()=> console.log("Connected to port --> ", port))  