const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")

exports.getRatingTask = asyncHandler(async function getRatingTask() {
    let isError = false

    try {
        var query_result = await pool.query(`SELECT *
                                            FROM EVENTS_LINK A 
                                            WHERE ID_EVENT IN (SELECT ID_EVENT FROM EVENTS B WHERE B.DATE::DATE < (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE 
                                            AND IS_APPROVED = TRUE) AND ID_USER = A.ID_USER AND ID_EVENT NOT IN (SELECT ID_REVIEWEE FROM EVENT_RATING_TASKS WHERE ID_REVIEWER = A.ID_USER) 
                                            `) //REMOVE PLS
    } catch (error) {
        isError = true
        log.error(`ERROR | getRatingTask - Error found while connect to DB - ${error}`)
    } finally {
        if(!isError){
            if(query_result.rowCount > 0){
                console.log(query_result)
                for(let i = 0; i < query_result.rowCount; i++){
                    let isError = false
                    id_event = query_result.rows[i].id_event
                    id_user = query_result.rows[i].id_user

                    try {
                        var insert_result = await pool.query(`INSERT INTO EVENT_RATING_TASKS (ID_REVIEWEE, ID_REVIEWER)
                                                            SELECT '${id_event}', '${id_user}'
                                                            WHERE NOT EXISTS (
                                                                SELECT 1 
                                                                FROM review 
                                                                WHERE id_reviewee = '${id_event}' AND id_reviewer = '${id_user}'
                                                            )
                                                            AND NOT EXISTS (
                                                                SELECT 1 
                                                                FROM event_rating_tasks 
                                                                WHERE id_reviewee = '${id_event}' AND id_reviewer = '${id_user}'
                                                            )`)
                    } catch (error) {
                        isError = true
                        log.error(`ERROR | getRatingTask/insertEventRatingTask - Error found while connect to DB - ${error}`)
                    } 
                }   
            }
        }
        log.info(`SUCCESS | getRatingTask - Cycle Done`)
    }
})