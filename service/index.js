const express = require('express')
const app = express()

const port = 8888

//route list
const registrationRoute = require('./route/registration')

app.use("/registration", registrationRoute)

app.listen(port, ()=> console.log("Connected to port --> ", port))