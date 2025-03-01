const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const config = require("../config/general")

exports.getProvince = asyncHandler(async function getProvince(req, res, name, page) {
    var result = []
    let isError = false, query_name = ""

    var query_pagination = await exports.query_pagination(req,res, page)

    if(name){
        query_name = ` WHERE NAME ILIKE LOWER('%${name}%')`
    }

    try {
        var query_result = await pool.query(`SELECT * , COUNT (*) OVER () FROM PROVINCE ${query_name} ORDER BY ID ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "name" : query_result.rows[i].name
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                exports.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
            } else {
                exports.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", total_data, total_query_data, page, result)
            }
            log.info(`SUCCESS | /general/getProvince - Success return the result`)
            
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

exports.getCity = asyncHandler(async function getCity(req, res, province_name, city_name, page) {
    var result = []
    let isError = false, query_province_name = "", query_city_name = ""

    var query_pagination = await exports.query_pagination(req,res, page)

    if(province_name){
        query_province_name = ` WHERE A.NAME ILIKE LOWER('%${province_name}%')`
        if(city_name){
            query_city_name = ` AND B.NAME ILIKE LOWER('%${city_name}%')`
        }
    } else {
        if(city_name){
            query_city_name = ` WHERE B.NAME ILIKE LOWER('%${city_name}%')`
        }
    }

    try {
        var query_result = await pool.query(`SELECT A.NAME AS PROVINCE_NAME, B.NAME AS CITY_NAME, COUNT (*) OVER () FROM PROVINCE A JOIN CITY B ON A.ID = B.ID_PROVINCE ${query_province_name} ${query_city_name} ORDER BY A.ID ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince [username : "${username}" | email : "${email}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "province_name" : query_result.rows[i].province_name,
                        "city_name" : query_result.rows[i].city_name
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                exports.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
            } else {
                exports.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", total_data, total_query_data, page, result)
            }
            log.info(`SUCCESS | /general/getCity - Success return the result`)

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

exports.getUser = asyncHandler(async function getUser(req, res, suspended, users_id, users_name, users_username, users_gender, category, interest, province, city, page) {
    let query_suspended, query_users_id = "", query_users_name = "", query_users_username = "", query_users_gender = ""
    let query_category = "", query_interest = "", query_province = "", query_city = "", isError = false, result = []
    let query_distinct = "", query_join_category = "", query_join_intrest = "", query_join_interest_1 = ""

    var query_pagination = await exports.query_pagination(req,res, page)
    
    if(suspended ==  'yes' || suspended == 'Yes' || suspended == 'YES'){
        query_suspended = `A.id_user IN (SELECT ID_REPORTEE FROM SUSPENDED)`
    } else {
        query_suspended = `A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED)`
    }

    if(users_id){
        query_users_id = ` AND A.ID_USER ILIKE LOWER('${users_id}')`
    } 

    if(users_username){
        query_users_username = ` AND A.USERNAME ILIKE LOWER('${users_username})`
    }

    if(users_name){
        query_users_name = ` A.NAME ILIKE LOWER('${users_id}')`
    }

    if(users_gender){
        query_users_gender = ` AND A.GENDER ILIKE LOWER('${users_gender}')`
    }

    if(category || interest){
        query_distinct = `DISTINCT `
        query_join_category = ` JOIN CATEGORY F ON E.id_category = F.id `
        query_join_intrest = ` JOIN INTEREST E ON D.id_interest = E.id `
        query_join_interest_1 = ` JOIN INTEREST_LINK D ON A.id_user = D.id_user `

        
        if(category){
            query_category = ` AND F.NAME ILIKE LOWER('${category}')`
        }
        
        if(interest){
            query_interest = ` AND E.NAME ILIKE LOWER('${interest}')`
        }

        query_get_total = `(SELECT COUNT(DISTINCT a.ID_USER) 
                            FROM USERS A
                            ${query_join_interest_1} ${query_join_intrest} ${query_join_category}
                            WHERE A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED)
                            ${query_category} ${query_interest}) AS COUNT`
    } else {
        query_get_total = `COUNT (*) OVER () AS COUNT`
    }


    if(province){
        query_province = ` AND B.NAME ILIKE LOWER('${province}')`
    }

    if(city){
        query_city = ` AND C.NAME ILIKE LOWER('${city}')`
    }

    try {
        var query_result = await pool.query(`SELECT 
                                                ${query_distinct} A.ID_USER, A.NAME, A.USERNAME, A.GENDER, A.DATE_OF_BIRTH, A.DESCRIPTION, A.EMAIL, A.GENDER,
                                                B.NAME AS PROVINCE_NAME, C.NAME AS CITY_NAME,
                                                CASE WHEN A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED) THEN 'No'
                                                ELSE 'Yes' END AS SUSPENDED,
                                                ${query_get_total}
                                            FROM USERS A JOIN PROVINCE B ON A.id_province = B.id
                                            JOIN CITY C ON A.id_city = C.id
                                            ${query_join_interest_1} ${query_join_intrest} ${query_join_category}
                                            WHERE ${query_suspended} ${query_users_id} ${query_users_name} ${query_users_username} ${query_users_gender} ${query_category} ${query_interest} ${query_province} ${query_city} ORDER BY A.ID_USER ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getUsers - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    
                    var dob = new Date(query_result.rows[i].date_of_birth)
                    var age = await exports.getAge(req, res, dob)

                    var result_interest = await exports.getUserInterestCategory(req, res, query_result.rows[i].id_user, category, interest)

                    var object = {
                        "users_id" : query_result.rows[i].id_user,
                        "users_name" : query_result.rows[i].name,
                        "users_username" : query_result.rows[i].username,
                        "users_gender" : query_result.rows[i].gender,
                        "users_dob" : query_result.rows[i].date_of_birth,
                        "users_age" :  age,
                        "users_description" : query_result.rows[i].description,
                        "users_email" : query_result.rows[i].email,
                        "users_gender" : query_result.rows[i].users_gender,
                        "users_suspended" : query_result.rows[i].suspended,
                        "province_name" : query_result.rows[i].province_name,
                        "city_name" : query_result.rows[i].city_name,
                        "category-interest" : result_interest
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                if(category || interest){
                    exports.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
                } else {
                    exports.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
                }

            } else {
                exports.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", total_data, total_query_data, page, result)
            }
            log.info(`SUCCESS | /general/getUser - Success return the result`)

        } else{
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-003-001",
                    "error_message" : `Error while connecting to DB`
                }
            })
        }
    }

})

exports.getUserInterestCategory = asyncHandler(async function getUserInterestCategory(req, res, users_id_user, category, interest) {
    let result = [], isError = false, query_interest = "", query_category = ""

    if(category){
        query_category = ` AND F.NAME ILIKE LOWER('${category}')`
    }

    if(interest){
        query_interest = ` AND E.NAME ILIKE LOWER('${interest}')`
    }

    try {
        var query_result = await pool.query(`SELECT F.ID AS CATEGORY_ID, F.NAME AS CATEGORY_NAME, E.ID AS INTEREST_ID, E.NAME AS INTEREST_NAME
                                            FROM USERS A 
                                            JOIN INTEREST_LINK D ON A.id_user = D.id_user
                                            JOIN INTEREST E ON D.id_interest = E.id
                                            JOIN CATEGORY F ON E.id_category = F.id
                                            WHERE A.ID_USER = '${users_id_user}' ${query_category} ${query_interest}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getUsers/getUserInterestCategory - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "category_id" : query_result.rows[i].category_id,
                        "category_name" : query_result.rows[i].category_name,
                        "interest_id" : query_result.rows[i].interest_id,
                        "interest_name" : query_result.rows[i].interest_name
                    }

                    result.push(object)
                }
            }
            return result //undone
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

exports.getAge = asyncHandler(async function getAge(req, res, dob) {
    let today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    let monthDiff = today.getMonth() - dob.getMonth();
    let dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age
})

exports.getInterestCateory = asyncHandler(async function getInterestCateory(req, res, interest_name, category_name, page) {
    let query_interest = "", query_category = "", query_where = "", isError = false, result = []
    var query_pagination = await exports.query_pagination(req,res, page)

    if(interest_name){
        query_interest = ` A.NAME ILIKE LOWER('${interest_name}')`
    }

    if(category_name){
        query_category = ` B.NAME ILIKE LOWER('${category_name}')`
    }

    if(interest_name && category_name){
        query_where = `WHERE ${query_interest} AND ${query_category}`
    } else if (interest_name || category_name){
        query_where = `WHERE ${query_interest} ${query_category}`
    }

    try {
        var query_result = await pool.query(`SELECT A.ID AS ID_INTEREST, A.NAME AS INTEREST_NAME,
                                            B.ID AS ID_CATEGORY, B.NAME AS CATEGORY_NAME, COUNT (*) OVER ()
                                            FROM INTEREST A JOIN CATEGORY B ON A.id_category = B.id ${query_where} ORDER BY A.ID ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getInterest - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){    
                    var object = {
                        "category_id" : query_result.rows[i].id_category,
                        "category_name" : query_result.rows[i].category_name,
                        "interest_id" : query_result.rows[i].id_interest,
                        "interest_name" : query_result.rows[i].interest_name
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                exports.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
            } else {
                exports.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", total_data, total_query_data, page, result)
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

    if(total_data < config.base_response.pagination || total_data == undefined){
        if(total_data == undefined || total_data == 0){
            total_data = parseInt(0)
            total_data_per_page = parseInt(0)
            total_page = 0
        }
        else {
            total_data_per_page = total_query_data
            total_page = parseInt(1)
        }
    }  else {
        current_page = parseInt(page)
        total_data_per_page = config.base_response.pagination
        total_page = parseInt(Math.ceil(total_data / config.base_response.pagination))

        if(page > total_page){
            total_data = parseInt(0)
            total_data_per_page = parseInt(0)
            total_page = parseInt(0)
        }
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