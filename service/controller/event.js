const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const utility = require("./utility")
const respond = require('./respond')
const membership = require("./membership")
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

exports.getEventsPreview = asyncHandler(async function getEventsPreview(req, res, interest_id1, interest_id2, interest_id3, interest_id4, interest_id5,category_id1, category_id2, category_id3, category_id4, category_id5, province_based, event_location,event_date, event_number_participant, status, event_creator, users_username_token, size, page, city_id1, city_id2, city_id3, city_id4, city_id5) {
    var query_interest = "", query_category = "", query_city = "", query_province_based = "", query_event_location = "", query_event_number_participant = "", query_where = "", query_event_date = "", query_status = "", query_event_creator = "", isError = false, result = []
    
    if( interest_id1 || interest_id2 || interest_id3 || interest_id4 || interest_id5 || category_id1 || category_id2 || category_id3 || category_id4 || category_id5 ||
         province_based || event_location || event_date || event_number_participant || status|| event_creator ||
        city_id1 || city_id2 || city_id3 || city_id4 || city_id5) query_where = 'WHERE '

    if(interest_id1 || interest_id2 || interest_id3 || interest_id4 || interest_id5){
        if(interest_id1){interest_id1 = `'${interest_id1}'`} else interest_id1 = ''
        if(interest_id2){interest_id2 = `,'${interest_id2}'`} else interest_id2 = ''
        if(interest_id3){interest_id3 = `,'${interest_id3}'`} else interest_id3 = ''
        if(interest_id4){interest_id4 = `,'${interest_id4}'`} else interest_id4 = ''
        if(interest_id5){interest_id5 = `,'${interest_id5}'`} else interest_id5 = ''

        query_interest = `A.ID_INTEREST IN (${interest_id1} ${interest_id2} ${interest_id3} ${interest_id4} ${interest_id5})`
    
        if(category_id1 || category_id2 || category_id3 || category_id4 || category_id5){
            if(category_id1){category_id1 = `'${category_id1}'`} else category_id1 = ''
            if(category_id2){category_id2 = `,'${category_id2}'`} else category_id2 = ''
            if(category_id3){category_id3 = `,'${category_id3}'`} else category_id3 = ''
            if(category_id4){category_id4 = `,'${category_id4}'`} else category_id4 = ''
            if(category_id5){category_id5 = `,'${category_id5}'`} else category_id5 = ''
    
            query_category = `AND A.ID_CATEGORY IN (${category_id1} ${category_id2} ${category_id3} ${category_id4} ${category_id5})`
        }

        if(event_date){
            if(event_date == "today"){
                query_event_date = `AND A.DATE::DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                                    AND A.DATE::DATE <= ((NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '1 day')::DATE`
            }

            if(event_date == "now"){
                query_event_date = `AND A.DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')
                                    AND A.DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '6 hours'`
            }
        }
    
        if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
            if(city_id1){city_id1 = `'${city_id1}'`} else city_id1 = ''
            if(city_id2){city_id2 = `,'${city_id2}'`} else city_id2 = ''
            if(city_id3){city_id3 = `,'${city_id3}'`} else city_id3 = ''
            if(city_id4){city_id4 = `,'${city_id4}'`} else city_id4 = ''
            if(city_id5){city_id5 = `,'${city_id5}'`} else city_id5 = ''
    
            query_city = `AND C.ID IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
        }
    
        if(province_based){
            query_province_based = `AND E.NAME ILIKE LOWER('%${province_based}%')`
        }
    
        if(event_location){
            query_event_location = `AND A.LOCATION ILIKE LOWER('${event_location}')`
        }
    
        if(event_number_participant){
            query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
        }

        if(status){
            let query_status_1 = "", query_status_2 = ""

            if(status.includes("available")){
                query_status_1 = `AND (SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT) < A.NUMBER_PARTICIPANT`
                
                if (status.includes("not-joined")){
                    query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                }
            } else {
                if (status.includes("not-joined")){
                    query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                }
            }

            query_status = `${query_status_1} ${query_status_2}`
        }

        console.log("============= " + query_status)

        if(event_creator){
            query_event_creator = `AND ID_CREATOR ILIKE LOWER('${event_creator}')`
        }

    } else {
        if(category_id1 || category_id2 || category_id3 || category_id4 || category_id5){
            if(category_id1){category_id1 = `'${category_id1}'`} else category_id1 = ''
            if(category_id2){category_id2 = `,'${category_id2}'`} else category_id2 = ''
            if(category_id3){category_id3 = `,'${category_id3}'`} else category_id3 = ''
            if(category_id4){category_id4 = `,'${category_id4}'`} else category_id4 = ''
            if(category_id5){category_id5 = `,'${category_id5}'`} else category_id5 = ''
    
            query_category = `A.ID_CATEGORY IN (${category_id1} ${category_id2} ${category_id3} ${category_id4} ${category_id5})`
        
            if(event_date){
                if(event_date == "today"){
                    query_event_date = `AND A.DATE::DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                                        AND A.DATE::DATE <= ((NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '1 day')::DATE`
                }
    
                if(event_date == "now"){
                    query_event_date = `AND A.DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')
                                        AND A.DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '6 hours'`
                }
            }

            if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
                if(city_id1){city_id1 = `'${city_id1}'`} else city_id1 = ''
                if(city_id2){city_id2 = `,'${city_id2}'`} else city_id2 = ''
                if(city_id3){city_id3 = `,'${city_id3}'`} else city_id3 = ''
                if(city_id4){city_id4 = `,'${city_id4}'`} else city_id4 = ''
                if(city_id5){city_id5 = `,'${city_id5}'`} else city_id5 = ''
        
                query_city = `AND C.ID IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`
            }
        
            if(province_based){
                query_province_based = `AND E.NAME ILIKE LOWER('%${province_based}%')`
            }
        
            if(event_location){
                query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
            }
        
            if(event_number_participant){
                query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
            }
            if(status){
                let query_status_1 = "", query_status_2 = ""

                if(status.includes("available")){
                    query_status_1 = `AND (SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT) < A.NUMBER_PARTICIPANT`
                    
                    if (status.includes("not-joined")){
                        query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                    }
                } else {
                    if (status.includes("not-joined")){
                        query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                    }
                }
    
                query_status = `${query_status_1} ${query_status_2}`
            }     
            
            if(event_creator){
                query_event_creator = `AND ID_CREATOR ILIKE LOWER('${event_creator}')`
            }
        } else {
            if(city_id1 || city_id2 || city_id3 || city_id4 || city_id5){
                if(city_id1){city_id1 = `'${city_id1}'`} else city_id1 = ''
                if(city_id2){city_id2 = `,'${city_id2}'`} else city_id2 = ''
                if(city_id3){city_id3 = `,'${city_id3}'`} else city_id3 = ''
                if(city_id4){city_id4 = `,'${city_id4}'`} else city_id4 = ''
                if(city_id5){city_id5 = `,'${city_id5}'`} else city_id5 = ''
        
                query_city = `C.ID IN (${city_id1} ${city_id2} ${city_id3} ${city_id4} ${city_id5})`

                if(province_based){
                    query_province_based = `AND E.NAME ILIKE LOWER('%${province_based}%')`
                }

                if(event_date){
                    if(event_date == "today"){
                        query_event_date = `AND A.DATE::DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                                            AND A.DATE::DATE <= ((NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '1 day')::DATE`
                    }

                    if(event_date == "now"){
                        query_event_date = `AND A.DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')
                                            AND A.DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '6 hours'`
                    }
                }
            
                if(event_location){
                    query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
                }
            
                if(event_number_participant){
                    query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
                }
                if(status){
                    let query_status_1 = "", query_status_2 = ""

                    if(status.includes("available")){
                        query_status_1 = `(SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT) < A.NUMBER_PARTICIPANT`
                        
                        if (status.includes("not-joined")){
                            query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                        }
                    } else {
                        if (status.includes("not-joined")){
                            query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                        }
                    }
        
                    query_status = `${query_status_1} ${query_status_2}`
                }

                if(event_creator){
                    query_event_creator = `AND ID_CREATOR ILIKE LOWER('${event_creator}')`
                }
            } else {
                if(province_based){
                    query_province_based = `E.NAME ILIKE LOWER('%${province_based}%')`

                    if(event_location){
                        query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
                    }

                    if(event_date){
                        if(event_date == "today"){
                            query_event_date = `AND A.DATE::DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                                                AND A.DATE::DATE <= ((NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '1 day')::DATE`
                        }
            
                        if(event_date == "now"){
                            query_event_date = `AND A.DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')
                                                AND A.DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '6 hours'`
                        }
                    }
                
                    if(event_number_participant){
                        query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
                    }

                    if(status){
                        let query_status_1 = "", query_status_2 = ""

                        if(status.includes("available")){
                            query_status_1 = `AND (SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT) < A.NUMBER_PARTICIPANT`
                            
                            if (status.includes("not-joined")){
                                query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                            }
                        } else {
                            if (status.includes("not-joined")){
                                query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                            }
                        }
            
                        query_status = `${query_status_1} ${query_status_2}`
                    }

                    if(event_creator){
                        query_event_creator = `AND ID_CREATOR ILIKE LOWER('${event_creator}')`
                    }
                } else {
                    if(event_location){
                        query_event_location = `A.LOCATION ILIKE LOWER('%${event_location}%')`

                        if(event_number_participant){
                            query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
                        }

                        if(status){
                            let query_status_1 = "", query_status_2 = ""

                            if(status.includes("available")){
                                query_status_1 = `AND (SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT) < A.NUMBER_PARTICIPANT`
                                
                                if (status.includes("not-joined")){
                                    query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                                }
                            } else {
                                if (status.includes("not-joined")){
                                    query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                                }
                            }
                
                            query_status = `${query_status_1} ${query_status_2}`
                        }

                        if(event_creator){
                            query_event_creator = `AND ID_CREATOR ILIKE LOWER('${event_creator}')`
                        }
                    } else {
                        if(event_number_participant){
                            query_event_number_participant = `A.NUMBER_PARTICIPANT = ${event_number_participant}`
                            
                            if(event_date){
                                if(event_date == "today"){
                                    query_event_date = `AND A.DATE::DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                                                        AND A.DATE::DATE <= ((NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '1 day')::DATE`
                                }
                    
                                if(event_date == "now"){
                                    query_event_date = `AND A.DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')
                                                        AND A.DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '6 hours'`
                                }
                            }

                            if(status){
                                let query_status_1 = "", query_status_2 = ""

                                if(status.includes("available")){
                                    query_status_1 = `AND (SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT) < A.NUMBER_PARTICIPANT`
                                    
                                    if (status.includes("not-joined")){
                                        query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                                    }
                                } else {
                                    if (status.includes("not-joined")){
                                        query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                                    }
                                }
                    
                                query_status = `${query_status_1} ${query_status_2}`
                            }

                            if(event_creator){
                                query_event_creator = `AND ID_CREATOR ILIKE LOWER('${event_creator}')`
                            }
                        } else {
                            if(event_date){
                                if(event_date == "today"){
                                    query_event_date = `A.DATE::DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                                                        AND A.DATE::DATE <= ((NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '1 day')::DATE`
                                }

                                if(event_date == "now"){
                                    query_event_date = `A.DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')
                                                        AND A.DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta') + INTERVAL '6 hours'`
                                }

                                if(status){
                                    let query_status_1 = "", query_status_2 = ""

                                    if(status.includes("available")){
                                        query_status_1 = `AND (SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT) < A.NUMBER_PARTICIPANT`
                                        
                                        if (status.includes("not-joined")){
                                            query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                                        }
                                    } else {
                                        if (status.includes("not-joined")){
                                            query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                                        }
                                    }
                        
                                    query_status = `${query_status_1} ${query_status_2}`
                                }

                                if(event_creator){
                                    query_event_creator = `AND ID_CREATOR ILIKE LOWER('${event_creator}')`
                                }
                            } else {
                                if(status){
                                    let query_status_1 = "", query_status_2 = ""

                                    if(status.includes("available")){
                                        query_status_1 = `(SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT) < A.NUMBER_PARTICIPANT`
                                        
                                        if (status.includes("not-joined")){
                                            query_status_2 = `AND A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                                        }
                                    } else {
                                        if (status.includes("not-joined")){
                                            query_status_2 = `A.ID_EVENT NOT IN (SELECT ID_EVENT FROM EVENTS_LINK WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}')))`
                                        }
                                    }
                        
                                    query_status = `${query_status_1} ${query_status_2}`

                                    if(event_creator){
                                        query_event_creator = `AND ID_CREATOR ILIKE LOWER('${event_creator}')`
                                    }
                                } else {
                                    if(event_creator){
                                        query_event_creator = `ID_CREATOR ILIKE LOWER('${event_creator}')`
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    console.log(`${query_where} ${query_interest} ${query_category} ${query_city} ${query_event_date}
        ${query_province_based} ${query_event_location} ${query_event_number_participant} ${query_status}
        ${query_event_creator}`)

    var query_pagination = respond.query_pagination(req,res, page, size)

    console.log(`WITH EVENT_DATE_LIST AS (
        SELECT DISTINCT TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE 
        FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
        JOIN CITY C ON A.CITY_BASED = C.ID
        JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
        JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
        JOIN INTEREST F ON F.ID_CATEGORY = D.ID
        ${query_where} ${query_interest} ${query_category} ${query_city} ${query_event_date}
        ${query_province_based} ${query_event_location} ${query_event_number_participant} ${query_status} ${query_event_creator}
    )
    SELECT *, COUNT (*)OVER ()
    FROM EVENT_DATE_LIST
    ORDER BY EVENT_DATE
    ${query_pagination}`)

    try {
        var query_result = await pool.query(`WITH EVENT_DATE_LIST AS (
            SELECT DISTINCT TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE 
            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
            JOIN CITY C ON A.CITY_BASED = C.ID
            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
            ${query_where} ${query_interest} ${query_category} ${query_city} ${query_event_date}
            ${query_province_based} ${query_event_location} ${query_event_number_participant} ${query_status} ${query_event_creator}
        )
        SELECT *, COUNT (*)OVER ()
        FROM EVENT_DATE_LIST
        ORDER BY EVENT_DATE
        ${query_pagination}`)
    } catch (error) {
        console.log(error)
        isError = true
        log.error(`ERROR | /general/getEventsPreview - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var result_list = await exports.getEventsPreviewList(req, res, query_result.rows[i].event_date, query_interest, query_category, query_city, query_event_date,
                        query_province_based, query_event_location, query_event_number_participant, query_event_creator, "", query_status, "")
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
            log.info(`SUCCESS | /general/getEventsPreview - Success return the result`)
            
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

exports.getEventsPreviewList = asyncHandler(async function getEventsPreviewList(req, res, event_date, query_interest, query_category, query_city_based, query_event_date,
    query_province_based, query_event_location, query_event_number_participant, query_creator, query_community, query_status, query_from, query_events) {
    let result = [], isError = false, query_and = "", q_date = ""

    if(query_interest || query_category || query_city_based || query_event_location || query_event_number_participant 
        || query_community || query_creator || query_events || query_event_date) query_and = `AND`

    if(event_date){
        q_date = `A.DATE::date = '${event_date}'`
    }

    if(!query_status.startsWith("AND")){
        query_status = `AND ${query_status}`
    }

    if(!query_from) query_from = ""

    if(query_events){
        query_events = `ID_EVENT IN ${query_events}`
    } else { query_events = ""}

    console.log(`SELECT DISTINCT ON (ID_EVENT)
                    A.ID_EVENT,
                    A.NAME,
                    CASE 
                        WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
                        WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT NAME FROM USERS WHERE ID_USER = A.ID_CREATOR)
                    END AS CREATOR_NAME,
                    A.LOCATION,
                    C.NAME AS CITY_BASED,
                    E.NAME AS PROVINCE_BASED,
                    A.DURATION,
                    A.DESCRIPTION,
                    A.latitude, A.longitude,
                    A.DATE AS EVENT_DATE,
                    A.ID_PROFILE,
                    TO_CHAR(A.DATE, 'HH24:mi') AS START_TIME,
                    (SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT AND IS_APPROVED = true) AS CURRENT_PARTICIPANT
                    FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                    ${query_from}
                    JOIN CITY C ON A.CITY_BASED = C.ID
                    JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                    JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                    JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                    WHERE ${q_date} ${query_and} ${query_event_date} ${query_interest} ${query_category} ${query_city_based}
                    ${query_province_based} ${query_event_location} ${query_event_number_participant} ${query_creator} ${query_community} ${query_status} ${query_events}`)

    try {
        var query_result = await pool.query(`SELECT DISTINCT ON (ID_EVENT)
                                            A.ID_EVENT,
                                            A.NAME,
                                            CASE 
                                                WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
                                                WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT NAME FROM USERS WHERE ID_USER = A.ID_CREATOR)
                                            END AS CREATOR_NAME,
                                            A.LOCATION,
                                            C.NAME AS CITY_BASED,
                                            E.NAME AS PROVINCE_BASED,
                                            A.DURATION,
                                            A.DESCRIPTION,
                                            A.ID_PROFILE,
                                            A.latitude, A.longitude,
                                            A.DATE AS EVENT_DATE,
                                            TO_CHAR(A.DATE, 'HH24:mi') AS START_TIME,
                                            (SELECT COUNT(*) FROM EVENTS_LINK WHERE ID_EVENT = A.ID_EVENT AND IS_APPROVED = true) AS CURRENT_PARTICIPANT
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            ${query_from}
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            WHERE ${q_date} ${query_and} ${query_event_date} ${query_interest} ${query_category} ${query_city_based}
                                            ${query_province_based} ${query_event_location} ${query_event_number_participant} ${query_creator} ${query_community} ${query_status} ${query_events}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /event/getEvents/preview getEventsPreviewList - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){

                    console.log("query_result.rows[i].start_time -- " + query_result.rows[i].start_time)
                    console.log("query_result.rows[i].event_date -- " + query_result.rows[i].event_date)

                    var getEndTime = utility.getEndDate(query_result.rows[i].start_time, query_result.rows[i].duration)
                    var timestampEndDate = utility.timestampEndDate(query_result.rows[i].event_date, query_result.rows[i].duration)

                    var event_coordinate = {
                        "latitude" : query_result.rows[i].latitude,
                        "longitude" : query_result.rows[i].longitude
                    }

                    var object = {
                        "event_id" : query_result.rows[i].id_event,
                        "event_name" : query_result.rows[i].name,
                        "event_description" : query_result.rows[i].description,
                        "event_id_profile" : query_result.rows[i].id_profile,
                        "event_creator" : query_result.rows[i].creator_name,
                        "event_location" : query_result.rows[i].location,
                        "event_coordinate" : event_coordinate,
                        "event_city_based" : query_result.rows[i].city_based,
                        "event_province_based" : query_result.rows[i].province_based,
                        "event_time" : `${query_result.rows[i].start_time} - ${getEndTime} WIB`,
                        "event_start_date_timestamp" : dayjs.utc(query_result.rows[i].event_date).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ss'),
                        "event_end_date_timestamp" : timestampEndDate,
                        "current_participant_number" : query_result.rows[i].current_participant
                    }

                    result.push(object)
                }
            }
            return result
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

exports.getCreator = asyncHandler(async function getCreator(req, res, id_creator, id_community, users_username_token, page, size) {
    let isError = false, result = [], query_creator = "", query_community = ""

    if(id_creator){
        query_creator = `A.ID_CREATOR ILIKE LOWER('%${id_creator}%')`
    } else {
        if(id_community){
            query_community = `A.ID_CREATOR ILIKE LOWER((SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY ILIKE LOWER('%${id_community}%')))`
        } else {
            query_creator = `A.ID_CREATOR ILIKE LOWER((SELECT ID_USER FROM USERS WHERE USERNAME = '${users_username_token}'))`
        }
    }

    var query_pagination = respond.query_pagination(req,res, page, size)

    console.log(`WITH EVENT_CREATOR AS (
                                            SELECT DISTINCT (TO_CHAR(A.DATE, 'YYYY-MM-DD')) AS EVENT_DATE 
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            WHERE ${query_creator} ${query_community}
                                        )
                                        SELECT *, COUNT (*)OVER ()
                                        FROM EVENT_CREATOR
                                        ${query_pagination}`)

    try {
        var query_result = await pool.query(`WITH EVENT_CREATOR AS (
                                            SELECT DISTINCT (TO_CHAR(A.DATE, 'YYYY-MM-DD')) AS EVENT_DATE 
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            WHERE ${query_creator} ${query_community}
                                        )
                                        SELECT *, COUNT (*)OVER ()
                                        FROM EVENT_CREATOR
                                        ORDER BY EVENT_DATE DESC
                                        ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getCreator - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var result_list = await exports.getEventsPreviewList(req, res, query_result.rows[i].event_date, "", "", "", "",
                        "", "", "", query_creator, query_community, "", "")
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

exports.addEvent = asyncHandler(async function addEvent(req, res, event_name, event_description, event_date, event_duration, event_location, event_city, 
    event_address, event_number_participant, event_id_profile, event_category, event_interest, event_creator, event_coordinate, users_username_token) {
    let isError = false, result = [], query_event_creator = "", query_event_coordinate_1 = "", query_event_coordinate_2 ="", query_img_1 = "", query_img_2= ""

    if(event_creator){
        if(event_creator.startsWith("C")){
            query_event_creator = `(SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY ILIKE LOWER('${event_creator}'))`
        } else if(event_creator.startsWith("U")){
            query_event_creator = `(SELECT ID_USER FROM USERS WHERE ID_USER ILIKE LOWER('${event_creator}'))`
        }
    } else {
        query_event_creator = `(SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))`
    }

    if(event_city){
        query_city = `(SELECT ID FROM CITY WHERE NAME ILIKE LOWER('${event_city}'))`
    }

    if(event_date){
        if(!utility.timestampValidation(event_date)){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Tanggal Event tidak dalam format yang sesuai (example : YYYY-MM-DD HH:MI:SS)`
                }
            })
        } 
    } 

    if(event_id_profile){
        query_img_1 = `,ID_PROFILE`
        query_img_2 = `,'${event_id_profile}'`
    }

    if(event_coordinate){
        query_event_coordinate_1 = `,LATITUDE, LONGITUDE`

        latitude = event_coordinate.latitude
        longitude = event_coordinate.longitude

        query_event_coordinate_2 = `,'${latitude}','${longitude}'`
    }

    console.log(`INSERT INTO EVENTS (CREATED, ID_CATEGORY, ID_INTEREST, ID_CREATOR, NAME, DESCRIPTION, DATE, DURATION, 
                                        CITY_BASED, LOCATION, ADDRESS, NUMBER_PARTICIPANT ${query_img_1} ${query_event_coordinate_1}) VALUES 
                                        (NOW(), '${event_category}','${event_interest}',${query_event_creator},'${event_name}','${event_description}','${event_date}','${event_duration}', ${query_city},
                                        '${event_location}','${event_address}','${event_number_participant}' ${query_img_2} ${query_event_coordinate_2})
                                        RETURNING ID_EVENT`)

    try {
        var query_result = await pool.query(`INSERT INTO EVENTS (CREATED, ID_CATEGORY, ID_INTEREST, ID_CREATOR, NAME, DESCRIPTION, DATE, DURATION, 
                                CITY_BASED, LOCATION, ADDRESS, NUMBER_PARTICIPANT ${query_img_1} ${query_event_coordinate_1}) VALUES 
                                (NOW(), '${event_category}','${event_interest}',${query_event_creator},'${event_name}','${event_description}','${event_date}','${event_duration}', ${query_city},
                                '${event_location}','${event_address}','${event_number_participant}' ${query_img_2} ${query_event_coordinate_2})
                                RETURNING ID_EVENT`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/addEvent - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            result = {
                "id_event" : query_result.rows[0].id_event
            }

            let isError2 = false

            // processing add Notif -- New Event
            if(event_creator.startsWith("C")){
                try {
                    var query_result = await pool.query(`INSERT INTO NOTIFICATION (ACTION, ID_SENDER, ID_RECEIVER)
                           VALUES ('newEvent', '${query_result.rows[0].id_event}', (SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY ILIKE LOWER('${event_creator}')))`)
                } catch (error) {
                    isError2 = true
                } finally {
                    if(isError2){
                        return res.status(500).json({
                            "error_schema" : {
                                "error_code" : "nearbud-003-001",
                                "error_message" : `Error while connecting to DB`
                            }
                        })
                    } 
                }
            
            } 
            
            respond.successResp(req, res, "nearbud-000-000", "Data berhasil ditambahkan", 0, 0, 0, result, 0)
            log.info(`SUCCESS | /general/addEvent - Success added the data`)
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

exports.editEvent = asyncHandler(async function editEvent(req, res, event_id, event_name, event_description, event_date, event_duration, event_location, event_city, 
    event_address, event_number_participant, event_image, event_category, event_interest, event_coordinate, users_username_token) {

    let isError = false, result = [], query_event_name = "", query_event_description = "", query_event_date = "", query_event_duration = "", query_event_category = "", query_event_image = ""
    let query_event_location = "", query_event_city = "", query_event_address = "", query_event_number_participant = "", query_event_interest = "", query_event_coordinate = ""
    
    if(!event_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-001",
                "error_message" : `ID Event tidak dalam format yang sesuai`
            }
        })
    }

    // perlu pengecekan apakah dia itu Owner apa nggk
    let isCreator = await exports.isCreator(req, res, users_username_token, event_id)
    if(isCreator == "notCreator"){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-002-001",
                "error_message" : `Unauthorized, anda bukan Creator Event tersebut`
            }
        })
    }
    
    if(event_name){
        event_name = utility.toTitleCase(event_name)
        query_event_name = `, NAME = '${event_name}'`
    }

    if(event_description){
        query_event_description = `, DESCRIPTION = '${event_description}'`
    }

    if(event_date){
        if(!utility.timestampValidation(event_date)){
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-001-001",
                    "error_message" : `Tanggal Event tidak dalam format yang sesuai (example : YYYY-MM-DD HH:MI:SS)`
                }
            })
        } else{
            query_event_date = `, DATE = '${event_date}'`
        }
    }  

    if(event_duration){
        query_event_duration = `, DURATION = '${event_duration}'`
    }

    if(event_location){
        event_location = utility.toTitleCase(event_location)
        query_event_location = `, LOCATION = '${event_location}'`
    }

    if(event_address){
        event_address = utility.toTitleCase(event_address)
        query_event_address = `, ADDRESS = '${event_address}'`
    }

    if(event_city){
        query_event_city =`, CITY_BASED = (SELECT ID FROM CITY WHERE NAME ILIKE LOWER('${event_city}'))`
    }

    if(event_number_participant){
        query_event_number_participant = `, NUMBER_PARTICIPANT = '${event_number_participant}'`
    }

    if(event_category){
        query_event_category = `, ID_CATEGORY = (SELECT ID FROM CATEGORY WHERE ID = '${event_category}')`
    }

    if(event_interest){
        query_event_interest = `, ID_INTEREST = (SELECT ID FROM INTEREST WHERE ID = '${event_interest}')`
    }

    if(event_coordinate){
        latitude = event_coordinate.latitude
        longitude = event_coordinate.longitude

        query_event_coordinate= `,LATITUDE = '${latitude}', LONGITUDE ='${longitude}'`
    }

    if(event_image){
        query_event_image = `, ID_PROFILE = '${event_image}'`
    }
    
    console.log(`UPDATE COMMUNITY SET MODIFIED = NOW() ${query_event_category} ${query_event_interest} ${query_event_name} ${query_event_description} ${query_event_date} ${query_event_duration} ${query_event_city}
                 ${query_event_location} ${query_event_address} ${query_event_number_participant} ${query_event_category} ${query_event_interest} ${query_event_coordinate} ${query_event_image} WHERE ID_EVENT ILIKE LOWER('${event_id}')`)

    try {
        var query_result = await pool.query(`UPDATE EVENTS SET MODIFIED = NOW() ${query_event_category} ${query_event_interest} ${query_event_name} ${query_event_description} ${query_event_date} ${query_event_duration} ${query_event_city}
                                        ${query_event_location} ${query_event_address} ${query_event_number_participant} ${query_event_category} ${query_event_interest} ${query_event_coordinate} ${query_event_image} WHERE ID_EVENT ILIKE LOWER('${event_id}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/editEvent - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            respond.successResp(req, res, "nearbud-000-000", "Data berhasil diperbaharui", 0, 0, 0, result, 0)
            log.info(`SUCCESS | /general/editEvent - Success updated the data`)
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

exports.isCreator = asyncHandler(async function isCreator(res, res, id_creator, id_temp) {
    let isError = false, query = ""

    if(id_temp.startsWith("E")){
        if(id_creator.startsWith('U0')){
            query = (`SELECT * FROM EVENTS WHERE ID_CREATOR ILIKE LOWER('${id_creator}') AND ID_EVENT ILIKE LOWER('${id_temp}')`)
        } else {
            query = (`SELECT * FROM EVENTS WHERE ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${id_creator}')) AND ID_EVENT ILIKE LOWER('${id_temp}')`)
        }
    } else if (id_temp.startsWith("C")){
        if(id_creator.startsWith('U0')||id_creator.startsWith('u0')){
            query = (`SELECT * FROM IS_ADMIN WHERE ID_USER ILIKE LOWER('${id_creator}') AND ID_COMMUNITY ILIKE LOWER('${id_temp}')`)
        } else {
            query = (`SELECT * FROM IS_ADMIN WHERE ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${id_creator}')) AND ID_COMMUNITY ILIKE LOWER('${id_temp}')`)
        }
    }

    console.log(query)

    try {
        var query_result = await pool.query(query)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/isCretor - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            console.log(query_result)
            if(query_result.rowCount > 0){
                return "isCreator"
            } else {
                return "notCreator"
            }
        } 
    }
})

exports.getEventDetail = asyncHandler(async function getEventDetail(req, res, event_name, event_id, status, users_username_token, page, size) {
    let isError = false, result = [], query_event_name = "", query_event_id = ""

    var query_pagination = respond.query_pagination(req,res, 1, 1)

    if(!event_name && !event_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-000",
                "error_message" : `Event Name dan Event ID tidak boleh kosong`
            }
        })
    }
    
    if(event_name){
        query_event_name = `WHERE A.EVENT_NAME ILIKE LOWER('${event_name}')`

        if(event_id){
            query_event_id = `AND A.ID_EVENT ILIKE LOWER('${event_id}')`
        }
    } else {
        query_event_id = `WHERE A.ID_EVENT ILIKE LOWER('${event_id}')`
    }

    console.log(`SELECT 
        A.ID_EVENT,
        A.NAME AS EVENT_NAME, 
        A.DESCRIPTION AS EVENT_DESCRIPTION,
        D.NAME AS CATEGORY,
        A.DURATION,
        A.DATE AS EVENT_DATE, 
        C.NAME AS CITY_BASED,
        E.NAME AS PROVINCE_BASED,
        A.LOCATION,
        A.ADDRESS,
        A.ID_PROFILE,
        A.NUMBER_PARTICIPANT,
        CASE 
            WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
            WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT NAME FROM USERS WHERE ID_USER = A.ID_CREATOR)
        END AS CREATOR_NAME,
        CASE 
            WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT ID_COMMUNITY  FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
            WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT ID_USER FROM USERS WHERE ID_USER = A.ID_CREATOR)
        END AS CREATOR_ID,
        CASE 
            WHEN (SELECT ID_EVENT FROM EVENTS WHERE ID_EVENT ILIKE LOWER('${event_id}') AND ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) IS NOT NULL THEN 'isCreator'
            WHEN (SELECT IS_APPROVED FROM EVENTS_LINK WHERE ID_EVENT ILIKE LOWER('${event_id}') AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) = 'true' THEN 'Accepted'
            WHEN (SELECT IS_APPROVED FROM EVENTS_LINK WHERE ID_EVENT ILIKE LOWER('${event_id}') AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) = 'false' THEN 'Pending'
            ELSE 'Nothing'
        END AS CONDITION,
        A.latitude, A.longitude
        FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
        JOIN CITY C ON A.CITY_BASED = C.ID
        JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
        JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
        ${query_event_name} ${query_event_id} 
        ORDER BY A.ID_EVENT ${query_pagination}`)

    try {
        var query_result = await pool.query(`SELECT 
                                            A.ID_EVENT,
                                            A.NAME AS EVENT_NAME, 
                                            A.DESCRIPTION AS EVENT_DESCRIPTION,
                                            D.NAME AS CATEGORY,
                                            F.NAME AS INTEREST,
                                            A.DURATION,
                                            A.DATE AS EVENT_DATE, 
                                            C.NAME AS CITY_BASED,
                                            E.NAME AS PROVINCE_BASED,
                                            A.LOCATION,
                                            A.ID_PROFILE,
                                            A.ADDRESS,
                                            A.NUMBER_PARTICIPANT,
                                            CASE 
                                                WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT ID_COMMUNITY  FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
                                                WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT ID_USER FROM USERS WHERE ID_USER = A.ID_CREATOR)
                                            END AS CREATOR_ID,
                                            CASE 
                                                WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
                                                WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT NAME FROM USERS WHERE ID_USER = A.ID_CREATOR)
                                            END AS CREATOR_NAME,
                                            CASE 
                                                WHEN A.ID_CREATOR LIKE 'C%' THEN 'Community'
                                                WHEN A.ID_CREATOR LIKE 'U%' THEN 'User'
                                            END AS CREATOR_TYPE,
                                            CASE 
                                                WHEN (SELECT ID_EVENT FROM EVENTS WHERE ID_EVENT ILIKE LOWER('${event_id}') AND ID_CREATOR = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) IS NOT NULL THEN 'isCreator'
                                                WHEN (SELECT IS_APPROVED FROM EVENTS_LINK WHERE ID_EVENT ILIKE LOWER('${event_id}') AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) = 'true' THEN 'Accepted'
                                                WHEN (SELECT IS_APPROVED FROM EVENTS_LINK WHERE ID_EVENT ILIKE LOWER('${event_id}') AND ID_USER = (SELECT ID_USER FROM USERS WHERE USERNAME ILIKE LOWER('${users_username_token}'))) = 'false' THEN 'Pending'
                                                ELSE 'Nothing'
                                            END AS CONDITION,
                                            A.latitude, A.longitude
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            JOIN INTEREST F ON B.ID = F.ID_CATEGORY
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            ${query_event_name} ${query_event_id} 
                                            ORDER BY A.ID_EVENT ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getEventDetail - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            console.log(query_result.rows)
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var fullDisplayDate = utility.fullDisplayDateTime(query_result.rows[i].event_date)
                    var displayEndDateTime = utility.displayEndDateTime(query_result.rows[i].event_date, query_result.rows[i].duration)
                    var timestampEndDate = utility.timestampEndDate(query_result.rows[i].event_date, query_result.rows[i].duration)
                    var participantList = await membership.getParticipants(req, res, query_result.rows[i].id_event, "")

                    var event_coordinate = {
                        "latitude" : query_result.rows[i].latitude,
                        "longitude" : query_result.rows[i].longitude
                    }

                    var creator = [{
                            "event_creator_type" : query_result.rows[i].creator_type,
                            "event_creator_id" : query_result.rows[i].creator_id,
                            "event_creator_name" : query_result.rows[i].creator_name,
                    }]

                    var object = {
                        "event_id" : query_result.rows[i].id_event,
                        "event_name" : query_result.rows[i].event_name,
                        "event_description" : query_result.rows[i].event_description,
                        "event_id_profile" : query_result.rows[i].id_profile,
                        "event_category" : query_result.rows[i].category,
                        "event_interest" : query_result.rows[i].interest,
                        "event_start_date" : fullDisplayDate,
                        "event_end_date" : displayEndDateTime,
                        "event_start_date_timestamp" : dayjs.utc(query_result.rows[i].event_date).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ss'),
                        "event_end_date_timestamp" : timestampEndDate,
                        "event_duration" : query_result.rows[i].duration,
                        "event_city_based" : query_result.rows[i].city_based,
                        "event_province_based" : query_result.rows[i].province_based,
                        "event_location" : query_result.rows[i].location,
                        "event_address" : query_result.rows[i].address,
                        "event_coordinate" : event_coordinate,
                        "event_creator" : creator,
                        "event_number_participant" : query_result.rows[i].number_participant,
                        "event_participant" : participantList,
                        "user_status" : query_result.rows[i].condition
                    }
                    result.push(object)
                }

                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_query_data, total_query_data, page, result, size)
            } else {
                respond.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result, size)
            }
            log.info(`SUCCESS | /general/getEventDetail - Success return the result`)
            
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