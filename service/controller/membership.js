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
            INSERT INTO COMMUNITY_LINK(ID, ID_COMMUNITY, ID_USER) VALUES 
            (
                (SELECT MAX(id) + 1 FROM COMMUNITY_LINK), 
                (SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY = '${community_id}'), 
                (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username}'))
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

// exports.

// exports.getEventLink = asyncHandler(async function getEventLink(req, res, users_id, users_username, event_id, is_approved, page, size){
//     let isError = false, result = [], query_where = "", query_users_id = "", query_event_id = "", query_is_approved = "", query_users_username = ""

//     var query_pagination = respond.query_pagination(req,res, page, size)

//     if(users_id || users_username || event_id || is_approved) query_where = "WHERE" 

//     if(users_id) {
//         query_users_id = `A.ID_USER ILIKE LOWER('${users_id}')`

//         if(users_username) {
//             query_users_username = `AND C.USERNAME ILIKE LOWER('${users_username}')`
//         }

//         if(event_id){
//             query_event_id = `AND A.ID_EVENT ILIKE LOWER('${event_id}')`
//         }

//         if(is_approved){
//             query_is_approved = `AND A.IS_APPROVED = '${is_approved}'`
//         }
//     } else {
//         if(users_username) {
//             query_users_username = `C.USERNAME ILIKE LOWER('${users_username}')`
            
//             if(event_id){
//                 query_event_id = `AND A.ID_EVENT ILIKE LOWER('${event_id}')`
//             }
    
//             if(is_approved){
//                 query_is_approved = `AND A.IS_APPROVED = '${is_approved}'`
//             }
//         } else {
//             if(event_id){
//                 query_event_id = `A.ID_EVENT ILIKE LOWER('${event_id}')`
                
//                 if(is_approved){
//                     query_is_approved = `AND A.IS_APPROVED = '${is_approved}'`
//                 }
//             } else {
//                 if(is_approved){
//                     query_is_approved = `A.IS_APPROVED = '${is_approved}'`
//                 }
//             }
//         }
//     }

//     console.log(`WITH EVENT_LINK AS (
//                 SELECT 
//                     A.*,
//                     C.NAME,
//                     B.NAME,
                    // (SELECT ROUND(AVG(rating)) AS average_rating
                    // FROM review
                    // WHERE id_reviewee = A.ID_USER
                    // GROUP BY id_reviewee) AS AVG_RATING
//                 FROM EVENTS_LINK A JOIN EVENTS B ON A.ID_EVENT = B.ID_EVENT 
//                 JOIN USERS C ON A.ID_USER = C.ID_USER
//                 ${query_where} ${query_users_id} ${query_users_username} ${query_event_id} ${query_is_approved})
//                 SELECT *, COUNT (*)OVER ()
//                 FROM EVENT_LINK`)

//     try {
//         var query_result = await pool.query(`WITH EVENT_LINK AS (
//                                             SELECT 
//                                                 A.*,
//                                                 C.NAME AS USERS_NAME,
//                                                 B.NAME AS EVENT_NAME,
//                                                 (SELECT ROUND(AVG(rating)) AS average_rating
//                                                 FROM review
//                                                 WHERE id_reviewee = A.ID_USER
//                                                 GROUP BY id_reviewee) AS AVG_RATING
//                                             FROM EVENTS_LINK A JOIN EVENTS B ON A.ID_EVENT = B.ID_EVENT 
//                                             JOIN USERS C ON A.ID_USER = C.ID_USER
//                                             ${query_where} ${query_users_id} ${query_users_username} ${query_event_id} ${query_is_approved})
//                                             SELECT *, COUNT (*)OVER ()
//                                             FROM EVENT_LINK
//                                             ${query_pagination}`)
//     } catch (error) {
//         isError = true
//         log.error(`ERROR | /membership/getEventLink - Error found while connect to DB - ${error}`)
//     } finally {
//         if(!isError){
//             console.log(query_result.rows)
//             if(query_result.rowCount > 0 ){
//                 for( let i = 0; i < query_result.rowCount; i++){
//                     var object = {
//                         "event_id" : query_result.rows[i].id_event,
//                         "event_name" : query_result.rows[i].event_name,
//                         "users_id" : query_result.rows[i].id_user,
//                         "users_name" : query_result.rows[i].users_name,
//                         "users_status" : query_result.rows[i].user_status,
//                         "users_avg_rating" : query_result.rows[i].avg_rating
//                     }
//                     result.push(object)
//                 }

//                 var total_query_data = query_result.rowCount
//                 var total_data = query_result.rows[0].count

//                 respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result, size)
//             } else {
//                 respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result, size)
//             }
//             log.info(`SUCCESS | /membership/getEventLink - Success return the result`)
            
//         } else {
//             return res.status(500).json({
//                 "error_schema" : {
//                     "error_code" : "nearbud-003-001",
//                     "error_message" : `Error while connecting to DB`
//                 }
//             })
//         }
//     }
// })
