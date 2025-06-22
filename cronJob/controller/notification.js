const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")

exports.cleanRejectAcc = asyncHandler(async function cleanRejectAcc() {
    let isError = false

    console.log(`DELETE FROM notification
                WHERE ctid IN (
                    SELECT ctid
                    FROM notification A
                    WHERE (ACTION ILIKE 'accepted%' OR ACTION ILIKE 'rejected%')
                        AND (A.created AT TIME ZONE 'Asia/Jakarta')::DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE - INTERVAL '7 days'
                        AND (A.created AT TIME ZONE 'Asia/Jakarta')::DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                )`) //remover pls

    try {
        var query_result = await pool.query(`DELETE FROM notification
                                            WHERE ctid IN (
                                                SELECT ctid
                                                FROM notification A
                                                WHERE (ACTION ILIKE 'accepted%' OR ACTION ILIKE 'rejected%')
                                                    AND (A.created AT TIME ZONE 'Asia/Jakarta')::DATE >= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE - INTERVAL '7 days'
                                                    AND (A.created AT TIME ZONE 'Asia/Jakarta')::DATE <= (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                                            )`) //REMOVE PLS
    } catch (error) {
        isError = true
        log.error(`ERROR | cleanRejectAcc - Error found while connect to DB - ${error}`)
    } finally {
        log.info(`SUCCESS | cleanRejectAcc - Cycle Done`)
    }
})

exports.cleanNewEvent = asyncHandler(async function cleanNewEvent() {
    let isError = false

    try {
        var query_result = await pool.query(`DELETE FROM notification
                                            WHERE ctid IN (
                                                SELECT ctid, *
                                                FROM notification A
                                                WHERE ACTION ILIKE 'new%'
                                                AND (SELECT DATE FROM EVENTS WHERE STRING1 = EVENTS.ID_EVENT)::DATE < (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE
                                                LIMIT 1
                                            )`) //REMOVE PLS
    } catch (error) {
        isError = true
        log.error(`ERROR | cleanNewEvent - Error found while connect to DB - ${error}`)
    } finally {
        log.info(`SUCCESS | cleanNewEvent - Cycle Done`)
    }
})

// remove dari eventLink dan notification
exports.removePastEvent = asyncHandler(async function removePastEvent() {
    let isError = false

    try {
        //remove dari event_link yang isApproved False
        var query_result = await pool.query(`DELETE FROM EVENTS_LINK WHERE ID_EVENT IN 
                (SELECT ID_EVENT FROM EVENTS WHERE DATE::DATE < (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE ) 
                AND IS_APPROVED = FALSE`) 
    } catch (error) {
        isError = true
        log.error(`ERROR | removePastEvent - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            try {
                //remove dari notification
                var query_result = await pool.query(`DELETE FROM NOTIFICATION WHERE ACTION ILIKE 'requestEvent'
                    AND (SELECT DATE FROM EVENTS WHERE STRING1 = EVENTS.ID_EVENT)::DATE < (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE`) 
            } catch (error) {
                isError = true
                log.error(`ERROR | removePastEvent - Error found while connect to DB - ${error}`)
            } finally {
                log.info(`SUCCESS | removePastEvent - Cycle Done`)
            }
        }
    }
})