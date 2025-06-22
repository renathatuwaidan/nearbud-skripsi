const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")

exports.deleteUnverifUser = asyncHandler(async function deleteUnverifUser() {
    let isError = false

    try {
        var query_result = await pool.query(`DELETE FROM USERS WHERE IS_VERIFIED = FALSE AND NOW() - OTP_CREATED >= INTERVAL '24 hours'`) 
    } catch (error) {
        isError = true
        log.error(`ERROR | getRatingTask - Error found while connect to DB - ${error}`)
    } finally {
        log.info(`SUCCESS | getRatingTask - Cycle Done`)
    }
})

exports.unsuspendingUser = asyncHandler(async function unsuspendinguser() {
    let isError = false

    try {
        var query_result = await pool.query(`DELETE FROM suspended where created::DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE - INTERVAL '7 days'`) 
    } catch (error) {
        isError = true
        log.error(`ERROR | unsuspendingUser - Error found while connect to DB - ${error}`)
    } finally {
        log.info(`SUCCESS | unsuspendingUser - Cycle Done`)
    }
})

exports.suspendingUser = asyncHandler(async function suspendingUser() {
    let isError = false

    try {
        var query_result = await pool.query(`WITH deleted AS (
                                            DELETE FROM report_link
                                            WHERE id_reportee IN (
                                                SELECT id_reportee
                                                FROM report_link
                                                GROUP BY id_reportee
                                                HAVING COUNT(*) >= 3
                                            )
                                            RETURNING id_reportee
                                            )
                                            SELECT DISTINCT id_reportee FROM deleted`) 
    } catch (error) {
        isError = true
        log.error(`ERROR | suspendingUser - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0 ){
                let temp = []
                for( let i = 0; i < query_result.rowCount; i++){
                    try {
                        var query_result = await pool.query(`INSERT INTO SUSPENDED (ID, CREATED, ID_REPORTEE) VALUES ((SELECT MAX(ID)+1 FROM SUSPENDED), NOW(), '${query_result.rows[i].id_reportee}')`) 
                    } catch (error) {
                        log.error(`ERROR | suspendingUser - Error found while connect to DB - ${error}`)
                    }
                }
            }
        } 
        log.info(`SUCCESS | suspendingUser - Cycle Done`)
    }
})