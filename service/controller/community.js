const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const config = require("../config/general")
const utility = require("./utility")

exports.getCommunity = asyncHandler(async function getCommunity(req, res, community_id, community_name, interest, category, interest_id1, interest_id2, interest_id3) {
    
    try {
        var query_result = await pool.query(`SELECT A.ID AS PROVINCE_ID, A.NAME AS PROVINCE_NAME, B.ID AS CITY_ID, B.NAME AS CITY_NAME, COUNT (*) OVER () FROM PROVINCE A JOIN CITY B ON A.ID = B.ID_PROVINCE ${query_where} ${query_province_id} ${query_province_name} ${query_city_id} ${query_city_name} ORDER BY A.ID ${query_pagination}`)
    } catch (error) {
        isError = true
        log.error(`ERROR | /general/getProvince [username : "${username}" | email : "${email}"] - Error found while connect to DB - ${error}`)
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

                exports.successResp(req, res, "nearbud-000-000", "Berhasil mendapatkan hasil", total_data, total_query_data, page, result)
            } else {
                exports.successResp(req, res, "nearbud-001-001", "Data tidak ditemukan", 0, 0, 0, result)
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