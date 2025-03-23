const asyncHandler = require("express-async-handler")
const pool = require("../config/database")
const log = require("../utils/logger")
const config = require("../config/general")
const respond = require("./respond")

exports.add_communityLink = asyncHandler(async function add_communityLink(req, res, community_id,  users_username) {
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

exports.checkUser = asyncHandler(async function checkUser(req, res, users_id, users_username, token) {
    var isError = false
    var urlHitAPI = config.api_endpoint.getUser + '?' + `users_id=${users_id}&users_username=${users_username}`
    var headersHitAPI = JSON.stringify({
        "Authorization" : "Bearer " + token
    })

    try {
        hitAPI = await axios.request({
            method : "GET",
            url : urlHitAPI,
            headers : JSON.parse(headersHitAPI)
        })
    } catch (error) {
        isError = true
    } finally {
        if(!isError){
            if(hitAPI.data.output_schema.result == []) return true
            else return false
        } else {
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-003-002",
                    "error_message" : `Error while HIT API getUser`
                }
            })
        }
    }
})

exports.checkCommunity = asyncHandler(async function checkCommunity(req, res, community_name, community_id) {
    var isError = false
    var urlHitAPI = config.api_endpoint.getUser + '?' + `users_id=${users_id}&users_username=${users_username}`
    var headersHitAPI = JSON.stringify({
        "Authorization" : "Bearer " + token
    })

    try {
        hitAPI = await axios.request({
            method : "GET",
            url : urlHitAPI,
            headers : JSON.parse(headersHitAPI)
        })
    } catch (error) {
        isError = true
    } finally {
        if(!isError){
            if(hitAPI.data.output_schema.result == []) return true
            else return false
        } else {
            return res.status(500).json({
                "error_schema" : {
                    "error_code" : "nearbud-003-002",
                    "error_message" : `Error while HIT API getUser`
                }
            })
        }
    }
})