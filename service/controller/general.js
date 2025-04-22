const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const utility = require("./utility")
const respond = require('./respond')

exports.getProvince = asyncHandler(async function getProvince(req, res, province_id, province_name, page, size) {
    var result = []
    let isError = false, query_province_id = "", query_province_name = "", query_where = ""

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(province_id || province_name) query_where = "WHERE"

    if(province_id){
        query_province_id = `ID = ${province_id}`

        if(province_name){
            query_province_name = `AND NAME ILIKE LOWER('%${province_name}%')`
        }
    } else {
        if(province_name){
            query_province_name = `AND NAME ILIKE LOWER('%${province_name}%')`
        }
    }

    try {
        var query_result = await pool.query(`SELECT * , COUNT (*) OVER () FROM PROVINCE ${query_where} ${query_province_id} ${query_province_name} ORDER BY ID ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "province_id" : query_result.rows[i].id,
                        "province_name" : query_result.rows[i].name
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result, size)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
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

exports.getCity = asyncHandler(async function getCity(req, res, province_id, province_name, city_id, city_name, page, size){
    var result = []
    let isError = false, query_province_name = "", query_province_id = "", query_city_name = "", query_city_id = "", query_where = ""

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(province_id || province_name || city_id || city_name) {
        query_where = `WHERE`

        if(province_id){
            query_province_id = `A.ID = ${province_id}`
    
            if(province_name){
                query_province_id = `AND A.NAME ILIKE LOWER('%${province_name}%')`
            } 
    
            if(city_id){
                query_city_id = `AND B.ID = ${city_id}`
            }
    
            if(city_name){
                query_city_name = `AND B.NAME ILIKE LOWER('%${city_name}%')`
            }
        } else {
            if(province_name){
                query_province_id = `A.NAME ILIKE LOWER('%${province_name}%')`
    
                if(city_id){
                    query_city_id = `AND B.ID = ${city_id}`
                }
        
                if(city_name){
                    query_city_name = `AND B.NAME ILIKE LOWER('%${city_name}%')`
                }
            } else {
                if(city_id){
                    query_city_id = `B.ID = ${city_id}`
    
                    if(city_name){
                        query_city_name = `AND B.NAME ILIKE LOWER('%${city_name}%')`
                    } 
                } else {
                    query_city_name = `B.NAME ILIKE LOWER('%${city_name}%')`
                }
            }
        }
    }
    try {
        var query_result = await pool.query(`SELECT A.ID AS PROVINCE_ID, A.NAME AS PROVINCE_NAME, B.ID AS CITY_ID, B.NAME AS CITY_NAME, COUNT (*) OVER () FROM PROVINCE A JOIN CITY B ON A.ID = B.ID_PROVINCE ${query_where} ${query_province_id} ${query_province_name} ${query_city_id} ${query_city_name} ORDER BY A.ID ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince [username : "${username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "province_id" : query_result.rows[i].city_id,
                        "province_name" : query_result.rows[i].province_name,
                        "city_id" : query_result.rows[i].city_id,
                        "city_name" : query_result.rows[i].city_name
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result, size)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
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

exports.getUser = asyncHandler(async function (req, res, suspended, users_id, users_name, users_username, users_gender, category, province, interest_id1, interest_id2, 
    interest_id3, interest_id4, interest_id5, city_id1, city_id2, city_id3, city_id4, city_id5, page, size) {
    let query_suspended, query_users_id = "", query_users_name = "", query_users_username = "", query_users_gender = ""
    let query_category = "", query_interest = "", query_province = "", query_city = "", isError = false, result = []
    let query_join_intrest_link = ""

    var query_pagination = respond.query_pagination(req,res, page, size)
    
    if(suspended ==  'yes' || suspended == 'Yes' || suspended == 'YES'){
        query_suspended = `A.id_user IN (SELECT ID_REPORTEE FROM SUSPENDED)`
    } else {
        query_suspended = `A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED)`
    }

    if(users_id){
        query_users_id = ` AND A.ID_USER ILIKE LOWER('${users_id}')`
    } 

    if(users_username){
        query_users_username = ` AND A.USERNAME ILIKE LOWER('${users_username}')`
    }

    if(users_name){
        query_users_name = ` A.NAME ILIKE LOWER('${users_id}')`
    }

    if(users_gender){
        query_users_gender = ` AND A.GENDER ILIKE LOWER('${users_gender}')`
    }

    if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
        if(city_id1) {city_id1 = `'${city_id1}'`} else {city_id1 = ''}
        if(city_id2) {city_id2 = `,'${city_id2}'`} else {city_id2 = ''}
        if(city_id3) {city_id3 = `,'${city_id3}'`} else {city_id3 = ''}
        if(city_id4) {city_id4 = `,'${city_id4}'`} else {city_id4 = ''}
        if(city_id5) {city_id5 = `,'${city_id5}'`} else {city_id5 = ''}

        query_city = ` AND ID_CITY IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
    }

    if(province){
        query_province = ` AND A.ID_PROVINCE IN (SELECT ID FROM PROVINCE ILIKE LOWER('%${province}%'))`
    }

    // KALO ADA CATERGORY ATAU INTEREST
    if(category || interest_id1 || interest_id2 || interest_id3 || interest_id4 || interest_id5){
        query_join_intrest_link = `JOIN INTEREST_LINK B ON A.ID_USER = B.ID_USER
                                    JOIN INTEREST C ON B.ID_INTEREST = C.ID
                                        JOIN CATEGORY D ON C.id_category = D.ID`

        if(category){
            query_category = ` AND D.NAME ILIKE LOWER('${category}')`
        }
        
        if(interest_id1 || interest_id2 || interest_id3 || interest_id4 || interest_id5){
            if(interest_id1) {interest_id1 = `'${interest_id1}'`} else {interest_id1 = ''}
            if(interest_id2) {interest_id2 = `,'${interest_id2}'`} else {interest_id2 = ''}
            if(interest_id3) {interest_id3 = `,'${interest_id3}'`} else {interest_id3 = ''}
            if(interest_id4) {interest_id4 = `,'${interest_id4}'`} else {interest_id4 = ''}
            if(interest_id5) {interest_id5 = `,'${interest_id5}'`} else {interest_id5 = ''}

            query_interest = ` AND B.ID_INTEREST IN (${interest_id1} ${interest_id2} ${interest_id3} ${interest_id4} ${interest_id5})`
        }
    } else {
        query_join_intrest_link = `LEFT JOIN INTEREST_LINK B ON A.ID_USER = B.ID_USER`
    }

    console.log(`
        WITH USER_QUERY AS (
            SELECT DISTINCT (A.ID_USER), A.NAME, A.USERNAME, A.ID_PROFILE,
                CASE WHEN (SELECT NAME FROM PROVINCE WHERE ID = A.ID_PROVINCE) IS NOT NULL THEN (SELECT NAME FROM PROVINCE WHERE ID = A.ID_PROVINCE)
                ELSE null END AS PROVINCE_NAME,
                CASE WHEN (SELECT NAME FROM CITY WHERE ID = A.ID_CITY) IS NOT NULL THEN (SELECT NAME FROM CITY WHERE ID = A.ID_CITY)
                ELSE null END AS CITY_NAME,
                CASE 
                    WHEN A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED) THEN 'No'
                    ELSE 'Yes' 
                END AS SUSPENDED
            FROM USERS A 
            ${query_join_intrest_link}   
            WHERE ${query_suspended} ${query_users_id} ${query_users_name} ${query_users_username} ${query_users_gender} 
            ${query_category} ${query_interest} ${query_province} ${query_city} AND IS_VERIFIED = 'TRUE'
        )
        SELECT *, 
            COUNT(*) OVER() AS TOTAL_DATA
        FROM USER_QUERY
        ORDER BY ID_USER
        ${query_pagination}`)

    try {
        var query_result = await pool.query(`
            WITH USER_QUERY AS (
                SELECT DISTINCT (A.ID_USER), A.NAME, A.USERNAME, A.ID_PROFILE,
                    CASE WHEN (SELECT NAME FROM PROVINCE WHERE ID = A.ID_PROVINCE) IS NOT NULL THEN (SELECT NAME FROM PROVINCE WHERE ID = A.ID_PROVINCE)
                    ELSE null END AS PROVINCE_NAME,
                    CASE WHEN (SELECT NAME FROM CITY WHERE ID = A.ID_CITY) IS NOT NULL THEN (SELECT NAME FROM CITY WHERE ID = A.ID_CITY)
                    ELSE null END AS CITY_NAME,
                    CASE 
                        WHEN A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED) THEN 'No'
                        ELSE 'Yes' 
                    END AS SUSPENDED
                FROM USERS A 
                ${query_join_intrest_link} 
                WHERE ${query_suspended} ${query_users_id} ${query_users_name} ${query_users_username} ${query_users_gender} 
                ${query_category} ${query_interest} ${query_province} ${query_city} AND a.IS_VERIFIED = 'TRUE'
            )
            SELECT *, 
                COUNT(*) OVER() AS TOTAL_DATA
            FROM USER_QUERY
            ORDER BY ID_USER
            ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getUsers - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var result_interest = await exports.getUserInterestCategory(req, res, query_result.rows[i].id_user)

                    var object = {
                        "users_id" : query_result.rows[i].id_user,
                        "users_name" : query_result.rows[i].name,
                        "users_username" : query_result.rows[i].username,
                        "users_suspended" : query_result.rows[i].suspended,
                        "users_id_profile" : query_result.rows[i].id_profile,
                        "province_name" : query_result.rows[i].province_name,
                        "city_name" : query_result.rows[i].city_name,
                        "category_interest" : result_interest
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].total_data
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result, size)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result, size)
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

exports.getSingleUser = asyncHandler(async function getSingleUser(req, res, users_id, users_name, users_username, users_username_token, page, size) {
    let query_user_id = "", query_where = "", query_users_name = "", query_users_username ="", isError = false, result = []
    let query_user_id_1 = "", query_users_username_1 = "", query_users_name_1 = ""
    
    var query_pagination = respond.query_pagination(req,res, page, size)

    // bisa username, name, atau id_user
    if(users_username){
        query_users_username_1 = `,CASE WHEN (SELECT USERNAME FROM USERS WHERE USERNAME ILIKE LOWER('${users_username}')) 
                            = (SELECT USERNAME FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) THEN 'Matched'
                            ELSE 'Not Matched'
                        END AS CHECK_CONDITION`
    } else if(users_id) {
        query_user_id_1 = `,CASE WHEN (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${users_id}')) 
                            = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) THEN 'Matched'
                            ELSE 'Not Matched'
                        END AS CHECK_CONDITION`
    } else {
        query_users_username_1 = `,CASE WHEN (SELECT USERNAME FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) 
                            = (SELECT USERNAME FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) THEN 'Matched'
                            ELSE 'Not Matched'
                        END AS CHECK_CONDITION`
    }

    
    if(users_id || users_name || users_username || users_username_token)  query_where = "WHERE"

    if(!users_username && !users_id && !users_name){
        query_users_username = `A.USERNAME ILIKE LOWER('${users_username_token}')`
    } else {
        if(users_username){
            query_users_username = `A.USERNAME ILIKE LOWER('${users_username}')`
            if(users_id){
                query_user_id = `AND A.ID_USER ILIKE LOWER('${users_id}')`
            } 
            if(users_name){
                query_users_name = `AND A.NAME ILIKE LOWER('${users_name}')`
            }
        } else {
            if(users_id){
                query_user_id = `A.ID_USER ILIKE LOWER('${users_id}')`

                if(users_name){
                    query_users_name = `AND A.NAME ILIKE LOWER('${users_name}')`
                }
            } else {
                query_users_name = `A.NAME ILIKE LOWER('${users_name}')`
            }
        }
    }

    console.log(`SELECT 
        DISTINCT A.ID_USER, A.NAME, A.USERNAME, A.GENDER, A.DATE_OF_BIRTH, A.DESCRIPTION, A.EMAIL, A.GENDER, A.ID_PROFILE,
        (SELECT NAME FROM PROVINCE WHERE ID = A.ID_PROVINCE) AS PROVINCE_NAME,
		(SELECT NAME FROM CITY WHERE ID = A.ID_CITY) AS CITY_NAME,
        CASE WHEN A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED) THEN 'No'
        ELSE 'Yes' END AS SUSPENDED
        ${query_user_id_1} ${query_users_name_1} ${query_users_username_1}
    FROM USERS A
    ${query_where} ${query_user_id} ${query_users_name} ${query_users_username}
    ORDER BY A.ID_USER ${query_pagination} `)
    
    try {
        var query_result = await pool.query(`SELECT 
                DISTINCT A.ID_USER, A.NAME, A.USERNAME, A.GENDER, A.DATE_OF_BIRTH, A.DESCRIPTION, A.EMAIL, A.GENDER,A.ID_PROFILE,
                (SELECT NAME FROM PROVINCE WHERE ID = A.ID_PROVINCE) AS PROVINCE_NAME,
		        (SELECT NAME FROM CITY WHERE ID = A.ID_CITY) AS CITY_NAME,
                CASE WHEN A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED) THEN 'No'
                ELSE 'Yes' END AS SUSPENDED
                ${query_user_id_1} ${query_users_name_1} ${query_users_username_1}
            FROM USERS A
            ${query_where} ${query_user_id} ${query_users_name} ${query_users_username}
            ORDER BY A.ID_USER ${query_pagination} `)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getSingleUser [username : "${username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    let button_action
                    var dob = new Date(query_result.rows[i].date_of_birth)
                    var age = utility.getAge(dob)

                    console.log(query_result.rows[i])

                    var result_interest = await exports.getUserInterestCategory(req, res, query_result.rows[i].id_user)

                    if(query_result.rows[i].check_condition == 'Matched'){
                        button_action = true
                    } else {
                        button_action = false
                    }

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
                        "users_id_profile" : query_result.rows[i].id_profile,
                        "province_name" : query_result.rows[i].province_name,
                        "city_name" : query_result.rows[i].city_name,
                        "category_interest" : result_interest,
                        "isPersonal" : button_action
                    }
                    result.push(object)
                }

                var total_query_data = query_result.rowCount
                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", 1, 1, 1, result, 1)

            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result, size)
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

exports.getUserInterestCategory = asyncHandler(async function getUserInterestCategory(req, res, users_id_user, size) {
    let result = [], isError = false

    console.log(`WITH QUERY_REVIEW AS (
                    SELECT DISTINCT F.ID AS CATEGORY_ID, F.NAME AS CATEGORY_NAME, E.ID AS INTEREST_ID, E.NAME AS INTEREST_NAME, D.CREATED
                    FROM USERS A
                    JOIN INTEREST_LINK D ON A.id_user = D.id_user
                    JOIN INTEREST E ON D.id_interest = E.id
                    JOIN CATEGORY F ON E.id_category = F.id
                    WHERE A.ID_USER = '${users_id_user}'
                )
                SELECT * FROM QUERY_REVIEW ORDER BY CREATED DESC LIMIT 3`)

    try {
        var query_result = await pool.query(`WITH QUERY_REVIEW AS (
                                                SELECT DISTINCT F.ID AS CATEGORY_ID, F.NAME AS CATEGORY_NAME, E.ID AS INTEREST_ID, E.NAME AS INTEREST_NAME, D.CREATED
                                                FROM USERS A
                                                JOIN INTEREST_LINK D ON A.id_user = D.id_user
                                                JOIN INTEREST E ON D.id_interest = E.id
                                                JOIN CATEGORY F ON E.id_category = F.id
                                                WHERE A.ID_USER = '${users_id_user}'
                                            )
                                            SELECT * FROM QUERY_REVIEW ORDER BY CREATED DESC LIMIT 3`)
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

exports.getInterestCateory = asyncHandler(async function getInterestCateory(req, res, interest_name, category_name, page, size) {
    let query_interest = "", query_category = "", query_where = "", isError = false, result = []
    var query_pagination = respond.query_pagination(req,res, page, size)

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

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result, size)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result, size)
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

exports.putInterestLink = asyncHandler (async function putInterestLink(req, res, users_username, interest_id) {
    let isError1 = false

    try {
        var query_result = await pool.query(`
            INSERT INTO INTEREST_LINK(ID, CREATED, ID_INTEREST, ID_USER) VALUES 
            (
                (SELECT MAX(id) + 1 FROM INTEREST_LINK), 
                NOW(),
                (SELECT ID FROM INTEREST WHERE ID = '${interest_id}'), 
                (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username}'))
            )
        `)
    } catch (error) {
        isError1 = true;
        log.error(`ERROR | /general/putInterestLink - INSERT INTEREST [username : "${users_username}"] - Error found while connecting to DB - ${error}`)
    } finally {
        if (isError1) {
            return res.status(500).json({
                "error_schema": {
                    "error_code": "nearbud-003-001",
                    "error_message": `Error while connecting to DB - Error while connecting to DB - Failed to Update Interest Link`
                }
            });
        }
    }
})

exports.updateProfile = asyncHandler (async function updatedProfile(req, res, users_name, users_email, users_dob, users_gender, users_province, users_city, users_description, interest, users_username_token, users_id_profile) {
    var isError = false, result = []
    var query_users_dob = "", query_users_gender = "", query_province_name = "", query_city_name = "", query_users_description = "", query_users_name = "", query_users_email = "", query_users_id_profile = ""
    console.log("masuk")
    console.log(req, res, users_name, users_email, users_dob, users_gender, users_province, users_city, users_description, interest, users_username_token, users_id_profile)

    if(users_name){
        query_users_name = `,NAME = '${utility.toTitleCase(users_name)}'`
    }

    if(users_dob){
        if(!utility.insertDateValidation(users_dob)){
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

    if(users_email){
        if(!utility.emailValidation(users_email)){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Email tidak dalam format yang sesuai (example : user@domain.com)`
                }
            })
        } else {
            query_users_email = `,EMAIL = '${users_email.toLowerCase()}'`
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

    if(users_province){
        query_province_name = `,ID_PROVINCE = (SELECT ID FROM PROVINCE WHERE NAME ILIKE LOWER('%${users_province}%'))`
    }

    if(users_city){
        query_city_name = `,ID_CITY = (SELECT ID FROM CITY WHERE NAME ILIKE LOWER('%${users_city}%'))`
    }

    if(users_id_profile){
        query_users_id_profile = `, ID_PROFILE = '${users_id_profile}'`
    }

    if(users_city || users_province || users_description || users_gender || users_dob || users_id_profile){
        var query_users_username = `WHERE USERNAME ILIKE LOWER('${users_username_token}')`

        console.log(`UPDATE USERS SET MODIFIED = NOW() ${query_users_dob} ${query_users_gender} ${query_users_description} 
            ${query_province_name} ${query_city_name} ${query_users_name} ${query_users_email} ${query_users_id_profile} ${query_users_username}`)

        try {
            var query_result = await pool.query(`UPDATE USERS SET MODIFIED = NOW() ${query_users_dob} ${query_users_gender} ${query_users_description} 
                                ${query_province_name} ${query_city_name} ${query_users_name} ${query_users_email} ${query_users_id_profile} ${query_users_username}`)
        } catch (error) {
            isError = true
            log.error(`ERROR | /auth/registerUser [username : "${users_username}"] - Error found while connect to DB - ${error}`)
        } finally {
            console.log(query_result)
            if(isError){
                return res.status(500).json({
                    "error_schema" : {
                        "error_code" : "nearbud-003-001",
                        "error_message" : `Error while connecting to DB`
                    }
                })
            } else {
                if(interest){
                    console.log(`DELETE FROM INTEREST_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`)
    
                    try {
                        var query_result = await pool.query(`DELETE FROM INTEREST_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`)
                    } catch (error) {
                        isError = true
                        log.error(`ERROR | /general/updateProfile - DELETE EXISTING INTEREST [username : "${users_username_token}"] - Error found while connecting to DB - ${error}`);
                    } finally {
                        if(!isError){
                            for (const item of interest) {
                                await exports.putInterestLink(req, res, users_username_token, item.interest_id)
                            }
                            respond.successResp(req, res, "nearbud-000-000", "Berhasil memperbaharui data", 0, 0, 0, result)
                        } else {
                            return res.status(500).json({
                                "error_schema" : {
                                    "error_code" : "nearbud-003-001",
                                    "error_message" : `Error while connecting to DB`
                                }
                            })
                        }
                    }
                } else {
                    respond.successResp(req, res, "nearbud-000-000", "Berhasil memperbaharui data", 0, 0, 0, result)
                }
            }
        }
    }
})

exports.getReportType = asyncHandler(async function getReportType(req, res, page, size) {
    let isError = false, result = []
    var query_pagination = respond.query_pagination(req,res, page, size)

    try {
        var query_result = await pool.query(`SELECT ID, REPORT_TYPE, COUNT (*) OVER () FROM REPORT_TYPE ORDER BY ID ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getReportType [username : "${username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "report_id" : query_result.rows[i].id,
                        "report_type" : query_result.rows[i].report_type
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /general/getReportType - Success return the result`)

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

exports.addReport = asyncHandler(async function addReport(req, res, reportee, report_type, report_detail, users_username_token) {
    var isError = false, result = []
    try {
        var query_result = await pool.query(`INSERT INTO REPORT_LINK 
                                            (id, CREATED, ID_REPORTEE, ID_REPORTER, REPORT_TYPE, REPORT_DETAIL) VALUES 
                                            ( (SELECT MAX(ID)+1 FROM REPORT_LINK), 
                                                NOW(), 
                                                '${reportee.toUpperCase()}',
                                                (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')),
                                                (SELECT ID FROM REPORT_TYPE WHERE REPORT_TYPE ILIKE LOWER('%${report_type}%')),
                                                '${report_detail}'
                                            )`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/addReportUser [username : "${username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            respond.successResp(req, res, "nearbud-000-000", "Data berhasil ditambahkan", 0, 0, 0, result)
            log.info(`SUCCESS | /general/getReportType - Success added the data`)

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

exports.updatePassword = asyncHandler (async function updatePassword(req, res, password_new, password_old, users_username_token) {
    var isError = false, result = []

    console.log(`UPDATE USERS SET MODIFIED = NOW(), PASSWORD = '${password_new}' WHERE USERNAME ILIKE LOWER('${users_username_token}') AND PASSWORD = '${password_old}'`)
    
    try {
        var query_result = await pool.query(`UPDATE USERS SET MODIFIED = NOW(), PASSWORD = '${password_new}' WHERE USERNAME ILIKE LOWER('${users_username_token}') AND PASSWORD = '${password_old}'`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/updatePassword [username : "${username}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0){
                respond.successResp(req, res, "nearbud-000-000", "Data berhasil diperbaharui", 0, 0, 0, result)
                log.info(`SUCCESS | /general/updatePassword - Success update the data`)
            } else {
                respond.successResp(req, res, "nearbud-000-001", "Tidak ada data yang diperbaharui", 0, 0, 0, result)
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

exports.getReview = asyncHandler(async function getReview(req, res, reviewee_id, users_username_token, page, size){
    let isError = false, result = [], query_where = ""

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(reviewee_id){
        if(reviewee_id.startsWith("U")){
            query_where = `WHERE A.ID_REVIEWEE IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR ILIKE LOWER('${reviewee_id}'))
                    OR ID_REVIEWEE IN(SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER ILIKE LOWER('${reviewee_id}')))
                    OR A.ID_REVIEWEE ILIKE LOWER('${reviewee_id}')`
        } else if(reviewee_id.startsWith("C")){
            query_where = `WHERE A.ID_REVIEWEE IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR ILIKE LOWER('${reviewee_id}'))`
        }
    } else {
        query_where = `WHERE A.ID_REVIEWEE IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))
        OR ID_REVIEWEE IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))))
        OR A.ID_REVIEWEE = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
    }

    console.log(`WITH GETREVIEW AS (SELECT (SELECT ROUND(AVG(RATING))
                    FROM review
                    WHERE id_reviewee = A.id_reviewee
                    GROUP BY id_reviewee) AS AVG_RATING,
                    A.ID,
                    A.REVIEW,
                    A.ID_REVIEWEE AS REVIEWEE_ID,
                    (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE) AS REVIEWEE,
                    (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER(A.ID_REVIEWER)) AS REVIEWER_ID,
                    (SELECT NAME FROM USERS WHERE ID_USER ILIKE LOWER(A.ID_REVIEWER)) AS REVIEWER_NAME
                FROM REVIEW A
                ${query_where})
                SELECT *, COUNT(*) OVER ()
                FROM GETREVIEW
                ORDER BY ID
                ${query_pagination}`)

    try {
        var query_result = await pool.query(`WITH GETREVIEW AS (SELECT (SELECT ROUND(AVG(RATING))
                                                FROM review
                                                WHERE id_reviewee = A.id_reviewee
                                                GROUP BY id_reviewee) AS AVG_RATING,
                                                A.ID,
                                                A.REVIEW,
                                                A.ID_REVIEWEE AS REVIEWEE_ID,
                                                (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE) AS REVIEWEE,
                                                (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER(A.ID_REVIEWER)) AS REVIEWER_ID,
                                                (SELECT NAME FROM USERS WHERE ID_USER ILIKE LOWER(A.ID_REVIEWER)) AS REVIEWER_NAME
                                            FROM REVIEW A
                                            ${query_where})
                                            SELECT *, COUNT(*) OVER ()
                                            FROM GETREVIEW
                                            ORDER BY ID
                                            ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getReview [username : "${users_username_token}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                let temp = []
                for( let i = 0; i < query_result.rowCount; i++){
                    var rating_individu = {
                        "review_id" : query_result.rows[i].id,
                        "reviewee_id" : query_result.rows[i].reviewee_id,
                        "reviewee_name" : query_result.rows[i].reviewee,
                        "reviewer_id" : query_result.rows[i].reviewer_id,
                        "reviewer_name" : query_result.rows[i].reviewer_name,
                        "review_message" : query_result.rows[i].review
                    }
                    temp.push(rating_individu)
                }
                
                var object = {
                    "avg_rating" : query_result.rows[0].avg_rating,
                    "reviews" : temp
                } 
                result.push(object)

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", query_result.rowCount, query_result.rowCount, 1, result)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /general/getReview - Success return the result`)

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

exports.getPendingReview = asyncHandler(async function getPendingReview(req, res, users_username_token, page, size) {
    let isError = false, result = []

    var query_pagination = respond.query_pagination(req,res, page, size)

    try {
        var query_result = await pool.query(`WITH PENDING_REVIEW AS (
                SELECT 
                    A.ID,
                    A.ID_REVIEWEE AS EVENT_ID,
                    (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE) AS EVENT_NAME,
                    (SELECT ID_CREATOR FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE) AS EVENT_CREATOR_ID,
                    CASE WHEN (SELECT ID_CREATOR FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE) ILIKE ('C%') THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = (SELECT ID_CREATOR FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE))
                    WHEN (SELECT ID_CREATOR FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE) ILIKE ('U%') THEN (SELECT NAME FROM USERS WHERE ID_USER = (SELECT ID_CREATOR FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE))
                    END AS EVENT_CREATOR_NAME
                FROM EVENT_RATING_TASKS A
                WHERE A.ID_REVIEWER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))
            )
            SELECT *, COUNT(*) OVER () 
            FROM PENDING_REVIEW
            ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getPendingReview [username : "${users_username_token}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "event_pending_review_id" : query_result.rows[i].id,
                        "event_id" : query_result.rows[i].event_id,
                        "event_name" : query_result.rows[i].event_name,
                        "event_creator_id" : query_result.rows[i].event_creator_id,
                        "event_creator_name" : query_result.rows[i].event_creator_name
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].total_data
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result, size)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /general/getPendingReview - Success return the result`)

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

exports.addReview = asyncHandler(async function getReview(req, res, reviewee_id, reviewer_id, rating, review, users_username_token) {
    var isError = false, result = [], query_reviewer = ""

    if(!rating||!review||!reviewee_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-002",
                "error_message" : `Data pada BODY tidak lengkap`
            }
        })
    }

    if(reviewer_id){
        query_reviewer = `(SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${reviewer_id}'))`
    } else {
        query_reviewer = `(SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
    }

    console.log(`INSERT INTO REVIEW 
                (ID_REVIEWEE, ID_REVIEWER, RATING, REVIEW) VALUES 
                ( '${reviewee_id.toUpperCase()}', 
                    ${query_reviewer}, 
                    '${rating}',
                    '${review}'
                )`)

    try {
        var query_result = await pool.query(`INSERT INTO REVIEW 
                                            (ID_REVIEWEE, ID_REVIEWER, RATING, REVIEW) VALUES 
                                            ( '${reviewee_id.toUpperCase()}', 
                                                ${query_reviewer}, 
                                                '${rating}',
                                                '${review}'
                                            )`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/addReview - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            let isError1 = false
            try {
                console.log(`DELETE FROM EVENT_RATING_TASKS WHERE ID_REVIEWER = ${query_reviewer} AND ID_REVIEWEE = '${reviewee_id.toUpperCase()}'`)

                var query_delete = await pool.query(`DELETE FROM EVENT_RATING_TASKS WHERE ID_REVIEWER = ${query_reviewer} AND ID_REVIEWEE = '${reviewee_id.toUpperCase()}'`)
            } catch (error) {
                isError1 = true
                log.error(`ERROR | /general/addReview - Delete Event Rating Tasks - Error found while connect to DB - ${error}`)
            } finally {
                if(!isError1){
                    respond.successResp(req, res, "nearbud-000-000", "Data berhasil ditambahkan", 0, 0, 0, result)
                    log.info(`SUCCESS | /general/addReview - Success added the data`)
                } else {
                    return res.status(500).json({
                        "error_schema" : {
                            "error_code" : "nearbud-003-001",
                            "error_message" : `Error while connecting to DB`
                        }
                    })
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

exports.getRoomIdList = asyncHandler(async function getRoomIdList(req, res, users_username_token){
    let isError = false, result = []

    console.log(`WITH CHAT_LIST AS (SELECT id_chat, id_user_1, id_user_2 
            FROM CHAT WHERE (ID_USER_1 = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) OR 
            (ID_USER_2 = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))) -- PRVATE CHAT
        UNION
        SELECT (SELECT room_chat_id FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_COMMUNITY) as id_chat, (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) as id_user_1, A.id_community as id_user_2 FROM COMMUNITY_LINK A 
            WHERE A.ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND A.IS_APPROVED = TRUE -- by community yang diikutin
        UNION
        SELECT (SELECT room_chat_id FROM EVENTS WHERE ID_EVENT = B.ID_EVENT) as id_chat, (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) as id_user_1, B.ID_EVENT as id_user_2 FROM EVENTS_LINK B 
            WHERE B.ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND B.IS_APPROVED = TRUE -- by event yang diikutin
        UNION 
        SELECT (SELECT room_chat_id FROM COMMUNITY WHERE ID_COMMUNITY = C.ID_COMMUNITY) as id_chat, (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) as id_user_1, C.ID_COMMUNITY as id_user_2 FROM COMMUNITY C 
            WHERE C.ID_COMMUNITY IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) 
            AND ID_COMMUNITY = C.ID_COMMUNITY) -- by community yang dia admin
        UNION
        SELECT (SELECT room_chat_id FROM EVENTS WHERE ID_EVENT = D.ID_EVENT) as id_chat, (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) as id_user_1, D.ID_EVENT as id_user_2 FROM EVENTS D
            WHERE D.ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) -- by event yang dia create
        SELECT *, COUNT(*) OVER ()
        FROM CHAT_LIST
        `)

    try {
        var query_result = await pool.query(`WITH CHAT_LIST AS (SELECT id_chat, id_user_1, id_user_2 
            FROM CHAT WHERE (ID_USER_1 = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) OR 
            (ID_USER_2 = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))))-- PRVATE CHAT
            UNION
            SELECT (SELECT room_chat_id FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_COMMUNITY) as id_chat, (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) as id_user_1, A.id_community as id_user_2 FROM COMMUNITY_LINK A 
                WHERE A.ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND A.IS_APPROVED = TRUE -- by community yang diikutin
            UNION
            SELECT (SELECT room_chat_id FROM EVENTS WHERE ID_EVENT = B.ID_EVENT) as id_chat, (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) as id_user_1, B.ID_EVENT as id_user_2 FROM EVENTS_LINK B 
                WHERE B.ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND B.IS_APPROVED = TRUE -- by event yang diikutin
            UNION 
            SELECT (SELECT room_chat_id FROM COMMUNITY WHERE ID_COMMUNITY = C.ID_COMMUNITY) as id_chat, (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) as id_user_1, C.ID_COMMUNITY as id_user_2 FROM COMMUNITY C 
                WHERE C.ID_COMMUNITY IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) 
                AND ID_COMMUNITY = C.ID_COMMUNITY) -- by community yang dia admin
            UNION
            SELECT (SELECT room_chat_id FROM EVENTS WHERE ID_EVENT = D.ID_EVENT) as id_chat, (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) as id_user_1, D.ID_EVENT as id_user_2 FROM EVENTS D
                WHERE D.ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) -- by event yang dia create
            SELECT *, COUNT(*) OVER ()
            FROM CHAT_LIST
            `)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getRoomIdList - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "room_id" : query_result.rows[i].id_chat,
                        "id_user_1" : query_result.rows[i].id_user_1,
                        "id_user_2" : query_result.rows[i].id_user_2
                    } 
                    result.push(object)

                    var total_data = query_result.rows[0].count
                    var total_query_data = query_result.rowCount
                }
                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, 1, result)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /general/getRoomIdList - Success return the result`)

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

exports.getRoomId = asyncHandler(async function getRoomId(req, res, target_id, users_username_token){
    let isError = false, result = []

    if(!target_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-002",
                "error_message" : `Target ID tidak boleh kosong`
            }
        })
    } 

    var check_status = await exports.check_status(users_username_token, target_id)
    if(!check_status){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-001",
                "error_message" : `Unauthorized, anda bukan bagian dari Community/Event ini`
            }
        })
    }

    let query = ""
    if(target_id.trim().startsWith("C")){
        query = `SELECT ID_COMMUNITY AS ID, NAME, ROOM_CHAT_ID FROM COMMUNITY WHERE ID_COMMUNITY ILIKE LOWER('${target_id.trim()}')`
    } else if (target_id.trim().startsWith("E")){
        query = `SELECT ID_EVENT AS ID, NAME, ROOM_CHAT_ID FROM EVENTS WHERE ID_EVENT ILIKE LOWER('${target_id.trim()}')`
    }

    try {
        var query_result = await pool.query(query)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getRoomIdList - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "room_id" : query_result.rows[i].room_chat_id,
                        "target_id" : query_result.rows[i].id,
                        "target_name" : query_result.rows[i].name
                    } 
                    result.push(object)
                }
                respond.successResp(req, res, "nearbud-000-000", "Data berhasil ditemukan", 1, 1, 1, result)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /general/getRoomIdList - Success return the result`)

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

exports.check_status = asyncHandler(async function check_status(users_username_token, target_id){
    let isError = false, query_search = ""

    if(target_id.trim().startsWith("C")){
        query_search = `SELECT ID_COMMUNITY AS ID FROM COMMUNITY_LINK WHERE ID_COMMUNITY ILIKE LOWER('${target_id.trim()}')
                AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) 
                AND IS_APPROVED = TRUE
                UNION
                SELECT ID_COMMUNITY AS ID FROM IS_ADMIN WHERE ID_COMMUNITY ILIKE LOWER('${target_id.trim()}')
                AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
    } else if (target_id.trim().startsWith("E")){
        query_search = `SELECT ID_EVENT AS ID FROM EVENTS_LINK WHERE ID_EVENT ILIKE LOWER('${target_id.trim()}')
                AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) 
                AND IS_APPROVED = TRUE
                UNION
                SELECT ID_EVENT FROM EVENTS WHERE ID_EVENT IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR 
                IN (SELECT ID_USER FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))))`
    }

    console.log(query_search)

    try {
        var query_result = await pool.query(query_search)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getRoomId/checkstatus - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            console.log(query_result.rows)
            if(query_result.rowCount > 0){
                return true
            } else {
                return false
            }
        }
    }
})

exports.addRoomId = asyncHandler(async function addRoomId(req, res, room_id, id_user_1, id_user_2, users_username_token){
    let isError = false, result = [], queryAddRoomId = ""

    if(!room_id || !id_user_2){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-002",
                "error_message" : `Data pada BODY tidak lengkap`
            }
        })
    }

    if(id_user_2.trim().startsWith("C")){
        queryAddRoomId = `UPDATE COMMUNITY SET MODIFIED = NOW(), ROOM_CHAT_ID = '${room_id}' WHERE ID_COMMUNITY ILIKE LOWER('${id_user_2}') `
    } else if(id_user_2.trim().startsWith("E")) {
        queryAddRoomId = `UPDATE EVENTS SET MODIFIED = NOW(), ROOM_CHAT_ID = '${room_id}' WHERE ID_EVENT ILIKE LOWER('${id_user_2}') `
    } else {
        if(!id_user_1){
            queryAddRoomId = `INSERT INTO CHAT (ID_CHAT, ID_USER_1, ID_USER_2) VALUES 
                ('${room_id}', (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')), 
                (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${id_user_2}')))`
        } else {
            queryAddRoomId = `INSERT INTO CHAT (ID_CHAT, ID_USER_1, ID_USER_2) VALUES 
                ('${room_id}', (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${id_user_1}')), 
                (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${id_user_2}')))`
        }
    }

    try {
        var query_result = await pool.query(queryAddRoomId)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/addRoomId - Error found while connect to DB - ${error}`)
    } finally{
        if(!isError){
            respond.successResp(req, res, "nearbud-000-000", "Berhasil memproses data", 1, 1, 1, result)
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


exports.getNotif = asyncHandler(async function getNotif(req, res, users_username_token, page, size) {
    let isError = false, result = [], notif_approval = [], notif = []

    var query_pagination = respond.query_pagination(req,res, page, size)

    console.log(`
        WITH NOTIFICATION AS (
                    SELECT '1' AS CLASSIFICATION,
                        A.ID,
                        A.STRING1,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.STRING1)
                        ELSE 'not found'
                        END AS NAME,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT LOCATION FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS LOCATION,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT TO_CHAR(DATE, 'HH12:MI AM') FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS TIME,
                        (SELECT NAME FROM USERS WHERE ID_USER = A.ID_SENDER) AS SENDER_NAME,
                        A.ID_SENDER,
                        A.ACTION
                    FROM NOTIFICATION A
                    WHERE (A.ID_RECEIVER IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))  -- WHEN RECEIVER = CXXX
                    OR A.ID_RECEIVER IN (SELECT ID_CREATOR FROM EVENTS WHERE ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))) -- KALO USER == CREATOR EVENT
                    AND A.ACTION IN ('requestEvent', 'requestCommunity')
                    UNION
                    SELECT '3' AS CLASSIFICATION, B.ID, B.STRING1,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT NAME FROM EVENTS WHERE ID_EVENT = B.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = B.STRING1)
                        ELSE 'not found'
                        END AS NAME,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT LOCATION FROM EVENTS WHERE ID_EVENT = B.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS LOCATION,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT TO_CHAR(DATE, 'HH12:MI AM') FROM EVENTS WHERE ID_EVENT = B.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS TIME,
                        (SELECT NAME FROM USERS WHERE ID_USER = B.ID_SENDER) AS SENDER_NAME,
                        B.ID_SENDER, 
                        B.ACTION
                    FROM NOTIFICATION B
                    WHERE (B.ID_RECEIVER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))
                    AND B.ACTION IN ('rejectedEvent', 'rejectedCommunity', 'acceptedEvent', 'acceptedCommunity')
                    UNION
                    SELECT '2' AS CLASSIFICATION, A.ID, A.STRING1,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.STRING1)
                        ELSE 'not found'
                        END AS NAME,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT LOCATION FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS LOCATION,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT TO_CHAR(DATE, 'HH12:MI AM') FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS TIME,
                        (SELECT NAME FROM USERS WHERE ID_USER = A.ID_SENDER) AS SENDER_NAME,
                        A.ID_SENDER,
                        A.ACTION
                    FROM NOTIFICATION A
                    WHERE (A.ID_RECEIVER IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND IS_APPROVED = TRUE)
                    OR A.ID_RECEIVER IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}') AND IS_APPROVED = TRUE)))
                    AND A.ACTION IN ('newEvent')
                )
                SELECT *, COUNT(*) OVER ()
                FROM NOTIFICATION
                ORDER BY ID ASC
                ${query_pagination}`)

    try {
        var query_result = await pool.query(`
                WITH NOTIFICATION AS (
                    SELECT '1' AS CLASSIFICATION,
                        A.ID,
                        A.STRING1,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.STRING1)
                        ELSE 'not found'
                        END AS NAME,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT LOCATION FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS LOCATION,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT TO_CHAR(DATE, 'HH12:MI AM') FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS TIME,
                        (SELECT NAME FROM USERS WHERE ID_USER = A.ID_SENDER) AS SENDER_NAME,
                        A.ID_SENDER,
                        A.ACTION
                    FROM NOTIFICATION A
                    WHERE (A.ID_RECEIVER IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))  -- WHEN RECEIVER = CXXX
                    OR A.ID_RECEIVER IN (SELECT ID_CREATOR FROM EVENTS WHERE ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))) -- KALO USER == CREATOR EVENT
                    AND A.ACTION IN ('requestEvent', 'requestCommunity')
                    UNION
                    SELECT '3' AS CLASSIFICATION, B.ID, B.STRING1,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT NAME FROM EVENTS WHERE ID_EVENT = B.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = B.STRING1)
                        ELSE 'not found'
                        END AS NAME,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT LOCATION FROM EVENTS WHERE ID_EVENT = B.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS LOCATION,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT TO_CHAR(DATE, 'HH12:MI AM') FROM EVENTS WHERE ID_EVENT = B.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS TIME,
                        (SELECT NAME FROM USERS WHERE ID_USER = B.ID_SENDER) AS SENDER_NAME,
                        B.ID_SENDER, 
                        B.ACTION
                    FROM NOTIFICATION B
                    WHERE (B.ID_RECEIVER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))
                    AND B.ACTION IN ('rejectedEvent', 'rejectedCommunity', 'acceptedEvent', 'acceptedCommunity')
                    UNION
                    SELECT '2' AS CLASSIFICATION, A.ID, A.STRING1,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.STRING1)
                        ELSE 'not found'
                        END AS NAME,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT LOCATION FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS LOCATION,
                        CASE WHEN STRING1 ILIKE ('E%') THEN (SELECT TO_CHAR(DATE, 'HH12:MI AM') FROM EVENTS WHERE ID_EVENT = A.STRING1)
                        WHEN STRING1 ILIKE ('C%') THEN null
                        ELSE 'not found'
                        END AS TIME,
                        (SELECT NAME FROM USERS WHERE ID_USER = A.ID_SENDER) AS SENDER_NAME,
                        A.ID_SENDER,
                        A.ACTION
                    FROM NOTIFICATION A
                    WHERE (A.ID_RECEIVER IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND IS_APPROVED = TRUE)
                    OR A.ID_RECEIVER IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}') AND IS_APPROVED = TRUE)))
                    AND A.ACTION IN ('newEvent')
                )
                SELECT *, COUNT(*) OVER ()
                FROM NOTIFICATION
                ${query_pagination}
            `)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getRoomIdList - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    if(['1'].includes(query_result.rows[i].classification)){
                        let target_type
                        if(query_result.rows[i].string1 == "requestCommunity") {
                            target_type = `COMMUNITY`
                        } else {
                            target_type = `EVENT`
                        }

                        var object = {
                            "notification_id" : query_result.rows[i].id,
                            "notification_action" : query_result.rows[i].action,
                            "target_type" : target_type,
                            "target_id" : query_result.rows[i].string1,
                            "target_name" : query_result.rows[i].name,
                            "target_location" : query_result.rows[i].location,
                            "target_time" : query_result.rows[i].time,
                            "sender_id" : query_result.rows[i].id_sender,
                            "sender_name" : query_result.rows[i].sender_name
                        }

                        notif_approval.push(object)
                    } else if(['2', '3'].includes(query_result.rows[i].classification)) {
                        let target_type
                        if(query_result.rows[i].string1 == "requestCommunity") {
                            target_type = `COMMUNITY`
                        } else {
                            target_type = `EVENT`
                        }

                        var object = {
                            "notification_id" : query_result.rows[i].id,
                            "notification_action" : query_result.rows[i].action,
                            "target_type" : target_type,
                            "target_id" : query_result.rows[i].string1,
                            "target_name" : query_result.rows[i].name,
                            "target_location" : query_result.rows[i].location,
                            "target_time" : query_result.rows[i].time,
                            "sender_id" : query_result.rows[i].id_sender,
                            "sender_name" : query_result.rows[i].sender_name
                        }

                        notif.push(object)
                    }
                }

                var fin_result = {
                    "notification_approval" : notif_approval,
                    "notification_info" : notif
                }

                result.push(fin_result)

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, 1, result)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /general/getRoomIdList - Success return the result`)

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

exports.updateNotif = asyncHandler(async function updateNotif(req, res, users_username_token, notification_id, decision) {
    let isError = false, isError1 = false, result = [], query_action = ""

    if(!decision || !notification_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-002",
                "error_message" : `Data pada BODY tidak lengkap`
            }
        })
    } 

    try {
        var query_result = await pool.query(`SELECT ID_SENDER, ID_RECEIVER, STRING1 FROM NOTIFICATION WHERE ID = ${notification_id}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/updateNotif - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0){
                let id_sender = query_result.rows[0].id_sender
                let id_receiver = query_result.rows[0].id_receiver
                let identity = query_result.rows[0].string1

                if(identity){
                    if(identity.startsWith("C")){
                        if(decision.includes("accepted")){
                            query_action = `'acceptedCommunity'`
                        } else if(decision.includes("rejected")){    
                            query_action = `'rejectedCommunity'`
                        }
                    } else if(identity.startsWith("E")){
                        if(decision.includes("accepted")){
                            query_action = `'acceptedEvent'`
                        } else if(decision.includes("rejected")){    
                            query_action = `'rejectedEvent'`
                        }
                    } 
                }

                console.log(`INSERT INTO NOTIFICATION (ACTION, ID_SENDER, ID_RECEIVER, STRING1)
                    VALUES (${query_action}, '${id_receiver}', '${id_sender}', '${identity}')`)

                try {
                    var query_result = await pool.query(`INSERT INTO NOTIFICATION (ACTION, ID_SENDER, ID_RECEIVER, STRING1)
                        VALUES (${query_action}, '${id_receiver}', '${id_sender}', '${identity}')`)
                } catch (error) {
                    isError1 = true
                    log.error(`ERROR | /general/updateNotif - Error found while connect to DB - ${error}`)
                } finally {
                    console.log(query_result)
                    if(!isError1){
                        try {
                            var query_result = await pool.query(`DELETE FROM NOTIFICATION WHERE ID = ${notification_id}`)
                            console.log(query_result)
                        } catch (error) {
                            isError1 = true
                            log.error(`ERROR | /general/updateNotif - Error found while connect to DB - ${error}`)
                        } finally {
                            let query = "", isError4 = ""
                            if(decision.includes("accepted")){
                                if(identity.startsWith("E")){
                                    query = `UPDATE EVENTS_LINK SET MODIFIED = NOW(), IS_APPROVED = TRUE WHERE ID_EVENT ILIKE LOWER('${identity}') AND ID_USER ILIKE LOWER('${id_sender}')`
                                } else if (identity.startsWith("C")){
                                    query = `UPDATE COMMUNITY_LINK SET MODIFIED = NOW(), IS_APPROVED = TRUE WHERE ID_COMMUNITY ILIKE LOWER('${identity}') AND ID_USER ILIKE LOWER('${id_sender}')`
                                }
                            } else {
                                if(identity.startsWith("E")){
                                    query = `DELETE FROM EVENTS_LINK WHERE ID_EVENT ILIKE LOWER('${identity}') AND ID_USER ILIKE LOWER('${id_sender}')`
                                } else if (identity.startsWith("C")){
                                    query = `DELETE FROM COMMUNITY_LINK WHERE ID_COMMUNITY ILIKE LOWER('${identity}') AND ID_USER ILIKE LOWER('${id_sender}')`
                                }
                            }
                            try {
                                var query_result = await pool.query(query)
                            } catch (error) {
                                isError4 = true
                                log.error(`ERROR | /general/updateNotif - Error found while connect to DB - ${error}`)
                            } finally {
                                if(!isError4){
                                    respond.successResp(req, res, "nearbud-000-000", "Berhasil memproses data", 1, 1, 1, result)                    
                                }
                            }
                        }
                    }
                }
            } else {
                return res.status(500).json({
                    "error_schema" : {
                        "error_code" : "nearbud-001-001",
                        "error_message" : `Notification ID tidak ditemukan`
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