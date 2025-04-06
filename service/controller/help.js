// exports.getUserID = asyncHandler(async function getUserID(req, res, username, email) {
//     let isError = false
//     var url_getUserID = config.api_endpoint.getUser + `?users_username=${username}&users_email=${email}`

//     try {
//         api = await axios.request({
//             method : "GET",
//             url : url_getUserID
//             //headers
//         })
//     } catch (error) {
//         isError = true
//         log.error(`ERROR | /auth/registerUser (getUserID) [username : "${users_username}" | email : "${users_email}"] - Error found while HIT API getUser - ${error}`)
//     } finally {
//         if(!isError){
//             console.log(api.data.output_schema.result)
//             console.log(api.data.output_schema.result[0].users_username)

//             if(api.data.output_schema.result[0]){
//                 result = {
//                     "users"
//                     "users_name" : "",
//                     "users_email" : "dummy2@domain.co",
//                     "users_username" : "dummytes2",
//                     "users_password" : "123",
//                     "agree_tnc" : "Y",
//                     "users_dob" : "2025-10-05",
//                     "users_gender" : "F",
//                     "province_name" : "BANTEN",
//                     "city_name" : "TANGERANG SELATAN",
//                     "users_description" : "DUMMY TEST 123"
//                 }
//             }
//         } else {
//             return res.status(500).json({
//                 "error_schema" : {
//                     "error_code" : "nearbud-003-002",
//                     "error_message" : `Error while HIT API getUser`
//                 }
//             })
//         }
//     }
// })

// exports.getEvents = asyncHandler(async function getEvents(req, res, category, event_creator, event_name, event_date, city, event_location, event_number_participant, page, size) {
//     var result = [], isError = false, query_where = "", query_category = "", query_event_creator = ""
//     var query_event_name = "", query_event_date = "", query_city = "", query_event_location = "", query_event_number_participant = ""

//     var query_pagination = await exports.query_pagination(req,res, page, size)
    
//     if(category ||event_creator || event_name || event_date || city || event_location || event_number_participant) query_where = "WHERE"

//     if(category){
//         query_category = `D.NAME ILIKE LOWER('%${category}%')`

//         if(event_creator){
//             query_event_creator = `AND A.ID_CREATOR ILIKE LOWER('%${event_creator}%')`
//         }

//         if(event_name){
//             query_event_name = `AND A.NAME ILIKE LOWER('%${event_name}%')`
//         }

//         if(event_date){
//             if(event_date.toLowerCase() == "today"){
//                 const today = new Date().toISOString().split('T')[0]
//                 query_event_date = `AND DATE(A.DATE) = '${today}'`
//             } else {
//                 query_event_date = `AND DATE(A.DATE) = '${event_date}'`
//             }
//         }

//         if(city){
//             query_city = `AND C.NAME ILIKE LOWER('%${city}%')`
//         }

//         if(event_location){
//             query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
//         }

//         if(event_number_participant){
//             query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
//         }

//     } else {
//         if(event_creator){
//             query_event_creator = `A.ID_CREATOR ILIKE LOWER('%${event_creator}%')`

//             if(event_name){
//                 query_event_name = `AND A.NAME ILIKE LOWER('%${event_name}%')`
//             }
    
//             if(event_date){
//                 if(event_date.toLowerCase() == "today"){
//                     const today = new Date().toISOString().split('T')[0]
//                     query_event_date = `AND DATE(A.DATE) = '${today}'`
//                 } else {
//                     query_event_date = `AND DATE(A.DATE) = '${event_date}'`
//                 }
//             }
    
//             if(city){
//                 query_city = `AND C.NAME ILIKE LOWER('%${city}%')`
//             }
    
//             if(event_location){
//                 query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
//             }
    
//             if(event_number_participant){
//                 query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
//             }
//         } else {
//             if(event_name){
//                 query_event_name = `A.NAME ILIKE LOWER('%${event_name}%')`
                
//                 if(event_date){
//                     if(event_date.toLowerCase() == "today"){
//                         const today = new Date().toISOString().split('T')[0]
//                         query_event_date = `AND DATE(A.DATE) = '${today}'`
//                     } else {
//                         query_event_date = `AND DATE(A.DATE) = '${event_date}'`
//                     }
//                 }
        
//                 if(city){
//                     query_city = `AND C.NAME ILIKE LOWER('%${city}%')`
//                 }
        
//                 if(event_location){
//                     query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
//                 }
        
//                 if(event_number_participant){
//                     query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
//                 }
//             } else {
//                 if(event_date){
//                     if(event_date.toLowerCase() == "today"){
//                         const today = new Date().toISOString().split('T')[0]
//                         query_event_date = `DATE(A.DATE) = '${today}'`
//                     } else {
//                         query_event_date = `A.DATE(A.DATE) = '${event_date}'`
//                     }
                    
//                     if(city){
//                         query_city = `AND C.NAME ILIKE LOWER('%${city}%')`
//                     }
            
//                     if(event_location){
//                         query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
//                     }
            
//                     if(event_number_participant){
//                         query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
//                     }
//                 } else {
//                     if(city){
//                         query_city = `C.NAME ILIKE LOWER('%${city}%')`
                        
//                         if(event_location){
//                             query_event_location = `AND A.LOCATION ILIKE LOWER('%${event_location}%')`
//                         }
                
//                         if(event_number_participant){
//                             query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
//                         }
//                     } else {
//                         if(event_location){
//                             query_event_location = `A.LOCATION ILIKE LOWER('%${event_location}%')`
                            
//                             if(event_number_participant){
//                                 query_event_number_participant = `AND A.NUMBER_PARTICIPANT = ${event_number_participant}`
//                             }
//                         } else {
//                             if(event_number_participant){
//                                 query_event_number_participant = `A.NUMBER_PARTICIPANT = ${event_number_participant}`
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     try {
//         var query_result = await pool.query(`SELECT 
//                                             A.ID_EVENT,
//                                             A.NAME AS EVENT_NAME, 
//                                             A.DESCRIPTION AS EVENT_DESCRIPTION,
//                                             D.NAME AS CATEGORY,
//                                             A.DURATION,
//                                             A.DATE AS EVENT_DATE, 
//                                             C.NAME AS CITY_BASED,
//                                             E.NAME AS PROVINCE_BASED,
//                                             A.LOCATION,
//                                             A.ADDRESS,
//                                             A.NUMBER_PARTICIPANT,
//                                             CASE 
//                                                 WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT NAME FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
//                                                 WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT NAME FROM USERS WHERE ID_USER = A.ID_CREATOR)
//                                             END AS CREATOR_NAME,
//                                             CASE 
//                                                 WHEN A.ID_CREATOR LIKE 'C%' THEN (SELECT ID_COMMUNITY  FROM COMMUNITY WHERE ID_COMMUNITY = A.ID_CREATOR)
//                                                 WHEN A.ID_CREATOR LIKE 'U%' THEN (SELECT ID_USER FROM USERS WHERE ID_USER = A.ID_CREATOR)
//                                             END AS CREATOR_ID
//                                             FROM EVENTS A JOIN CATEGORY B ON A.ID_CATEGORY = B.ID
//                                             JOIN CITY C ON A.CITY_BASED = C.ID
//                                             JOIN PROVINCE E ON C.ID_PROVINCE = E.ID
//                                             JOIN CATEGORY D ON A.ID_CATEGORY = D.ID ${query_where} ${query_category} ${query_event_creator}
//                                             ${query_event_name} ${query_event_date} ${query_city} ${query_event_location} ${query_event_number_participant}
//                                             ORDER BY A.ID_EVENT ${query_pagination}`)
//     } catch (error) {
//         isError = true
//         log.error(`ERROR | /general/getProvince - Error found while connect to DB - ${error}`)
//     } finally {
//         if(!isError){
//             console.log(query_result.rows)
//             if(query_result.rowCount > 0 ){
//                 for( let i = 0; i < query_result.rowCount; i++){
//                     var object = {
//                         "event_id" : query_result.rows[i].id_event,
//                         "event_name" : query_result.rows[i].event_name,
//                         "event_description" : query_result.rows[i].event_description,
//                         "event_category" : query_result.rows[i].category,
//                         "event_date" : query_result.rows[i].event_date,
//                         "event_duration" : query_result.rows[i].duration,
//                         "event_city_based" : query_result.rows[i].city_based,
//                         "event_province_based" : query_result.rows[i].province_based,
//                         "event_location" : query_result.rows[i].location,
//                         "event_address" : query_result.rows[i].address,
//                         "event_creator_id" : query_result.rows[i].creator_id,
//                         "event_creator_name" : query_result.rows[i].creator_name,
//                         "event_number_participant" : query_result.rows[i].number_participant,
//                         // "event_participant" -- on pending waiting API GET membership
//                     }
//                     result.push(object)
//                 }

//                 var total_query_data = query_result.rowCount

//                 exports.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_query_data, total_query_data, page, result, size)
//             } else {
//                 exports.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result, size)
//             }
//             log.info(`SUCCESS | /general/getProvince - Success return the result`)
            
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