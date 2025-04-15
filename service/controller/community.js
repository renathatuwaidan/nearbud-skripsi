const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const config = require("../config/general")
const respond = require("./respond")
const utility = require("./utility")
const event = require("./event")

exports.getCommunityPreview = asyncHandler(async function getCommunityPreview(req, res, community_id, community_name, community_number_participant, category_id, interest_id1, interest_id2, interest_id3, interest_id4, interest_id5, 
    city_id1, city_id2, city_id3, city_id4, city_id5, province_based, status, page, size, users_username_token) {
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

        if(category_id){
            query_category = `AND ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category_id})`
        }

        if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
            if(city_id1) {city_id1 = `'${city_id1}'`} else {city_id1 = ''}
            if(city_id2) {city_id2 = `,'${city_id2}'`} else {city_id2 = ''}
            if(city_id3) {city_id3 = `,'${city_id3}'`} else {city_id3 = ''}
            if(city_id4) {city_id4 = `,'${city_id4}'`} else {city_id4 = ''}
            if(city_id5) {city_id5 = `,'${city_id5}'`} else {city_id5 = ''}

            query_city = `AND A.ID_city IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
        }

        if(province_based){
            query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
        }

        if(status){
            if(status.toLowerCase() == 'available'){
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
    
            if(category_id){
                query_category = `AND ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category_id})`
            }
    
            if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
                if(city_id1) {city_id1 = `'${city_id1}'`} else {city_id1 = ''}
                if(city_id2) {city_id2 = `,'${city_id2}'`} else {city_id2 = ''}
                if(city_id3) {city_id3 = `,'${city_id3}'`} else {city_id3 = ''}
                if(city_id4) {city_id4 = `,'${city_id4}'`} else {city_id4 = ''}
                if(city_id5) {city_id5 = `,'${city_id5}'`} else {city_id5 = ''}
    
                query_city = `AND A.ID_city IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
            }
    
            if(province_based){
                query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
            }

            if(status){
                if(status.toLowerCase() == 'available'){
                    query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                }
            }
        } else {
            if(community_name){
                query_community_name = `WHERE A.NAME ILIKE LOWER('${community_name}')`

                if(community_number_participant){
                    query_number_participant = `AND ((SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) <= ${community_number_participant})`
                }
        
                if(category_id){
                    query_category = `AND ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category_id})`
                }
        
                if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
                    if(city_id1) {city_id1 = `'${city_id1}'`} else {city_id1 = ''}
                    if(city_id2) {city_id2 = `,'${city_id2}'`} else {city_id2 = ''}
                    if(city_id3) {city_id3 = `,'${city_id3}'`} else {city_id3 = ''}
                    if(city_id4) {city_id4 = `,'${city_id4}'`} else {city_id4 = ''}
                    if(city_id5) {city_id5 = `,'${city_id5}'`} else {city_id5 = ''}
        
                    query_city = `AND A.ID_city IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
                }
        
                if(province_based){
                    query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
                }

                if(status){
                    if(status.toLowerCase() == 'available'){
                        query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                    }
                }
            } else {
                if(community_number_participant){
                    query_number_participant = `WHERE ((SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) <= ${community_number_participant})`
                    
                    if(category_id){
                        query_category = `AND ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category_id})`
                    }
            
                    if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
                        if(city_id1) {city_id1 = `'${city_id1}'`} else {city_id1 = ''}
                        if(city_id2) {city_id2 = `,'${city_id2}'`} else {city_id2 = ''}
                        if(city_id3) {city_id3 = `,'${city_id3}'`} else {city_id3 = ''}
                        if(city_id4) {city_id4 = `,'${city_id4}'`} else {city_id4 = ''}
                        if(city_id5) {city_id5 = `,'${city_id5}'`} else {city_id5 = ''}
            
                        query_city = `AND A.ID_city IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
                    }
            
                    if(province_based){
                        query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
                    }

                    if(status){
                        if(status.toLowerCase() == 'available'){
                            query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                        }
                    }
                } else {
                    if(category_id){
                        query_category = `WHERE ID_INTEREST IN (SELECT ID FROM INTEREST WHERE ID_CATEGORY = ${category_id})`
                        
                        if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
                            if(city_id1) {city_id1 = `'${city_id1}'`} else {city_id1 = ''}
                            if(city_id2) {city_id2 = `,'${city_id2}'`} else {city_id2 = ''}
                            if(city_id3) {city_id3 = `,'${city_id3}'`} else {city_id3 = ''}
                            if(city_id4) {city_id4 = `,'${city_id4}'`} else {city_id4 = ''}
                            if(city_id5) {city_id5 = `,'${city_id5}'`} else {city_id5 = ''}
                
                            query_city = `AND A.ID_city IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
                        }
                
                        if(province_based){
                            query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
                        }

                        if(status){
                            if(status.toLowerCase() == 'available'){
                                query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                            }
                        }
                    } else {
                        if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
                            if(city_id1) {city_id1 = `'${city_id1}'`} else {city_id1 = ''}
                            if(city_id2) {city_id2 = `,'${city_id2}'`} else {city_id2 = ''}
                            if(city_id3) {city_id3 = `,'${city_id3}'`} else {city_id3 = ''}
                            if(city_id4) {city_id4 = `,'${city_id4}'`} else {city_id4 = ''}
                            if(city_id5) {city_id5 = `,'${city_id5}'`} else {city_id5 = ''}
                
                            query_city = `WHERE A.ID_city IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
                            
                            if(province_based){
                                query_province = `AND C.NAME ILIKE LOWER('${province_based}')`
                            }

                            if(status){
                                if(status.toLowerCase() == 'available'){
                                    query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                                }
                            }
                        } else {
                            if(province_based){
                                query_province = `WHERE C.NAME ILIKE LOWER('${province_based}')`

                                if(status){
                                    if(status.toLowerCase() == 'available'){
                                        query_status = `AND ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
                                    }
                                }
                            } else {
                                if(status){
                                    if(status.toLowerCase() == 'available'){
                                        query_status = `WHERE ID_COMMUNITY NOT IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER ('${users_username_token}')) AND IS_APPROVED = 'true')`
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
            A.ID_PROFILE,
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
                                                    A.ID_PROFILE,
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
                        "community_current_member" : query_result.rows[i].member,
                        "community_id_profile" : query_result.rows[i].id_profile 
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

exports.getCommunityCreator = asyncHandler(async function getCommunityCreator(req, res, id_creator, users_username_token, page, size) {
    let isError = false, result = [], query_creator= ""

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(id_creator){
        query_creator = `A.ID_USER ILIKE LOWER('${id_creator}')`
    } else {
        query_creator = `A.ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
    }

    console.log(`WITH COMMUNITY_ADMIN AS (
                    SELECT A.ID_COMMUNITY, C.NAME, c.ID_PROFILE
                    FROM IS_ADMIN A JOIN USERS B ON A.ID_USER = B.ID_USER
                    JOIN COMMUNITY C ON A.ID_COMMUNITY = C.ID_COMMUNITY
                    WHERE ${query_creator}
                )
                SELECT *, COUNT(*) OVER ()
                FROM COMMUNITY_ADMIN
                ${query_pagination}`)

    try {
        var query_result = await pool.query(`WITH COMMUNITY_ADMIN AS (
                                                SELECT A.ID_COMMUNITY, C.NAME, C.ID_PROFILE
                                                FROM IS_ADMIN A JOIN USERS B ON A.ID_USER = B.ID_USER
                                                JOIN COMMUNITY C ON A.ID_COMMUNITY = C.ID_COMMUNITY
                                                WHERE ${query_creator}
                                            )
                                            SELECT *, COUNT(*) OVER ()
                                            FROM COMMUNITY_ADMIN
                                            ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /community/getCommunity/isCreator - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "community_id" : query_result.rows[i].id_community,
                        "community_name" : query_result.rows[i].name,
                        "community_id_profile" : query_result.rows[i].id_profile
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /community/getCommunity/isCreator - Success return the result`)

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

exports.addAdmin = asyncHandler(async function addAdmin(req, res, id_user, id_community, users_username_token) {
    let isError1 = false, result = [], isError = false, isError2 = false

    if(!id_user || !id_community){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-002",
                "error_message" : `Data pada BODY tidak lengkap`
            }
        })
    }

    console.log( `SELECT * FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND ID_COMMUNITY ILIKE LOWER('${id_community}')`)

    try {
        var query_result = await pool.query( `SELECT * FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND ID_COMMUNITY ILIKE LOWER('${id_community}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /community/addAdmin - Error found while connecting to DB - ${error}`);
    } finally {
        if(!isError){
            if(query_result.rowCount == 0){
                return res.status(500).json({
                    "error_schema": {
                        "error_code": "nearbud-000-001",
                        "error_message": `Unauthorized, anda bukan admin dari komunitas`
                    }
                })
            } else {
                try {
                    var query_result = await pool.query(`
                        INSERT INTO IS_ADMIN(ID, ID_COMMUNITY, ID_USER, CREATED) VALUES 
                        (
                            (SELECT MAX(id) + 1 FROM IS_ADMIN), 
                            (SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY ILIKE LOWER('${id_community}')), 
                            (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${id_user}')), 
                            NOW()
                        )
                    `)
                } catch (error) {
                    isError1 = true;
                    log.error(`ERROR | /community/addAdmin - Error found while connecting to DB - ${error}`);
                } finally {
                    if (isError1) {
                        return res.status(500).json({
                            "error_schema": {
                                "error_code": "nearbud-003-001",
                                "error_message": `Error while connecting to DB`
                            }
                        })
                    } else {
                        try {
                            var query_result = await pool.query(`
                                DELETE FROM COMMUNITY_LINK WHERE ID_USER ILIKE LOWER('${id_user}') AND ID_COMMUNITY ILIKE LOWER('${id_community}')
                            `)
                        } catch (error) {
                            isError2 = true
                            log.error(`ERROR | /community/addAdmin - Error found while connecting to DB - ${error}`);
                        } finally {
                            if(!isError2){
                                respond.successResp(req, res, "nearbud-000-000", "Berhasil menambahkan data", 0, 0, 0, result)
                            } else {
                                return res.status(500).json({
                                    "error_schema": {
                                        "error_code": "nearbud-003-001",
                                        "error_message": `Error while connecting to DB`
                                    }
                                })
                            }
                        }
                    }
                }
            }
        } else {
            return res.status(500).json({
                "error_schema": {
                    "error_code": "nearbud-003-001",
                    "error_message": `Error while connecting to DB`
                }
            })
        }
    }
})

exports.deleteAdmin = asyncHandler(async function deleteAdmin(req, res, id_user, id_community, users_username_token) {
    let isError1 = false, result = [], isError = false, isError2 = false

    if(!id_user || !id_community){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-002",
                "error_message" : `Data pada BODY tidak lengkap`
            }
        })
    }

    console.log( `SELECT * FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND ID_COMMUNITY ILIKE LOWER('${id_community}')`)

    try {
        var query_result = await pool.query( `SELECT * FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND ID_COMMUNITY ILIKE LOWER('${id_community}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /community/addAdmin - Error found while connecting to DB - ${error}`);
    } finally {
        if(!isError){
            if(query_result.rowCount == 0){
                return res.status(500).json({
                    "error_schema": {
                        "error_code": "nearbud-000-001",
                        "error_message": `Unauthorized, anda bukan admin dari komunitas`
                    }
                })
            } else {
                try {
                    var query_result = await pool.query(`
                        DELETE FROM IS_ADMIN WHERE ID_USER ILIKE LOWER('${id_user}') AND ID_COMMUNITY ILIKE LOWER('${id_community}')
                    `)
                } catch (error) {
                    isError1 = true;
                    log.error(`ERROR | /community/addAdmin - Error found while connecting to DB - ${error}`);
                } finally {
                    if (isError1) {
                        return res.status(500).json({
                            "error_schema": {
                                "error_code": "nearbud-003-001",
                                "error_message": `Error while connecting to DB`
                            }
                        })
                    } else {
                        console.log(`
                            INSERT INTO COMMUNITY_LINK (ID, ID_COMMUNITY, ID_USER, IS_APPROVED) 
                            VALUES ((SELECT MAX(ID) + 1 FROM COMMUNITY_LINK),
                            (SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY ILIKE LOWER('${id_community}')), 
                            (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${id_user}')), 
                            'true')
                        `)

                        try {
                            var query_result = await pool.query(`
                                INSERT INTO COMMUNITY_LINK (ID, ID_COMMUNITY, ID_USER, IS_APPROVED) 
                                VALUES ((SELECT MAX(ID) + 1 FROM COMMUNITY_LINK),
                                (SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY ILIKE LOWER('${id_community}')), 
                                (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${id_user}')), 
                                'true')
                            `)
                        } catch (error) {
                            isError2 = true
                            log.error(`ERROR | /community/addAdmin - Error found while connecting to DB - ${error}`);
                        } finally {
                            if(!isError2){
                                respond.successResp(req, res, "nearbud-000-000", "Berhasil menghapus data", 0, 0, 0, result)
                            } else {
                                return res.status(500).json({
                                    "error_schema": {
                                        "error_code": "nearbud-003-001",
                                        "error_message": `Error while connecting to DB`
                                    }
                                })
                            }
                        }
                    }
                }
            }
        } else {
            return res.status(500).json({
                "error_schema": {
                    "error_code": "nearbud-003-001",
                    "error_message": `Error while connecting to DB`
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
                A.ID_PROFILE,
                (SELECT COUNT(ID_EVENT) FROM EVENTS WHERE ID_CREATOR = A.ID_COMMUNITY) AS CREATED_EVENT,
                (SELECT COUNT(ID_USER) FROM COMMUNITY_LINK WHERE ID_COMMUNITY = A.ID_COMMUNITY AND IS_APPROVED = TRUE) AS MEMBER,
                B.NAME AS INTEREST_NAME,
                D.NAME AS CITY_NAME,
                C.NAME AS PROVINCE_NAME,
                CASE 
                    WHEN ((SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) = (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY = A.ID_COMMUNITY AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))) THEN 'isCreator'
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
                                                    A.ID_PROFILE,
                                                    CASE 
                                                        WHEN ((SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) = (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY = A.ID_COMMUNITY AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))) THEN 'isCreator'
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
                        "community_id_profile" : query_result.rows[i].id_profile,
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

exports.addCommunity = asyncHandler(async function addEvent(req, res, community_name, community_description, province_name, city_name, interest_id, users_username_token, community_id_profile){
    let isError = false, result = []

    if(!community_name || !community_description || !province_name || !city_name || !interest_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-002",
                "error_message" : `Data pada BODY tidak lengkap`
            }
        })
    }

    if(!community_id_profile){
        id_profile = ""
    }

    community_name = utility.toTitleCase(community_name)

    try {
        var query_result = await pool.query(`INSERT INTO COMMUNITY (CREATED, NAME, ID_PROVINCE, ID_CITY, ID_INTEREST, DESCRIPTION, ID_PROFILE) 
                                            VALUES (NOW(), '${community_name}', (SELECT ID FROM PROVINCE WHERE NAME ILIKE LOWER('${province_name}')),
                                            (SELECT ID FROM CITY WHERE NAME ILIKE LOWER('${city_name}')), ${interest_id},'${community_description}', '${community_id_profile}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /community/addCommunity [username : "${users_username_token}"] - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                let isError1 = false

                try {
                    query_result_1 = await pool.query(`INSERT INTO IS_ADMIN (ID, CREATED, ID_USER, ID_COMMUNITY) 
                                                        VALUES ((SELECT MAX(ID)+1 FROM IS_ADMIN), NOW(), (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')), 
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

exports.editCommunity = asyncHandler(async function editCommunity(req, res, community_name, community_description, province_name, city_name, interest_id, users_username_token, community_id, id_profile) {
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

    if(id_profile){
        id_profile = `, ID_PROFILE = '${id_profile}'`
    } else { id_profile = '' }

    console.log(`UPDATE COMMUNITY SET MODIFIED = NOW() ${community_name}${community_description} 
        ${province_name} ${city_name} ${interest_id} ${id_profile} WHERE ID_COMMUNITY ILIKE LOWER('${community_id}')`)

    try {
        query_result_1 = await pool.query(`UPDATE COMMUNITY SET MODIFIED = NOW() ${community_name}${community_description} 
            ${province_name} ${city_name} ${interest_id} ${id_profile} WHERE ID_COMMUNITY ILIKE LOWER('${community_id}')`)
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

exports.getBulletin = asyncHandler(async function getBulletin(req, res, community_id, page, size) {
    let result = [], isError = false

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(!community_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-000",
                "error_message" : `Community ID tidak boleh kosong`
            }
        })
    }

    console.log(`WITH COMMUNITY_BULLETIN AS (
                    SELECT *, (SELECT NAME FROM USERS WHERE ID_USER = A.ID_CREATOR) AS CREATOR_NAME FROM COMMUNITY_BULLETIN A 
                    WHERE A.ID_COMMUNITY ILIKE LOWER('${community_id}') ORDER BY A.CREATED DESC
                )
                SELECT *, COUNT(*) OVER ()
                FROM COMMUNITY_BULLETIN ${query_pagination}`)

    try {
        var query_result = await pool.query(`WITH COMMUNITY_BULLETIN AS (
                                                SELECT *, (SELECT NAME FROM USERS WHERE ID_USER = A.ID_CREATOR) AS CREATOR_NAME FROM COMMUNITY_BULLETIN A 
                                                WHERE A.ID_COMMUNITY ILIKE LOWER('${community_id}') ORDER BY A.CREATED DESC
                                            )
                                            SELECT *, COUNT(*) OVER ()
                                            FROM COMMUNITY_BULLETIN ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /community/getBulletin - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var fullDisplayDateTime = utility.fullDisplayDateTime(query_result.rows[i].created)

                    var object = {
                        "community_id" : query_result.rows[i].id_community,
                        "bulletin_title" : query_result.rows[i].title,
                        "bulletin_message" : query_result.rows[i].body,
                        "bulletin_creator_id" : query_result.rows[i].id_creator,
                        "bulletin_creator_name" : query_result.rows[i].creator_name,
                        "bulletin_time_created" : fullDisplayDateTime,
                        "id_picture" : 'pending firebase'
                    }
                    result.push(object)
                }
                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result, size)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /community/getBulletin - Success return the result`)

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