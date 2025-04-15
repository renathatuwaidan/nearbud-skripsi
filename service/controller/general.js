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

        query_city = ` AND F.ID IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
    }

    if(province){
        query_province = ` AND A.ID_PROVINCE = (SELECT ID FROM PROVINCE ILIKE LOWER('%${province}%'))`
    }

    // KALO ADA CATERGORY ATAU INTEREST
    if(category || interest_id1 || interest_id2 || interest_id3 || interest_id4 || interest_id5){
        query_join_intrest_link = `JOIN INTEREST_LINK B ON A.ID_USER = B.ID_USER`

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
                E.NAME AS PROVINCE_NAME, F.NAME AS CITY_NAME,
                CASE 
                    WHEN A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED) THEN 'No'
                    ELSE 'Yes' 
                END AS SUSPENDED
            FROM USERS A 
            JOIN PROVINCE E ON A.id_province = E.id
            JOIN CITY F ON A.id_city = F.id
            ${query_join_intrest_link}   
            JOIN INTEREST C ON B.ID_INTEREST = C.ID
            JOIN CATEGORY D ON C.id_category = D.ID
            WHERE ${query_suspended} ${query_users_id} ${query_users_name} ${query_users_username} ${query_users_gender} 
            ${query_category} ${query_interest} ${query_province} ${query_city}
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
                    E.NAME AS PROVINCE_NAME, F.NAME AS CITY_NAME,
                    CASE 
                        WHEN A.id_user NOT IN (SELECT ID_REPORTEE FROM SUSPENDED) THEN 'No'
                        ELSE 'Yes' 
                    END AS SUSPENDED
                FROM USERS A 
                JOIN PROVINCE E ON A.id_province = E.id
                JOIN CITY F ON A.id_city = F.id
                ${query_join_intrest_link}   
                JOIN INTEREST C ON B.ID_INTEREST = C.ID
                JOIN CATEGORY D ON C.id_category = D.ID
                WHERE ${query_suspended} ${query_users_id} ${query_users_name} ${query_users_username} ${query_users_gender} 
                ${query_category} ${query_interest} ${query_province} ${query_city}
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

        try {
            var query_result = await pool.query(`UPDATE USERS SET MODIFIED = NOW() ${query_users_dob} ${query_users_gender} ${query_users_description} 
                                ${query_province_name} ${query_city_name} ${query_users_name} ${query_users_email} ${query_users_id_profile} ${query_users_username}`)
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
            } else {
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

exports.getReview = asyncHandler(async function getReview(req, res, reviewee_id, users_username_token){
    let isError = false, result = [], query_where = ""

    if(reviewee_id){
        query_where = `FROM REVIEW A JOIN USERS C ON A.ID_REVIEWER = C.ID_USER
                        WHERE A.ID_REVIEWEE IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER ILIKE LOWER('${reviewee_id}')) 
                        OR A.ID_REVIEWEE IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR ILIKE LOWER('${reviewee_id}'))`
    } else if(!reviewee_id && users_username_token){
        query_where = `FROM REVIEW A JOIN USERS C ON A.ID_REVIEWER = C.ID_USER
                        WHERE A.ID_REVIEWEE IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) 
                        OR A.ID_REVIEWEE IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
    }

    console.log(`SELECT (SELECT ROUND(AVG(rating),1) AS average_rating
        FROM review
        WHERE id_reviewee = A.ID_REVIEWEE	
        GROUP BY id_reviewee) AS AVG_RATING,
        A.ID,
        A.REVIEW,
        A.ID_REVIEWEE AS REVIEWEE_ID,
        CASE 
            WHEN A.ID_REVIEWEE ILIKE 'E%' THEN (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE)
            WHEN A.ID_REVIEWEE ILIKE 'C%' THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_REVIEWEE)
        END AS REVIEWEE,
        A.ID_REVIEWER AS REVIEWER_ID,
        C.NAME AS REVIEWER_NAME
        ${query_where}`)

    try {
        var query_result = await pool.query(`SELECT (SELECT ROUND(AVG(rating),1) AS average_rating
                                            FROM review
                                            WHERE id_reviewee = A.ID_REVIEWEE	
                                            GROUP BY id_reviewee) AS AVG_RATING,
                                            A.ID,
                                            A.REVIEW,
                                            A.ID_REVIEWEE AS REVIEWEE_ID,
                                            CASE 
                                                WHEN A.ID_REVIEWEE ILIKE 'E%' THEN (SELECT NAME FROM EVENTS WHERE ID_EVENT = A.ID_REVIEWEE)
                                                WHEN A.ID_REVIEWEE ILIKE 'C%' THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_REVIEWEE)
                                            END AS REVIEWEE,
                                            A.ID_REVIEWER AS REVIEWER_ID,
                                            C.NAME AS REVIEWER_NAME
                                            ${query_where}`)
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
                        "review_message" : query_result.rows[i].review,
                        "review_reviewer_id" : query_result.rows[i].reviewer_id,
                        "review_reviewer_name" : query_result.rows[i].reviewer_name
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

exports.getRoomIdList - asyncHandler(async function getRoomIdList(req, res, users_username_token) {
    try {
        
    } catch (error) {
        
    }
})