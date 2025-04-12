const asyncHandler = require("express-async-handler")
const jwt = require('jsonwebtoken')
const pool = require("../config/database")
const config = require("../config/general")
const log = require("../utils/logger")
const utility = require("./utility")
const general = require('./general')
const nodemailer = require("nodemailer")

exports.reqForgetPassword = asyncHandler(async function reqForgetPassword(req, res, users_email) {
    let isError = false

    if(!users_email){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-001",
                "error_message" : `Email tidak dalam format yang sesuai (example : user@domain.com)`
            }
        })
    } else {
        if(!utility.emailValidation(users_email)){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Email tidak dalam format yang sesuai (example : user@domain.com)`
                }
            })
        }
    }

    try {
        var query_result = await pool.query(`select * from users where email ILIKE LOWER('${users_email}') and is_verified = 'true'`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/reqForgetPassword [email : "${users_email}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0){
                const otp = utility.generateOtp()
                await exports.transporterEmail(otp, users_email, "forget_password")

                try {
                    var query_result = await pool.query(`UPDATE users SET MODIFIED = NOW() AT TIME ZONE 'Asia/Jakarta',  OTP = '${otp}', OTP_CREATED = NOW() AT TIME ZONE 'Asia/Jakarta' where email ILIKE LOWER('${users_email}')`)
                } catch (error) {
                    isError = true
                    log.error(`ERROR | /auth/reqForgetPassword [email : "${users_email}"] - Error found while connect to DB - ${error}`)
                } 
                
                await exports.successResp(req, res, "nearbud-000-000", "OTP sudah dikirimkan melalui Email", 0, query_result.rowCount, 0, [])
            } else {
                return res.status(401).json({
                    "error_schema" : {
                        "error_code" : "nearbud-000-001",
                        "error_message" : `Data User dengan Email dan OTP tersebut tidak ditemukan`
                    }
                })
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

exports.resetPassword = asyncHandler(async function resetPassword(req, res, users_email, newPassword){
    let isError1 = false

    try {
        var query_result = await pool.query(`UPDATE users SET MODIFIED = NOW() AT TIME ZONE 'Asia/Jakarta', PASSWORD = '${newPassword}' where email ILIKE LOWER('${users_email}') AND otp_created > NOW() AT TIME ZONE 'Asia/Jakarta' - INTERVAL '10 minutes'`)
    } catch (error) {
        isError1 = true
        log.error(`ERROR | /auth/resetPassword [username : "${users_username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError1){
            await exports.successResp(req, res, "nearbud-000-000", "Password telah diperbaharui", 0, query_result.rowCount, 0, [])
        }
    }
})

exports.verifyOtpEmail = asyncHandler(async function verifyOtpEmail(req, res, users_email, otp, process){
    let isError = false

    if(!process || !users_email || !otp){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-002",
                "error_message" : `Data pada BODY tidak lengkap`
            }
        })
    }
    
    try {
        var query_result = await pool.query(`select 
                                                CASE WHEN  otp_created < NOW() AT TIME ZONE 'Asia/Jakarta' - INTERVAL '10 minutes' THEN 'Expired' 
                                                ELSE 'Not Expired' END AS isExpired,
                                                username, 
                                                password
                                            from users where email ILIKE LOWER('${users_email}') and otp = '${otp}'`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/registerUser [username : "${users_username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0){
                if(query_result.rows[0].isExpired == 'Expired'){
                    return res.status(401).json({
                        "error_schema" : {
                            "error_code" : "nearbud-001-001",
                            "error_message" : `Token sudah expired`
                        }
                    })
                } else {
                    if(process == "register") {
                        let isError1 = false
                        const users_username = query_result.rows[0].username
                        const users_password = query_result.rows[0].password
                        token = jwt.sign({users_username, users_password}, config.auth.secretKey, {expiresIn : config.auth.tokenExpired})
    
                        try {
                            var query_result = await pool.query(`UPDATE users SET MODIFIED = NOW() AT TIME ZONE 'Asia/Jakarta', IS_VERIFIED = true where email ILIKE LOWER('${users_email}') and otp = '${otp}'`)
                        } catch (error) {
                            isError1 = true
                            log.error(`ERROR | /auth/registerUser - register [username : "${users_username}"] - Error found while connect to DB - ${error}`)
                        } finally {
                            if(!isError1){
                                await exports.successResp(req, res, "nearbud-000-000", "Email terverifikasi", 0, query_result.rowCount, 0, token)
                            }
                        }
                        
                    } else {
                        return res.status(200).json({
                            "error_schema" : {
                                "error_code" : "nearbud-000-000",
                                "error_message" : `Token terverifikasi`
                            }
                        })
                    }
                }
            } else {
                return res.status(401).json({
                    "error_schema" : {
                        "error_code" : "nearbud-000-001",
                        "error_message" : `Data User dengan Email dan OTP tersebut tidak ditemukan`
                    }
                })
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

exports.registerUser = asyncHandler(async function registerUser(req, res, users_name, users_email, users_username, users_password, agree_tnc, users_dob) {
    let isError = false, result = [], query =""

    
    if(!users_dob){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-001",
                "error_message" : `Date of Birth tidak dalam format yang sesuai (example : yyyy-mm-dd)`
            }
        })
    } else {
        if(!utility.insertDateValidation(users_dob)){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Date of Birth tidak dalam format yang sesuai (example : yyyy-mm-dd)`
                }
            })
        }
    }
    
    const otp = utility.generateOtp()
    
    if(!utility.emailValidation(users_email)){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-001",
                "error_message" : `Email tidak dalam format yang sesuai (example : user@domain.com)`
            }
        })
    } else {
        let validUser = await exports.checkExistedUser(users_username, users_email)
        console.log(validUser)
        if(!validUser){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-000-001",
                    "error_message" : `Username atau email sudah digunakan`
                }
            })
        }
        if(validUser == "update_user"){
            query = `UPDATE USERS SET OTP = ${otp}, OTP_CREATED = NOW() AT TIME ZONE 'Asia/Jakarta'`
        } else if(validUser == true) {
            query = `INSERT INTO USERS (NAME, USERNAME, EMAIL, PASSWORD, DATE_OF_BIRTH, IS_VERIFIED, OTP, CREATED, OTP_CREATED) 
                    VALUES ('${utility.toTitleCase(users_name)}','${users_username.toLowerCase()}','${users_email.toLowerCase()}','${users_password}', '${users_dob}', 'false', ${otp}, NOW() AT TIME ZONE 'Asia/Jakarta', NOW() AT TIME ZONE 'Asia/Jakarta')`
        }
    }

    try {
        var query_result = await pool.query(query)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/registerUser [username : "${users_username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            //sendEmail
            console.log("masuk sini")
            await exports.transporterEmail(otp, users_email, "register")

            exports.successResp(req, res, "nearbud-000-000", "Data user berhasil ditambahkan", 0, query_result.rowCount, 0, result)
            log.info(`SUCCESS | /auth/registerUser [username : "${users_username}"] - Success return the result`)
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

exports.registerUser_optional = asyncHandler(async function registerUser_optionalregisterUser_optional(req, res, users_gender, province_name, city_name, users_description, users_interest, users_community, users_username) {
    let isError = false
    var query_users_gender = "", query_province_name = "", query_city_name = "", query_users_description = ""

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

    if(city_name || province_name || users_description || users_gender){
        var query_users_username = `WHERE USERNAME ILIKE LOWER('${users_username}')`

        try {
            var query_result = await pool.query(`UPDATE USERS SET MODIFIED = NOW() AT TIME ZONE 'Asia/Jakarta' ${query_users_gender} ${query_users_description} 
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
    
    if(users_interest){
        for (const item of users_interest) {
            await general.putInterestLink(req, res, users_username, item.interest_id)
        }
    }

    if(users_community){
        for (const item of users_community) {
            let isError1 = false
            try {
                var query_result = await pool.query(`
                    INSERT INTO COMMUNITY_LINK(ID, ID_COMMUNITY, ID_USER, CREATED) VALUES 
                    (
                        (SELECT MAX(id) + 1 FROM COMMUNITY_LINK), 
                        (SELECT ID_COMMUNITY FROM COMMUNITY WHERE NAME ILIKE LOWER('${item.community_name}')), 
                        (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username}')),
                        NOW() AT TIME ZONE 'Asia/Jakarta'
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
        var query_result = await pool.query(`SELECT * FROM USERS WHERE ${query_username} AND ${query_password} AND IS_VERIFIED = true`)
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
                token = jwt.sign({users_username, users_password}, config.auth.secretKey, {expiresIn : config.auth.tokenExpired})
            
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
    if (!bearerToken || !bearerToken.includes(" ")) {
        return res.status(401).json({
            "error_schema" : {
                "error_code" : "nearbud-002-001",
                "error_message" : `Unauthorized, no insert token found`
            }
        })
    }
    const generatedToken = bearerToken.split(" ")[1]
    var isError = false, token

    try {
        token = jwt.verify(generatedToken, config.auth.secretKey)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/verifyToken - Error found - ${error}`)
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

exports.isTokenValid = asyncHandler(async function isTokenValid(req, res, users_username_token, token) {
    var isError = false, token

    try {
        token = jwt.verify(token, config.auth.secretKey)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/verifyToken [username : "${users_username_token}"] - Error found - ${error}`)
    } finally {
        console.log(token)
        if(isError){
            return res.status(401).json({
                "error_schema" : {
                    "error_code" : "nearbud-002-001",
                    "error_message" : `Unauthorized inserted token`
                }
            })
        } else {
            return res.status(200).json({
                "error_schema" : {
                    "error_code" : "nearbud-000-000",
                    "error_message" : `Token valid`
                }
            })
        }
    }
})

exports.checkExistedUser = asyncHandler(async function checkExistedUser(username, email) {
    let isError = false
    if(!username || !email) {
        return false
    }

    try { 
        var query_result = await pool.query(`SELECT is_verified, COUNT (*) OVER () FROM USERS WHERE (USERNAME = '${username}' OR EMAIL = '${email}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /auth/registerUser - checkExistUser [username : "${username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            console.log(query_result.rows)
            if(query_result.rowCount == 0){
                return true
            } else {
                if(query_result.rows[0].is_verified == true){
                    return false
                } else {
                    return "update_user"
                }
            }
        } else {
            return false
        }
    }
})

exports.transporterEmail = function transporterEmail(otp, email, purpose){
    let subject  ="", message = ""

    const transporter = nodemailer.createTransport({
        host: config.auth_email.mail_host,
        port: config.auth_email.mail_port,
        auth: {
            user: config.auth_email.mail_user,
            pass: config.auth_email.mail_password
        }
    })

    if(purpose == "register"){
        subject = 'OTP Email Registration Verification for Nearbud'
        message = 
            `<div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Welcome to Nearbud!</h2>
                <p>To complete your registration, please use the verification code below:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #1a73e8;">
                    ${otp}
                </div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <br/>
                <p>Thanks,<br/>The Nearbud Team</p>
            </div>`
    } else if(purpose == "forget_password"){
        subject = 'OTP Password Reset Request for Nearbud'
        message =   
            `<div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your Nearbud account password.</p>
                <p>To proceed, please use the one-time password (OTP) below:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #1a73e8;">
                ${otp}
                </div>
                <p>This code will expire in <strong>15 minutes</strong>.</p>
                <p>If you didn’t request a password reset, you can safely ignore this email or contact support.</p>
                <br/>
                <p>Thanks,<br/>The Nearbud Team</p>
            </div>`
    }

    const mailOptions = {
        from: config.auth_email.mail_user,
        to: email,
        subject: subject,
        html: message,
    }
    transporter.sendMail(mailOptions)
}

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