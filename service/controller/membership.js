const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const config = require("../config/general")
const respond = require("./respond")
const events = require("./event")
const utility = require("./utility")

exports.getEventLink_preview = asyncHandler(async function getEventLink_preview(req, res, users_id, community_id, status, users_username_token, page, size) {
    let isError = false, result = [], query_status = "", query_from = ""

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(!status){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-000",
                "error_message" : `Status tidak boleh kosong`
            }
        })
    }

    if(!users_id){
        query_from = "JOIN EVENTS_LINK G ON A.ID_EVENT = G.ID_EVENT"
        if(status.toLowerCase() == "attended"){
            query_status = `A.DATE < CURRENT_DATE AND G.IS_APPROVED = true AND G.ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
        } else if (status.toLowerCase() == "active"){
            query_status = `A.DATE >= CURRENT_DATE AND G.IS_APPROVED = true AND G.ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
        } else if(status.toLowerCase() == "rsvp"){
            query_status = `A.DATE >= CURRENT_DATE AND A.ID_EVENT IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))))`
        } else if (status.toLowerCase() == "today"){
            query_status = `A.DATE = CURRENT_DATE AND G.IS_APPROVED = true AND G.ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
        } else {
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Status tidak dalam format yang sesuai (Opsi : today, attended, rsvp, active)`
                }
            })
        }
    } else {
        query_from = "JOIN EVENTS_LINK G ON A.ID_EVENT = G.ID_EVENT"
        if(status.toLowerCase() == "attended"){
            query_status = `A.DATE < CURRENT_DATE AND G.IS_APPROVED = true AND G.ID_USER = (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${users_id}'))`
        } else if (status.toLowerCase() == "active"){
            query_status = `A.DATE >= CURRENT_DATE AND G.IS_APPROVED = true AND G.ID_USER = (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${users_id}'))`
        } else if(status.toLowerCase() == "rsvp"){
            query_status = `A.DATE >= CURRENT_DATE AND A.ID_EVENT IN (SELECT ID_EVENT FROM EVENTS WHERE ID_CREATOR IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${users_id}'))))`
        } else if(status.toLowerCase() == "today"){
            query_status = `A.DATE = CURRENT_DATE AND G.IS_APPROVED = true AND G.ID_USER = (SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${users_id}'))`
        } else {
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Status tidak dalam format yang sesuai (Opsi : today, attended, rsvp, active)`
                }
            })
        }
    }

    if(community_id){
        if(status.toLowerCase() == "history"){
            query_status = `A.DATE < CURRENT_DATE AND A.ID_CREATOR ILIKE LOWER('${community_id}')`
        } else if(status.toLowerCase() == "active"){
            query_status = `A.DATE >= CURRENT_DATE AND A.ID_CREATOR ILIKE LOWER('${community_id}')`
        } else {
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Status tidak dalam format yang sesuai (Opsi : today, attended, rsvp, active)`
                }
            })
        }
    }

    console.log(query_status)

    console.log(`WITH EVENT_DATE_LIST AS (
                                            SELECT DISTINCT TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE 
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            ${query_from}
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            WHERE ${query_status}
                                        )
                                        SELECT *, COUNT (*)OVER ()
                                        FROM EVENT_DATE_LIST
                                        ${query_pagination}`)

    try {
        var query_result = await pool.query(`WITH EVENT_DATE_LIST AS (
                                            SELECT DISTINCT TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE 
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            ${query_from}
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            WHERE ${query_status}
                                        )
                                        SELECT *, COUNT (*)OVER ()
                                        FROM EVENT_DATE_LIST
                                        ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /membership/getEvents/preview - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var result_list = await events.getEventsPreviewList(req, res, query_result.rows[i].event_date, "", "", "", "",
                        "", "", "", "", "", query_status, query_from)
                    var fullDisplayDate = utility.fullDisplayDate(query_result.rows[i].event_date)

                    var object = {
                        "event_date" : fullDisplayDate,
                        "event_list" : result_list
                    }
                    result.push(object)
                }

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result, size)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result, size)
            }
            log.info(`SUCCESS | /membership/getEvents/preview - Success return the result`)
            
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

exports.getParticipants = asyncHandler(async function getParticipants(req, res, event_id, community_id, page, size) {
    let isError = false, result = [], query_join = ""

    if(!event_id && !community_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-003-001",
                "error_message" : `Parameter tidak boleh kosong`
            }
        })
    }

    if(event_id){
        query_join = `FROM EVENTS_LINK A JOIN EVENTS B ON A.ID_EVENT = B.ID_EVENT
                        JOIN USERS C ON A.ID_USER = C.ID_USER
                        WHERE A.ID_EVENT ILIKE LOWER('${event_id}')`
    } else if (community_id) {
        query_join = `FROM COMMUNITY_LINK A JOIN COMMUNITY B ON A.ID_COMMUNITY = B.ID_COMMUNITY
                        JOIN USERS C ON A.ID_USER = C.ID_USER
                        WHERE A.ID_COMMUNITY ILIKE LOWER('${community_id}')`
    }
    
    console.log(`WITH LIST_PARTICIPANT AS (
                                                SELECT DISTINCT ON (C.ID_USER)
                                                C.ID_USER AS USERS_ID,
                                                C.NAME AS USERS_NAME,
                                                CASE WHEN (SELECT ROUND(AVG(rating), 1) AS average_rating
                                                            FROM review
                                                            WHERE id_reviewee = A.ID_USER
                                                            GROUP BY id_reviewee) IS NULL THEN '0' 
                                                    ELSE (SELECT ROUND(AVG(rating), 1) AS average_rating
                                                            FROM review
                                                            WHERE id_reviewee = A.ID_USER
                                                            GROUP BY id_reviewee) END AS AVG_RATING
                                                ${query_join}
                                            )
                                            SELECT *, COUNT (*)OVER ()
                                            FROM LIST_PARTICIPANT`)

    try {
        var query_result = await pool.query(`WITH LIST_PARTICIPANT AS (
                                                SELECT DISTINCT ON (C.ID_USER)
                                                C.ID_USER AS USERS_ID,
                                                C.NAME AS USERS_NAME,
                                                CASE WHEN (SELECT ROUND(AVG(rating), 1) AS average_rating
                                                            FROM review
                                                            WHERE id_reviewee = A.ID_USER
                                                            GROUP BY id_reviewee) IS NULL THEN '0' 
                                                    ELSE (SELECT ROUND(AVG(rating), 1) AS average_rating
                                                            FROM review
                                                            WHERE id_reviewee = A.ID_USER
                                                            GROUP BY id_reviewee) END AS AVG_RATING
                                                ${query_join}
                                            )
                                            SELECT *, COUNT (*)OVER ()
                                            FROM LIST_PARTICIPANT`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /membership/getParticipant/preview - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "users_id" : query_result.rows[i].users_id,
                        "users_name" : query_result.rows[i].users_name,
                        "users_avg_rating" : query_result.rows[i].avg_rating
                    }
                    result.push(object)
                }

                return result
            } 
            log.info(`SUCCESS | /membership/getParticipant/preview - Success return the result`)
            
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

exports.addCommunityLink = asyncHandler(async function addCommunityLink(req, res, community_id, users_username) {
    let isError1 = false, result = []
    try {
        var query_result = await pool.query(`
            INSERT INTO COMMUNITY_LINK(ID, ID_COMMUNITY, ID_USER, CREATED) VALUES 
            (
                (SELECT MAX(id) + 1 FROM COMMUNITY_LINK), 
                (SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY = '${community_id}'), 
                (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username}')), 
                NOW() AT TIME ZONE 'Asia/Jakarta'
            )
        `)
    } catch (error) {
        isError1 = true;
        log.error(`ERROR | /membership/addCommunityLink [username : "${users_username}"] - Error found while connecting to DB - ${error}`);
    } finally {
        if (isError1) {
            return res.status(500).json({
                "error_schema": {
                    "error_code": "nearbud-003-001",
                    "error_message": `Error while connecting to DB - Failed to Update Community Link`
                }
            });
        } else {
            respond.successResp(req, res, "nearbud-000-000", "Berhasil menambahkan data", 0, 0, 0, result)
        }
    }
})

exports.addEventLink = asyncHandler(async function addEventLink(req, res, users_id, event_id, users_username_token) {
    let isError1 = false, isError = false, result = [], temp_query_user_id = ""

    if(!event_id){
        return res.status(500).json({
            "error_schema": {
                "error_code": "nearbud-001-000",
                "error_message": `Event ID tidak boleh kosong`
            }
        })
    }

    if(!users_id){
        temp_query_user_id = `(SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
    } else {
        temp_query_user_id = `'${users_id.toUpperCase()}'`
    }

    try {
        var query_result = await pool.query(`
            SELECT * FROM EVENTS_LINK WHERE ID_USER = ${temp_query_user_id} AND ID_EVENT = '${event_id.toUpperCase()}'
        `)
    } catch (error) {
        isError = true;
        log.error(`ERROR | /membership/addEventLink [username : "${users_username_token}"] - Error found while connecting to DB - ${error}`);
    } finally {
        if(!isError){
            if(query_result.rowCount > 0){
                return res.status(500).json({
                    "error_schema": {
                        "error_code": "nearbud-000-001",
                        "error_message": `Event Link sudah pernah ditambahkan`
                    }
                })
            } else {
                try {
                    console.log((`
                        INSERT INTO EVENTS_LINK (ID_EVENT, ID_USER, IS_APPROVED, CREATED) VALUES
                        ('${event_id.toUpperCase()}', ${temp_query_user_id}, 'false', NOW() AT TIME ZONE 'Asia/Jakarta')
                    `))
                    var query_result = await pool.query(`
                        INSERT INTO EVENTS_LINK (ID_EVENT, ID_USER, IS_APPROVED, CREATED) VALUES
                        ('${event_id.toUpperCase()}', ${temp_query_user_id}, 'false', NOW() AT TIME ZONE 'Asia/Jakarta')
                    `)
                } catch (error) {
                    isError1 = true;
                    log.error(`ERROR | /membership/addEventLink [username : "${users_username_token}"] - Error found while connecting to DB - ${error}`);
                } finally {
                    if (isError1) {
                        return res.status(500).json({
                            "error_schema": {
                                "error_code": "nearbud-003-001",
                                "error_message": `Error while connecting to DB - Failed to Update Event Link`
                            }
                        });
                    } else {
                        respond.successResp(req, res, "nearbud-000-000", "Berhasil menambahkan data", 0, 0, 0, result)
                    }
                }
            }
        } else {
            return res.status(500).json({
                "error_schema": {
                    "error_code": "nearbud-003-001",
                    "error_message": `Error while connecting to DB`
                }
            });
        }
    }
})

exports.getCommunityMember = asyncHandler(async function getCommunityMember(req, res, community_id, page, size) {
    let isError = false, result = []

    if(!community_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-003-001",
                "error_message" : `Community ID tidak boleh kosong`
            }
        })
    }
    
    console.log(`WITH LIST_PARTICIPANT AS (
                                                SELECT DISTINCT ON (C.ID_USER)
                                                C.ID_USER AS USERS_ID,
                                                C.NAME AS USERS_NAME,
                                                (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY ILIKE LOWER('${community_id}')) as ADMIN_ID,
	                                            (select name from users where id_user = (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY ILIKE LOWER('${community_id}'))) AS ADMIN_NAME
                                                FROM COMMUNITY_LINK A JOIN COMMUNITY B ON A.ID_COMMUNITY = B.ID_COMMUNITY
                                                JOIN USERS C ON A.ID_USER = C.ID_USER
                                                WHERE A.ID_COMMUNITY ILIKE LOWER('${community_id}') AND A.ID_USER NOT IN (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY ILIKE LOWER('${community_id}'))
                                            )
                                            SELECT *, COUNT (*)OVER ()
                                            FROM LIST_PARTICIPANT`)

    try {
        var query_result = await pool.query(`WITH LIST_PARTICIPANT AS (
                                                SELECT DISTINCT ON (C.ID_USER)
                                                C.ID_USER AS USERS_ID,
                                                C.NAME AS USERS_NAME,
                                                (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY ILIKE LOWER('${community_id}')) as ADMIN_ID,
                                                (select name from users where id_user = (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY ILIKE LOWER('${community_id}'))) AS ADMIN_NAME
                                                FROM COMMUNITY_LINK A JOIN COMMUNITY B ON A.ID_COMMUNITY = B.ID_COMMUNITY
                                                JOIN USERS C ON A.ID_USER = C.ID_USER
                                                WHERE A.ID_COMMUNITY ILIKE LOWER('${community_id}') AND A.ID_USER NOT IN (SELECT ID_USER FROM IS_ADMIN WHERE ID_COMMUNITY ILIKE LOWER('${community_id}'))
                                            )
                                            SELECT *, COUNT (*)OVER ()
                                            FROM LIST_PARTICIPANT`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /membership/getCommunityMember - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                let admin = [], members = []
                for( let i = 0; i < query_result.rowCount; i++){
                    var object = {
                        "users_id" : query_result.rows[i].users_id,
                        "users_name" : query_result.rows[i].users_name
                    }
                    members.push(object)
                }

                var object = {
                    "admin_id" : query_result.rows[0].admin_id,
                    "admin_name" : query_result.rows[0].admin_name
                }

                admin.push(object)

                var object1 = {
                    "community_admin" : admin,
                    "community_members" : members
                }

                result.push(object1)

                var total_data = query_result.rows[0].count
                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
            }
            log.info(`SUCCESS | /general/getCommunityMember - Success return the result`)
            
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

exports.getCommunity_preview = asyncHandler(async function getCommunity_preview(req, res, users_id, users_username_token, page, size) {
    let isError = false, result = [], query_user = ""

    var query_pagination = respond.query_pagination(req,res, page, size)

    if(users_id){
        query_user = `WHERE ID_COMMUNITY IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER ILIKE LOWER('${users_id}') AND IS_APPROVED = TRUE)`
    } else {
        query_user = `WHERE ID_COMMUNITY IN (SELECT ID_COMMUNITY FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND IS_APPROVED = TRUE)`
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
                    ${query_user}
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
                                                ${query_user}
                                            )
                                            SELECT *, COUNT(*) OVER ()
                                            FROM COMMUNITY_PREVIEW
                                            ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /membership/getCommunity/preview [username : "${users_username_token}"] - Error found while connect to DB - ${error}`)
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
            log.info(`SUCCESS | /membership/getCommunity/preview - Success return the result`)

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

exports.updateEventLink = asyncHandler(async function updateEventLink(req, res, event_id, users_id, decision) {
    let isError = false, isError1 = false, result = [], query = ""

    if(decision == "approved"){
        query = `UPDATE EVENTS_LINK SET MODIFIED = NOW() AT TIME ZONE 'Asia/Jakarta', IS_APPROVED = 'true' WHERE ID_USER ILIKE LOWER('${users_id}') AND ID_EVENT ILIKE LOWER('${event_id}')`
    } else if (decision == "reject") {
        query = `DELETE FROM EVENTS_LINK WHERE ID_USER ILIKE LOWER('${users_id}') AND ID_EVENT ILIKE LOWER('${event_id}')`
    }
    
    try {
        var query_result = await pool.query(`SELECT * FROM EVENTS_LINK WHERE ID_USER ILIKE LOWER('${users_id}') AND ID_EVENT ILIKE LOWER('${event_id}') AND IS_APPROVED = 'false'`)
    } catch (error) {
        isError = true;
        log.error(`ERROR | /membership/updateEventLink - Error found while connecting to DB - ${error}`);
    } finally {
        if (isError) {
            return res.status(500).json({
                "error_schema": {
                    "error_code": "nearbud-003-001",
                    "error_message": `Error while connecting to DB`
                }
            })
        } else {
            if(query_result.rowCount > 0){
                try {
                    var query_result_1 = await pool.query(query)
                } catch (error) {
                    isError1 = true;
                    log.error(`ERROR | /membership/updateEventLink - Error found while connecting to DB - ${error}`);
                } finally {
                    if (isError1) {
                        return res.status(500).json({
                            "error_schema": {
                                "error_code": "nearbud-003-001",
                                "error_message": `Error while connecting to DB`
                            }
                        });
                    } else {
                        respond.successResp(req, res, "nearbud-000-000", "Berhasil memperbaharui data", 0, 0, 0, result)
                    }
                }
            } else {
                return res.status(200).json({
                    "error_schema": {
                        "error_code": "nearbud-000-001",
                        "error_message": `User sudah terlebih dahulu di "approved" dalam event`
                    }
                });
            }
        }
    }
}) 

exports.deleteEventLink = asyncHandler(async function deleteEventLink(req, res, event_id, users_username_token) {
    let isError = false, isError1 = false, result = []

    try {
        var query_result = await pool.query(`SELECT * FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND ID_EVENT ILIKE LOWER('${event_id}') AND IS_APPROVED = 'true'`)
    } catch (error) {
        isError = true;
        log.error(`ERROR | /membership/deleteEventLink - Error found while connecting to DB - ${error}`);
    } finally {
        if (isError) {
            return res.status(500).json({
                "error_schema": {
                    "error_code": "nearbud-003-001",
                    "error_message": `Error while connecting to DB`
                }
            })
        } else {
            if(query_result.rowCount > 0){
                try {
                    var query_result = await pool.query(`DELETE FROM EVENTS_LINK WHERE ID_EVENT ILIKE LOWER('${event_id}') AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`)
                } catch (error) {
                    isError1 = true;
                    log.error(`ERROR | /membership/deleteEventLink - Error found while connecting to DB - ${error}`);
                } finally {
                    if (isError1) {
                        return res.status(500).json({
                            "error_schema": {
                                "error_code": "nearbud-003-001",
                                "error_message": `Error while connecting to DB`
                            }
                        });
                    } else {
                        respond.successResp(req, res, "nearbud-000-000", "Berhasil menghapus data", 0, 0, 0, result)
                    }
                }
            } else {
                return res.status(200).json({
                    "error_schema": {
                        "error_code": "nearbud-000-001",
                        "error_message": `User harus terlebih dahulu di "approved" dalam event`
                    }
                });
            }
        }
    }
})

exports.deleteCommunityLink = asyncHandler(async function deleteCommunityLink(req, res, community_id, users_username_token) {
    let isError = false, isError1 = false, result = []

    try {
        var query_result = await pool.query(`SELECT * FROM COMMUNITY_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')) AND ID_COMMUNITY ILIKE LOWER('${community_id}') AND IS_APPROVED = 'true'`)
    } catch (error) {
        isError = true;
        log.error(`ERROR | /membership/deleteCommunityLink - Error found while connecting to DB - ${error}`);
    } finally {
        if (isError) {
            return res.status(500).json({
                "error_schema": {
                    "error_code": "nearbud-003-001",
                    "error_message": `Error while connecting to DB`
                }
            })
        } else {
            if(query_result.rowCount > 0){
                try {
                    var query_result = await pool.query(`DELETE FROM COMMUNITY_LINK WHERE ID_COMMUNITY ILIKE LOWER('${community_id}') AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`)
                } catch (error) {
                    isError1 = true;
                    log.error(`ERROR | /membership/deleteCommunityLink - Error found while connecting to DB - ${error}`);
                } finally {
                    if (isError1) {
                        return res.status(500).json({
                            "error_schema": {
                                "error_code": "nearbud-003-001",
                                "error_message": `Error while connecting to DB`
                            }
                        });
                    } else {
                        respond.successResp(req, res, "nearbud-000-000", "Berhasil menghapus data", 0, 0, 0, result)
                    }
                }
            } else {
                return res.status(200).json({
                    "error_schema": {
                        "error_code": "nearbud-000-001",
                        "error_message": `User harus terlebih dahulu di "approved" dalam community`
                    }
                });
            }
        }
    }
})