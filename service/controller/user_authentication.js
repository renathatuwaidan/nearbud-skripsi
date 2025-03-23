const asyncHandler = require("express-async-handler")
const jwt = require('jsonwebtoken')
const pool = require("../config/database")
const config = require("../config/general")
const log = require("../utils/logger")
const utility = require("./utility")
const general = require('./general')

exports.registerUser = asyncHandler(async function registerUser(req, res, users_name, users_email, users_username, users_password, agree_tnc) {
    let isError = false

    if(!utility.emailValidation(users_email)){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-001",
                "error_message" : `Email tidak dalam format yang sesuai (example : user@domain.com)`
            }
        })
    }

    try {
        var query_result = await pool.query(`INSERT INTO USERS (NAME, USERNAME, EMAIL, PASSWORD) 
        VALUES ('${utility.toTitleCase(users_name)}','${users_username.toLowerCase()}','${users_email}','${users_password}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/registerUser [username : "${users_username}" | email : "${users_email}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            token = jwt.sign({users_username, users_password}, config.auth.secretKey, {expiresIn : '30d'})

            await exports.successResp(req, res, "nearbud-000-000", "Data user berhasil ditambahkan", 0, query_result.rowCount, 0, token)
            log.info(`SUCCESS | /auth/registerUser [username : "${users_username}" | email : "${users_email}"] - Success return the result`)
        } else {
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-003-001",
                    "error_message" : `Error while connecting to DB`
                }
            })
        }
    }
})

exports.registerUser_optional = asyncHandler(async function registerUser_optionalregisterUser_optional(req, res, users_dob, users_gender, province_name, city_name, users_description, users_interest, users_community, users_username) {
    let isError = false
    var query_users_dob = "", query_users_gender = "", query_province_name = "", query_city_name = "", query_users_description = ""

    if(users_dob){
        if(!utility.dobValidation(users_dob)){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Date of Birth tidak dalam format yang sesuai (example : yyyy-mm-dd)`
                }
            })
        } else {
            query_users_dob = `,DATE_OF_BIRTH = '${users_dob}'`
        }
    }

    if(users_gender){
        if(!utility.genderValidation(users_gender)){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Gender tidak dalam format yang sesuai (example : F/M)`
                }
            })
        } else {
            query_users_gender = `,GENDER='${users_gender.toUpperCase()}'`
        }
    }

    if(users_description){
        query_users_description = `,DESCRIPTION = '${users_description}'`
    }
    
    if(province_name){
        query_province_name = `,ID_PROVINCE = (SELECT ID FROM PROVINCE WHERE NAME ILIKE LOWER('%${province_name}%'))`
    }

    if(city_name){
        query_city_name = `,ID_CITY = (SELECT ID FROM CITY WHERE NAME ILIKE LOWER('%${city_name}%'))`
    }

    if(city_name || province_name || users_description || users_gender || users_dob){
        var query_users_username = `WHERE USERNAME ILIKE LOWER('${users_username}')`

        try {
            var query_result = await pool.query(`UPDATE USERS SET MODIFIED = NOW() ${query_users_dob} ${query_users_gender} ${query_users_description} 
                                ${query_province_name} ${query_city_name} ${query_users_username}`)
        } catch (error) {
            isError = true
            log.error(`ERROR | /auth/registerUser [username : "${users_username}"] - Error found while connect to DB - ${error}`)
        } finally {
            if(isError){
                return res.status(500).json({
                    "error_schema" : {
                        "error_code" : "nearbud-003-001",
                        "error_message" : `Error while connecting to DB`
                    }
                })
            } 
        }
    }
    
    for (const item of users_interest) {
        await general.putInterestLink(req, res, users_username_token, item.interest_id)
    }

    for (const item of users_community) {
        let isError1 = false
        try {
            var query_result = await pool.query(`
                INSERT INTO COMMUNITY_LINK(ID, ID_COMMUNITY, ID_USER) VALUES 
                (
                    (SELECT MAX(id) + 1 FROM COMMUNITY_LINK), 
                    (SELECT ID_COMMUNITY FROM COMMUNITY WHERE NAME ILIKE LOWER('${item.community_name}')), 
                    (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username}'))
                )
            `);
        } catch (error) {
            isError1 = true;
            log.error(`ERROR | /auth/registerUser/optional - INSERT COMMUNITY [username : "${users_username}"] - Error found while connecting to DB - ${error}`);
        } finally {
            if (isError1) {
                return res.status(500).json({
                    "error_schema": {
                        "error_code": "nearbud-003-001",
                        "error_message": `Error while connecting to DB - Failed to Update Community Link`
                    }
                });
            }
        }
    }

    await exports.successResp(req, res, "nearbud-000-000", "Data user berhasil ditambahkan", 0, 0, 0, "")
    log.info(`SUCCESS | /auth/registerUser/optional [username : "${users_username}"] - Success return the result`)
})

exports.loginUser = asyncHandler(async function loginUser(req, res, users_username, users_password) {
    let isError = false

    if(!users_username){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-000",
                "error_message" : `Username tidak boleh kosong`
            }
        })
    }

    if(!users_password){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-000",
                "error_message" : `Password tidak boleh kosong`
            }
        })
    }

    let query_username = `USERNAME ILIKE LOWER('%${users_username}%')`
    let query_password = `PASSWORD ILIKE LOWER('%${users_password}%')`

    try {
        var query_result = await pool.query(`SELECT * FROM USERS WHERE ${query_username} AND ${query_password}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/loginUser [username : "${users_username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount == 0){
                return res.status(401).json({
                    "error_schema" : {
                        "error_code" : "nearbud-002-001",
                        "error_message" : `Unauthorized access to this source`
                    }
                })
            } else {
                token = jwt.sign({users_username, users_password}, config.auth.secretKey, {expiresIn : '30d'})

                await exports.successResp(req, res, "nearbud-000-000", "Login berhasil", 0, query_result.rowCount, 0, token)
                log.info(`SUCCESS [username : "${users_username}"] - Success return the result`)
            }

        } else {
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-003-001",
                    "error_message" : `Error while connecting to DB`
                }
            })
        }
    }
})

exports.tokenVerif = asyncHandler(async function tokenVerif(req, res, next) {
    const bearerToken = req.headers.authorization
    const generatedToken = bearerToken.split(" ")[1]

    var isError = false, token

    try {
        token = jwt.verify(generatedToken, config.auth.secretKey)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/verifyToken [username : "${users_username}"] - Error found - ${error}`)
    } finally {
        if(isError){
            return res.status(401).json({
                "error_schema" : {
                    "error_code" : "nearbud-002-001",
                    "error_message" : `Unauthorized inserted token`
                }
            })
        } else {
            res.setHeader('token', generatedToken)
            res.setHeader('users_username', token.users_username)
            next()
        }
    }
})

exports.checkExistedUser = asyncHandler(async function checkExistedUser(req, res, username, email, page) {
    let isError = false

    if(!username) {
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-000",
                "error_message" : `Username tidak boleh kosong`
            }
        })
    }
    if(!email) {
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-000",
                "error_message" : `Email tidak boleh kosong`
            }
        })
    }

    try { 
        var query_result = await pool.query(`SELECT * , COUNT (*) OVER () FROM USERS WHERE (USERNAME = '${username}' OR EMAIL = '${email}') ORDER BY ID_USER ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/checkExistUser [username : "${username}" | email : "${email}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount == 0){
                await exports.successResp(req, res, "nearbud-000-000", "Username dan Email bisa digunakan", 0, query_result.rowCount, page, "")
                log.info(`SUCCESS [username : "${username}" | email : "${email}"] - Success return the result`)
            } else {
                for(let i = 0; i < query_result.rowCount; i++){
                    res_username = query_result.rows[i].username
                    res_email = query_result.rows[i].email

                    if(username == res_username){
                        return res.status(500).json({
                            "error_schema" : {
                                "error_code" : "nearbud-000-001",
                                "error_message" : `Username sudah digunakan`
                            }
                        })
                    }else if(email == res_email){
                        return res.status(500).json({
                            "error_schema" : {
                                "error_code" : "nearbud-000-001",
                                "error_message" : `Email sudah digunakan`
                            }
                        })
                    }
                }
            }
        } else {
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-003-001",
                    "error_message" : `Error while connecting to DB`
                }
            })
        }
    }
})

exports.updatePassword = asyncHandler(async function updatePassword(req, res, old_pass, new_pass, users_username){
    
})

exports.query_pagination = asyncHandler(async function query_pagination(req, res, page){
    let offset, req_query_pagination
    let pagination = config.base_response.pagination

    if(page){
        offset = parseInt(pagination * (page-1))
    } else {
        offset = parseInt(0)
    }

    req_query_pagination = ` LIMIT ${pagination} OFFSET ${offset}`
    return req_query_pagination 
})

exports.successResp = asyncHandler (async function successResp(req, res, error_code, error_message, total_data, total_query_data, page, result) {
    var current_page, total_page, total_data_per_page

    if(total_query_data < config.base_response.pagination || total_query_data == undefined){
        total_data_per_page = total_query_data
        total_page = parseInt(1)

        if(total_data == undefined || total_data == 0){
            total_data = parseInt(0)
            total_data_per_page = parseInt(0)
            total_page = 0
        }

    } else {
        current_page = parseInt(page)
        total_data_per_page = config.base_response.pagination
        total_page = parseInt(Math.ceil(total_data / config.base_response.pagination))
    }

    if(total_page != 0 && page != undefined){
        current_page = parseInt(page)
    } else if (total_page != 0 && page == undefined) {
        current_page = parseInt(1)
    }else {
        current_page = parseInt(0)
    }

    var default_response = {
        "error_schema" : {
            "error_code" : error_code,
            "error_message" : error_message
        },
        "output_schema" : {
            "pagination" : {
                "current_page" : current_page,
                "total_page" : total_page,
                "total_data_per_page" : total_data_per_page,
                "total_data" : total_data
            },
            result      
        }
    }

    return res.status(200).json(default_response)
})