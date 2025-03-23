const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const utility = require("./utility")
const respond = require('./respond')

exports.getEventsPreview = asyncHandler(async function getEventsPreview(req, res, interest_id1, interest_id2, interest_id3, interest_id4, interest_id5,category_id1, category_id2, category_id3, category_id4, category_id5, city_based, province_based, event_location, event_number_participant, size, page) {
    var query_interest = "", query_category = "", query_city_based = "", query_province_based = "", query_event_location = "", query_event_number_participant = "", query_where = "", isError = false, result = []
    
    if(interest_id1 || interest_id2 || interest_id3 || interest_id4 || interest_id5){
        if(interest_id1){interest_id1 = `'${interest_id1}'`} else interest_id1 = ''
        if(interest_id2){interest_id2 = `,'${interest_id2}'`} else interest_id2 = ''
        if(interest_id3){interest_id3 = `,'${interest_id3}'`} else interest_id3 = ''
        if(interest_id4){interest_id4 = `,'${interest_id4}'`} else interest_id4 = ''
        if(interest_id5){interest_id5 = `,'${interest_id5}'`} else interest_id5 = ''

        query_interest = `A.ID_INTEREST IN (SELECT ID FROM interest WHERE NAME IN (${interest_id1} ${interest_id2} ${interest_id3} ${interest_id4} ${interest_id5}))`
    
        if(category_id1 || category_id2 || category_id3 || category_id4 || category_id5){
            if(category_id1){category_id1 = `'${category_id1}'`} else category_id1 = ''
            if(category_id2){category_id2 = `,'${category_id2}'`} else category_id2 = ''
            if(category_id3){category_id3 = `,'${category_id3}'`} else category_id3 = ''
            if(category_id4){category_id4 = `,'${category_id4}'`} else category_id4 = ''
            if(category_id5){category_id5 = `,'${category_id5}'`} else category_id5 = ''
    
            query_category = `AND A.ID_CATEGORY IN (SELECT ID FROM CATEGORY WHERE NAME IN (${category_id1} ${category_id2} ${category_id3} ${category_id4} ${category_id5}))`
        }
    
        if(city_based){
            query_city_based = `AND C.NAME ILIKE LOWER('%${city_based}%')`
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

    } else {
        if(category_id1 || category_id2 || category_id3 || category_id4 || category_id5){
            if(category_id1){category_id1 = `'${category_id1}'`} else category_id1 = ''
            if(category_id2){category_id2 = `,'${category_id2}'`} else category_id2 = ''
            if(category_id3){category_id3 = `,'${category_id3}'`} else category_id3 = ''
            if(category_id4){category_id4 = `,'${category_id4}'`} else category_id4 = ''
            if(category_id5){category_id5 = `,'${category_id5}'`} else category_id5 = ''
    
            query_category = `A.ID_CATEGORY IN (SELECT ID FROM CATEGORY WHERE NAME IN (${category_id1} ${category_id2} ${category_id3} ${category_id4} ${category_id5}))`
        
            if(city_based){
                query_city_based = `AND C.NAME ILIKE LOWER('%${city_based}%')`
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
        
        } else {
            if(city_based){
                query_city_based = `C.NAME ILIKE LOWER('%${city_based}%')`

                if(province_based){
                    query_province_based = `AND E.NAME ILIKE LOWER('%${province_based}%')`
                }
            
                if(event_location){
                    query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
                }
            
                if(event_number_participant){
                    query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
                }
            } else {
                if(province_based){
                    query_province_based = `E.NAME ILIKE LOWER('%${province_based}%')`

                    if(event_location){
                        query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
                    }
                
                    if(event_number_participant){
                        query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
                    }
                } else {
                    if(event_location){
                        query_event_location = `A.LOCATION ILIKE LOWER('%${event_location}%')`

                        if(event_number_participant){
                            query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
                        }
                    } else {
                        if(event_number_participant){
                            query_event_number_participant = `A.NUMBER_PARTICIPANT = ${event_number_participant}`
                        }
                    }
                }
            }
        }
    
    }

    var query_pagination = respond.query_pagination(req,res, page, size)

    try {
        var query_result = await pool.query(`SELECT DISTINCT TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            ${query_where} ${query_interest} ${query_category} ${query_city_based}
                                            ${query_province_based} ${query_event_location} ${query_event_number_participant}
                                            ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            console.log(query_result.rows)
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var result_list = await exports.getEventsPreviewList(req, res, query_result.rows[i].event_date)
                    var fullDisplayDate = utility.fullDisplayDate(query_result.rows[i].event_date)

                    var object = {
                        "event_date" : fullDisplayDate,
                        "event_list" : result_list
                    }
                    result.push(object)
                }

                var total_query_data = query_result.rowCount

                respond.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_query_data, total_query_data, page, result, size)
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

exports.getEventsPreviewList = asyncHandler(async function getEventsPreviewList(req, res, event_date) {
    let result = [], isError = false

    try {
        var query_result = await pool.query(`SELECT 
                                            A.NAME,
                                            CASE 
                                                WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
                                                WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT NAME FROM USERS WHERE ID_USER = A.ID_CREATOR)
                                            END AS CREATOR_NAME,
                                            A.LOCATION,
                                            C.NAME AS CITY_BASED,
                                            E.NAME AS PROVINCE_BASED,
                                            A.DURATION,
                                            TO_CHAR(A.DATE, 'HH24:mi') AS START_TIME
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            WHERE A.date::date = '${event_date}'`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /event/getEvents/preview getEventsPreviewList - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    
                    var getEndTime = utility.getEndDate(query_result.rows[i].start_time, query_result.rows[i].duration)

                    var object = {
                        "event_name" : query_result.rows[i].name,
                        "event_creator" : query_result.rows[i].creator_name,
                        "event_location" : query_result.rows[i].location,
                        "event_city_based" : query_result.rows[i].city_based,
                        "event_province_based" : query_result.rows[i].province_based,
                        "event_time" : `${query_result.rows[i].start_time} - ${getEndTime}`
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