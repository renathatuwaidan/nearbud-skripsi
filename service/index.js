const express = require('express')
const bodyParser = require('body-parser')
const asyncHandler = require('express-async-handler')
const app = express()
const port = 8888

// ROUTE LIST
const userAuthRoute = require('./route/route_user_authentication')
const generalRoute = require('./route/route_general')

app.use(bodyParser.json())
app.use("/auth", userAuthRoute)
app.use("/general", generalRoute)

app.listen(port, ()=> console.log("Connected to port --> ", port))  