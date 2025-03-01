const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const config = require("../config/general")

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

    var query_pagination = await exports.query_pagination(req,res, page)

    try { 
        var query_result = await pool.query(`SELECT * , COUNT (*) OVER () FROM USERS WHERE (USERNAME = '${username}' OR EMAIL = '${email}') ORDER BY ID_USER ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/checkExistUser [username : "${username}" | email : "${email}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount == 0){
                var total_query_data = query_result.rowCount

                await exports.successResp(req, res, "nearbud-000-000", "Username dan Email bisa digunakan", 0, total_query_data, page, "")
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

exports.registerUser = asyncHandler(async function registerUser(req, res, users_name, users_email, users_username, users_password, agree_tnc, users_dob, users_gender, province_name, city_name, users_description) {
    let isError = false
    
    //check Email Format
    if(users_email){
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        var emailValid = pattern.test(users_email) ? true : false
    
        if(!emailValid){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Email tidak dalam format yang sesuai (example : user@domain.com)`
                }
            })
        }
    }

    var query_pagination = await exports.query_pagination(req,res, 0)
    query_province_name = `(SELECT ID FROM PROVINCE WHERE NAME ILIKE LOWER('%${province_name}%'))`
    query_city_name = `(SELECT ID FROM CITY WHERE NAME ILIKE LOWER('%${city_name}%'))`

    try {
        var query_result = await pool.query(`INSERT INTO USERS (NAME, USERNAME, GENDER, DATE_OF_BIRTH, DESCRIPTION, EMAIL, PASSWORD, ID_PROVINCE, ID_CITY) 
        VALUES ('${users_name}','${users_username}','${users_gender}','${users_dob}','${users_description}','${users_email}','${users_password}',${query_province_name},${query_city_name})`)
    } catch (error) {
        console.log(error)
        isError = true
        log.error(`ERROR | /auth/registerUser [username : "${users_username}" | email : "${email}"] - Error found while connect to DB - ${error}`)
    } finally {
        console.log(query_result)
        if(!isError){
            var total_query_data = query_result.rowCount

            await exports.successResp(req, res, "nearbud-000-000", "Data user berhasil ditambahkan", 0, total_query_data, 0, "")
            log.info(`SUCCESS | /auth/registerUser [username : "${users_username}" | email : "${email}"] - Success return the result`)
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

exports.query_pagination = asyncHandler(async function query_pagination(req, res, page){
    let offset, req_query_pagination
    let pagination = config.base_response.pagination

    console.log(page)

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