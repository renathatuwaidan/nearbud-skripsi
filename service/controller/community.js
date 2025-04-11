const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const config = require("../config/general")
const respond = require("./respond")
const utility = require("./utility")
const event = require("./event")

exports.getCommunityPreview = asyncHandler(async function getCommunityPreview(req, res, community_id, community_name, community_number_participant, category, interest_id1, interest_id2, interest_id3, interest_id4, interest_id5, city_based, province_based, status, page, size, users_username_token) {
    let isError = false, result = [], query_interest = "", query_community_id = "", query_community_name = "", query_number_participant = "", query_category = "", query_city = "", query_province = "", query_status = ""

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(interest_id1 || interest_id2 || interest_id3 || interest_id4 || interest_id5){
        if(interest_id1) {interest_id1 = `'${interest_id1}'`} else {interest_id1 = ''}
        if(interest_id2) {interest_id2 = `,'${interest_id2}'`} else {interest_id2 = ''}
        if(interest_id3) {interest_id3 = `,'${interest_id3}'`} else {interest_id3 = ''}
        if(interest_id4) {interest_id4 = `,'${interest_id4}'`} else {interest_id4 = ''}
        if(interest_id5) {interest_id5 = `,'${interest_id5}'`} else {interest_id5 = ''}

        query_interest = `WHERE A.ID_INTEREST IN (${interest_id1} ${interest_id2} ${interest_id3} ${interest_id4} ${interest_id5})`

        if(community_id){
            query_community_id = `AND A.ID_COMMUNITY ILIKE LOWER('${community_id}')`
        }

        if(community_name){
            query_community_name = `AND A.NAME ILIKE LOWER('${community_name}')`
        }

        if(community_number_participant){
            query_number_participant = `AND ((SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) <= ${community_number_participant})`
        }

        if(category){
            query_category = `AND ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category})`
        }

        if(city_based){
            query_city = `AND D.NAME ILIKE LOWER('${city_based}')`
        }

        if(province_based){
            query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
        }

        if(status){
            if(status.toLowerCase == 'available'){
                query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
            }
        }
    } else {
        if(community_id){
            query_community_id = `WHERE  A.ID_COMMUNITY ILIKE LOWER('${community_id}')`

            if(community_name){
                query_community_name = `AND A.NAME ILIKE LOWER('${community_name}')`
            }
    
            if(community_number_participant){
                query_number_participant = `AND ((SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) <= ${community_number_participant})`
            }
    
            if(category){
                query_category = `AND ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category})`
            }
    
            if(city_based){
                query_city = `AND D.NAME ILIKE LOWER('${city_based}')`
            }
    
            if(province_based){
                query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
            }

            if(status){
                if(status.toLowerCase == 'available'){
                    query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                }
            }
        } else {
            if(community_name){
                query_community_name = `WHERE A.NAME ILIKE LOWER('${community_name}')`

                if(community_number_participant){
                    query_number_participant = `AND ((SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) <= ${community_number_participant})`
                }
        
                if(category){
                    query_category = `AND ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category})`
                }
        
                if(city_based){
                    query_city = `AND D.NAME ILIKE LOWER('${city_based}')`
                }
        
                if(province_based){
                    query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
                }

                if(status){
                    if(status.toLowerCase == 'available'){
                        query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                    }
                }
            } else {
                if(community_number_participant){
                    query_number_participant = `WHERE ((SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) <= ${community_number_participant})`
                    
                    if(category){
                        query_category = `AND ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category})`
                    }
            
                    if(city_based){
                        query_city = `AND D.NAME ILIKE LOWER('${city_based}')`
                    }
            
                    if(province_based){
                        query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
                    }

                    if(status){
                        if(status.toLowerCase == 'available'){
                            query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                        }
                    }
                } else {
                    if(category){
                        query_category = `WHERE ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category})`
                        
                        if(city_based){
                            query_city = `AND D.NAME ILIKE LOWER('${city_based}')`
                        }
                
                        if(province_based){
                            query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
                        }

                        if(status){
                            if(status.toLowerCase == 'available'){
                                query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                            }
                        }
                    } else {
                        if(city_based){
                            query_city = `WHERE D.NAME ILIKE LOWER('${city_based}')`
                            
                            if(province_based){
                                query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
                            }

                            if(status){
                                if(status.toLowerCase == 'available'){
                                    query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                                }
                            }
                        } else {
                            if(province_based){
                                query_province = `WHERE C.NAME ILIKE LOWER('${province_based}')`

                                if(status){
                                    if(status.toLowerCase == 'available'){
                                        query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                                    }
                                }
                            } else {
                                if(status){
                                    if(status.toLowerCase == 'available'){
                                        query_status = `ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }        
    }


    console.log(`WITH COMMUNITY_PREVIEW AS (
        SELECT
            A.ID_COMMUNITY,
            A.NAME AS COMMUNITY_NAME,
            B.NAME AS INTEREST_NAME,
            D.NAME AS CITY_NAME,
            C.NAME AS PROVINCE_NAME,
            (SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) AS MEMBER
        FROM COMMUNITY A JOIN INTEREST B ON A.ID_INTEREST = B.ID
        JOIN PROVINCE C ON A.ID_PROVINCE = C.ID 
        JOIN CITY D ON A.ID_CITY = D.ID
        ${query_interest} ${query_community_id} ${query_community_name} ${query_number_participant} ${query_category} ${query_city} ${query_province} ${query_status}
    )
    SELECT *, COUNT(*) OVER ()
    FROM COMMUNITY_PREVIEW
    ${query_pagination}`)

    try {
        var query_result = await pool.query(`WITH COMMUNITY_PREVIEW AS (
                                                SELECT
                                                    A.ID_COMMUNITY,
                                                    A.NAME AS COMMUNITY_NAME,
                                                    B.NAME AS INTEREST_NAME,
                                                    D.NAME AS CITY_NAME,
                                                    C.NAME AS PROVINCE_NAME,
                                                    (SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) AS MEMBER
                                                FROM COMMUNITY A JOIN INTEREST B ON A.ID_INTEREST = B.ID
                                                JOIN PROVINCE C ON A.ID_PROVINCE = C.ID 
                                                JOIN CITY D ON A.ID_CITY = D.ID
                                                ${query_interest} ${query_community_id} ${query_community_name} ${query_number_participant} 
                                                ${query_category} ${query_city} ${query_province} ${query_status}
                                            )
                                            SELECT *, COUNT(*) OVER ()
                                            FROM COMMUNITY_PREVIEW
                                            ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince [username : "${username}" | email : "${email}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "community_id" : query_result.rows[i].id_community,
                        "community_name" : query_result.rows[i].community_name,
                        "interest_name" : query_result.rows[i].interest_name,
                        "city_based" : query_result.rows[i].city_name,
                        "province_based" : query_result.rows[i].province_based,
                        "community_current_member" : query_result.rows[i].member
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
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

exports.getCommunityCreator = asyncHandler(async function getCommunityCreator(req, res, id_creator, id_community, page, size) {
    let isError = false, result = [], query_creator= "", query_community = ""

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(id_creator){
        query_creator = `WHERE ID_COMMUNITY IN (SELECT ID_COMMUNITY FROM IS_ADMIN WHERE ID_USER ILIKE LOWER('${id_creator}'))`

        if(id_community){
            query_community =  ``
        }
    }

    try {
        var query_result = await pool.query(`WITH COMMUNITY_PREVIEW AS (
                                                SELECT
                                                    A.ID_COMMUNITY,
                                                    A.NAME AS COMMUNITY_NAME,
                                                    B.NAME AS INTEREST_NAME,
                                                    D.NAME AS CITY_NAME,
                                                    C.NAME AS PROVINCE_NAME,
                                                    (SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) AS MEMBER
                                                FROM COMMUNITY A JOIN INTEREST B ON A.ID_INTEREST = B.ID
                                                JOIN PROVINCE C ON A.ID_PROVINCE = C.ID 
                                                JOIN CITY D ON A.ID_CITY = D.ID
                                                ${query_interest} ${query_community_id} ${query_community_name} ${query_number_participant} 
                                                ${query_category} ${query_city} ${query_province} ${query_status}
                                            )
                                            SELECT *, COUNT(*) OVER ()
                                            FROM COMMUNITY_PREVIEW
                                            ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince [username : "${username}" | email : "${email}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "community_id" : query_result.rows[i].id_community,
                        "community_name" : query_result.rows[i].community_name,
                        "interest_name" : query_result.rows[i].interest_name,
                        "city_based" : query_result.rows[i].city_name,
                        "province_based" : query_result.rows[i].province_based,
                        "community_current_member" : query_result.rows[i].member
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
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

exports.getCommunityDetail = asyncHandler(async function getCommunityDetail(req, res, community_id, community_name, users_username_token) {
    let isError = false, result = [], query_community = ""

    if(!community_id && !community_name){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-000",
                "error_message" : `Community Name dan Community ID tidak boleh kosong`
            }
        })
    }

    if(community_id) {
        query_community = `WHERE A.ID_COMMUNITY ILIKE LOWER('${community_id}')`
    } else if(community_name){
        query_community = `WHERE A.NAME ILIKE LOWER('${community_id}')`
    }

    console.log(`WITH COMMUNITY_DETAIL AS (
        SELECT
                A.ID_COMMUNITY,
                A.NAME AS COMMUNITY_NAME,
                A.DESCRIPTION,
                (SELECT COUNT(ID_EVENT) FROM EVENTS WHERE ID_CREATOR = A.ID_COMMUNITY) AS CREATED_EVENT,
                (SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) AS MEMBER,
                B.NAME AS INTEREST_NAME,
                D.NAME AS CITY_NAME,
                C.NAME AS PROVINCE_NAME,
                CASE 
                    WHEN ((SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) = (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY = A.ID_COMMUNITY)) THEN 'isCreator'
                    WHEN ((SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) IN (SELECT ID_USER FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE)) THEN 'Accepted'
                    WHEN ((SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) IN (SELECT ID_USER FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = FALSE)) THEN 'Pending'
                    ELSE 'Nothing'
                END AS USER_STATUS
                FROM COMMUNITY A JOIN INTEREST B ON A.ID_INTEREST = B.ID
            JOIN PROVINCE C ON A.ID_PROVINCE = C.ID
            JOIN CITY D ON A.ID_CITY = D.ID
            ${query_community}
        )
        SELECT *, COUNT(*) OVER ()
        FROM COMMUNITY_DETAIL`)

    try {
        var query_result = await pool.query(`WITH COMMUNITY_DETAIL AS (
                                            SELECT
                                                    A.ID_COMMUNITY,
                                                    A.NAME AS COMMUNITY_NAME,
                                                    A.DESCRIPTION,
                                                    (SELECT COUNT(ID_EVENT) FROM EVENTS WHERE ID_CREATOR = A.ID_COMMUNITY) AS CREATED_EVENT,
                                                    (SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) AS MEMBER,
                                                    B.NAME AS INTEREST_NAME,
                                                    D.NAME AS CITY_NAME,
                                                    C.NAME AS PROVINCE_NAME,
                                                    CASE 
                                                        WHEN ((SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) = (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY = A.ID_COMMUNITY)) THEN 'isCreator'
                                                        WHEN ((SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) IN (SELECT ID_USER FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE)) THEN 'Accepted'
                                                        WHEN ((SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) IN (SELECT ID_USER FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = FALSE)) THEN 'Pending'
                                                        ELSE 'Nothing'
                                                    END AS USER_STATUS
                                                FROM COMMUNITY A JOIN INTEREST B ON A.ID_INTEREST = B.ID
                                                JOIN PROVINCE C ON A.ID_PROVINCE = C.ID
                                                JOIN CITY D ON A.ID_CITY = D.ID
                                                ${query_community}
                                            )
                                            SELECT *, COUNT(*) OVER ()
                                            FROM COMMUNITY_DETAIL`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /community/getCommunity/detail [username : "${users_username_token}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "community_id" : query_result.rows[i].id_community,
                        "community_name" : query_result.rows[i].community_name,
                        "community_description" : query_result.rows[i].description,
                        "interest_name" : query_result.rows[i].interest_name,
                        "city_based" : query_result.rows[i].city_name,
                        "province_based" : query_result.rows[i].province_name,
                        "community_current_member" : query_result.rows[i].member,
                        "community_created_events" : query_result.rows[i].created_event,
                        "user_status" : query_result.rows[i].user_status
                    }
                    result.push(object)
                }

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", 1, 1, 1, result)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /community/getCommunity/detail - Success return the result`)

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

exports.addCommunity = asyncHandler(async function addEvent(req, res, community_name, community_description, province_name, city_name, interest_id, users_username_token){
    let isError = false, result = []

    if(!community_name || !community_description || !province_name || !city_name || !interest_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-002",
                "error_message" : `Data pada BODY tidak lengkap`
            }
        })
    }

    community_name = utility.toTitleCase(community_name)

    try {
        var query_result = await pool.query(`INSERT INTO COMMUNITY (CREATED, NAME, ID_PROVINCE, ID_CITY, ID_INTEREST, DESCRIPTION) 
                                            VALUES (NOW() AT TIME ZONE 'Asia/Jakarta', '${community_name}', (SELECT ID FROM PROVINCE WHERE NAME ILIKE LOWER('${province_name}')),
                                            (SELECT ID FROM CITY WHERE NAME ILIKE LOWER('${city_name}')), ${interest_id},'${community_description}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /community/addCommunity [username : "${users_username_token}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                let isError1 = false

                try {
                    query_result_1 = await pool.query(`INSERT INTO IS_ADMIN (ID, CREATED, ID_USER, ID_COMMUNITY) 
                                                        VALUES ((SELECT MAX(ID)+1 FROM IS_ADMIN), NOW() AT TIME ZONE 'Asia/Jakarta', (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')), 
                                                        (SELECT ID_COMMUNITY FROM COMMUNITY WHERE NAME ILIKE LOWER('${community_name}')))`)
                } catch (error) {
                    isError1 = true
                    log.error(`ERROR | /community/addCommunity - add isAdmin [username : "${users_username_token}"] - Error found while connect to DB - ${error}`)
                } finally {
                    if(!isError1){
                        respond.successResp(req, res, "nearbud-000-000", "Data berhasil ditambahkan", 1, 1, 1, result)
                        log.info(`SUCCESS | /community/addCommunity - Success return the result`)
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

exports.editCommunity = asyncHandler(async function editCommunity(req, res, community_name, community_description, province_name, city_name, interest_id, users_username_token, community_id) {
    let isError = false, result = []

    if(!community_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-002",
                "error_message" : `Community ID tidak boleh kosong`
            }
        })
    }

    let isCreator = await event.isCreator(req, res, users_username_token, community_id)
    console.log(isCreator)
    if(isCreator == "notCreator"){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-001",
                "error_message" : `Unauthorized, anda bukan Creator Community tersebut`
            }
        })
    }

    if(community_name){
        community_name = `,NAME = '${utility.toTitleCase(community_name)}'`
    } else { community_name = ''}

    if(community_description){
        community_description = `,DESCRIPTION = '${community_description}'`
    } else { community_description = '' }

    if(province_name){
        province_name = `,ID_PROVINCE = (SELECT ID FROM PROVINCE WHERE NAME ILIKE LOWER('${province_name}'))`
    } else { province_name = '' }

    if(city_name){
        city_name = `,ID_CITY = (SELECT ID FROM CITY WHERE NAME ILIKE LOWER('${city_name}'))`
    } else { city_name = '' }

    if(interest_id){
        interest_id = `,ID_INTEREST = '${interest_id.toUpperCase()}'`
    } else { interest_id = '' }

    console.log(`UPDATE COMMUNITY SET MODIFIED = NOW() AT TIME ZONE 'Asia/Jakarta' ${community_name}${community_description} 
        ${province_name} ${city_name} ${interest_id} WHERE ID_COMMUNITY ILIKE LOWER('${community_id}')`)

    try {
        query_result_1 = await pool.query(`UPDATE COMMUNITY SET MODIFIED = NOW() AT TIME ZONE 'Asia/Jakarta' ${community_name}${community_description} 
            ${province_name} ${city_name} ${interest_id} WHERE ID_COMMUNITY ILIKE LOWER('${community_id}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /community/editCommunity [username : "${users_username_token}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            respond.successResp(req, res, "nearbud-000-000", "Data berhasil diperbaharui", 1, 1, 1, result)
            log.info(`SUCCESS | /community/editCommunity - Success return the result`)
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