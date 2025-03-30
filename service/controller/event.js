const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const utility = require("./utility")
const respond = require('./respond')

exports.getEventsPreview = asyncHandler(async function getEventsPreview(req, res, interest_id1, interest_id2, interest_id3, interest_id4, interest_id5,category_id1, category_id2, category_id3, category_id4, category_id5, city_based, province_based, event_location, event_date, event_number_participant, size, page) {
    var query_interest = "", query_category = "", query_city_based = "", query_province_based = "", query_event_location = "", query_event_number_participant = "", query_where = "", query_event_date = "", isError = false, result = []
    
    if( interest_id1 || interest_id2 || interest_id3 || interest_id4 || interest_id5 || category_id1 || category_id2 || category_id3 || category_id4 || category_id5 || city_based || province_based || event_location || event_date || event_number_participant ) query_where = 'WHERE '

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

        if(event_date){
            if(event_date == "today"){
                var temp_eventDate = Date.now()
                event_date = utility.convertdbDate()
            }

            var tempDate = utility.convertdbDate(event_date)
            query_event_date = `AND A.DATE::DATE = '${tempDate}'`
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
        
            if(event_date){
                if(event_date == "today"){
                    var temp_eventDate = Date.now()
                    event_date = utility.convertdbDate()
                }

                var tempDate = utility.convertdbDate(event_date)
                query_event_date = `AND A.DATE::DATE = '${tempDate}'`
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
            if(city_based){
                query_city_based = `C.NAME ILIKE LOWER('%${city_based}%')`

                if(province_based){
                    query_province_based = `AND E.NAME ILIKE LOWER('%${province_based}%')`
                }

                if(event_date){
                    if(event_date == "today"){
                        var temp_eventDate = Date.now()
                        event_date = utility.convertdbDate()
                    }

                    var tempDate = utility.convertdbDate(event_date)
                    query_event_date = `AND A.DATE::DATE = '${tempDate}'`
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

                    if(event_date){
                        if(event_date == "today"){
                            var temp_eventDate = Date.now()
                            event_date = utility.convertdbDate()
                        }
                        
                        var tempDate = utility.convertdbDate(event_date)
                        query_event_date = `AND A.DATE::DATE = '${tempDate}'`
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
                            
                            if(event_date){
                                if(event_date == "today"){
                                    var temp_eventDate = Date.now()
                                    event_date = utility.convertdbDate()
                                }

                                var tempDate = utility.convertdbDate(event_date)
                                query_event_date = `AND A.DATE::DATE = '${tempDate}'`
                            }
                        } else {
                            if(event_date){
                                if(event_date == "today"){
                                    var temp_eventDate = Date.now()
                                    event_date = utility.convertdbDate()
                                }

                                var tempDate = utility.convertdbDate(event_date)
                                query_event_date = `A.DATE::DATE = '${tempDate}'`
                            }
                        }
                    }
                }
            }
        }
    }

    var query_pagination = respond.query_pagination(req,res, page, size)

    console.log(`WITH EVENT_DATE_LIST AS (
        SELECT DISTINCT TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE 
        FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
        JOIN CITY C ON A.CITY_BASED = C.ID
        JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
        JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
        JOIN INTEREST F ON F.ID_CATEGORY = D.ID
        ${query_where} ${query_interest} ${query_category} ${query_city_based} ${query_event_date}
        ${query_province_based} ${query_event_location} ${query_event_number_participant}
    )
    SELECT *, COUNT (*)OVER ()
    FROM EVENT_DATE_LIST
    ${query_pagination}`)

    try {
        var query_result = await pool.query(`WITH EVENT_DATE_LIST AS (
                                            SELECT DISTINCT TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE 
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            ${query_where} ${query_interest} ${query_category} ${query_city_based} ${query_event_date}
                                            ${query_province_based} ${query_event_location} ${query_event_number_participant}
                                        )
                                        SELECT *, COUNT (*)OVER ()
                                        FROM EVENT_DATE_LIST
                                        ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var result_list = await exports.getEventsPreviewList(req, res, query_result.rows[i].event_date, query_interest, query_category, query_city_based, query_event_date,
                        query_province_based, query_event_location, query_event_number_participant, "", "")
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

exports.getEventsPreviewList = asyncHandler(async function getEventsPreviewList(req, res, event_date, query_interest, query_category, query_city_based, query_event_date,
    query_province_based, query_event_location, query_event_number_participant, query_creator, query_community) {
    let result = [], isError = false, query_and = ""

    if(query_interest || query_category || query_city_based || query_event_date || query_event_location || query_event_number_participant || query_community || query_creator) query_and = `AND`

    if(event_date){
        query_event_date = `A.date::date = '${event_date}'`
    }

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
                                            TO_CHAR(A.DATE, 'HH24:mi') AS START_TIME
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            WHERE ${query_event_date} ${query_and} ${query_interest} ${query_category} ${query_city_based}
                                            ${query_province_based} ${query_event_location} ${query_event_number_participant} ${query_creator} ${query_community}`)

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
                                            TO_CHAR(A.DATE, 'HH24:mi') AS START_TIME
                                            FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
                                            JOIN CITY C ON A.CITY_BASED = C.ID
                                            JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
                                            JOIN CATEGORY D ON A.ID_CATEGORY = D.ID 
                                            JOIN INTEREST F ON F.ID_CATEGORY = D.ID
                                            WHERE ${query_event_date} ${query_and} ${query_interest} ${query_category} ${query_city_based}
                                            ${query_province_based} ${query_event_location} ${query_event_number_participant} ${query_creator} ${query_community}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /event/getEvents/preview getEventsPreviewList - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    
                    var getEndTime = utility.getEndDate(query_result.rows[i].start_time, query_result.rows[i].duration)

                    var object = {
                        "event_id" : query_result.rows[i].id_event,
                        "event_name" : query_result.rows[i].name,
                        "event_creator" : query_result.rows[i].creator_name,
                        "event_location" : query_result.rows[i].location,
                        "event_city_based" : query_result.rows[i].city_based,
                        "event_province_based" : query_result.rows[i].province_based,
                        "event_time" : `${query_result.rows[i].start_time} - ${getEndTime} WIB`
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
    let isError = false, result = [],query_where = "", query_creator = "", query_community = ""

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
                                            SELECT DISTINCT (ID_EVENT), TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE 
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
                                            SELECT DISTINCT (ID_EVENT), TO_CHAR(A.DATE, 'YYYY-MM-DD') AS EVENT_DATE 
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
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getCreator - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                for( let i = 0; i < query_result.rowCount; i++){
                    var result_list = await exports.getEventsPreviewList(req, res, query_result.rows[i].event_date, "", "", "", "",
                        "", "", "", query_creator, query_community)
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

exports.addEvent = asyncHandler(async function addEvent(req, res, event_name, event_description, event_date, event_duration,
    event_location, event_city, event_address, event_number_participant, event_image, event_category, event_interest, event_creator, users_username_token) {
    let isError = false, result = [], query_event_creator = ""

    if(event_creator){
        query_event_creator = `(SELECT ID_COMMUNITY FROM COMMUNITY WHERE ID_COMMUNITY ILIKE LOWER('${event_creator}'))`
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

    console.log(`INSERT INTO EVENTS (ID_CATEGORY, ID_INTEREST, ID_CREATOR, NAME, DESCRIPTION, DATE, DURATION, 
                                        CITY_BASED, LOCATION, ADDRESS, NUMBER_PARTICIPANT) VALUES 
                                        ('${event_category}','${event_interest}',${query_event_creator},'${event_name}','${event_description}','${event_date}','${event_duration}', ${query_city},
                                        '${event_location}','${event_address}','${event_number_participant}')`)

    try {
        var query_result = await pool.query(`INSERT INTO EVENTS (ID_CATEGORY, ID_INTEREST, ID_CREATOR, NAME, DESCRIPTION, DATE, DURATION, 
                                        CITY_BASED, LOCATION, ADDRESS, NUMBER_PARTICIPANT) VALUES 
                                        ('${event_category}','${event_interest}',${query_event_creator},'${event_name}','${event_description}','${event_date}','${event_duration}', ${query_city},
                                        '${event_location}','${event_address}','${event_number_participant}')`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/addEvent - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
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
    event_address, event_number_participant, event_image, event_category, event_interest, users_username_token) {

    // perlu pengecekan apakah dia itu Owner apa nggk

    let isError = false, result = [], query_event_name = "", query_event_description = "", query_event_date = "", query_event_duration = "", query_event_category = ""
    let query_event_location = "", query_event_city = "", query_event_address = "", query_event_number_participant = "", query_event_interest = ""
    
    if(!event_id){
        return res.status(500).json({
            "error_schema" : {
                "error_code" : "nearbud-001-001",
                "error_message" : `ID Event tidak dalam format yang sesuai`
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

    // if(event_image){
    //     query_event_image = `, `
    // }
    
    console.log(`UPDATE EVENTS SET MODIFIED = NOW() ${query_event_category} ${query_event_interest} ${query_event_name} ${query_event_description} ${query_event_date} ${query_event_duration} ${query_event_city}
                                        ${query_event_location} ${query_event_address} ${query_event_number_participant} ${query_event_category} ${query_event_interest} WHERE ID_EVENT ILIKE LOWER('${event_id}')`)

    try {
        var query_result = await pool.query(`UPDATE EVENTS SET MODIFIED = NOW() ${query_event_category} ${query_event_interest} ${query_event_name} ${query_event_description} ${query_event_date} ${query_event_duration} ${query_event_city}
                                        ${query_event_location} ${query_event_address} ${query_event_number_participant} ${query_event_category} ${query_event_interest} WHERE ID_EVENT ILIKE LOWER('${event_id}')`)
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