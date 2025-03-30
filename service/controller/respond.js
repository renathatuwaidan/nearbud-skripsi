const asyncHandler = require("express-async-handler")
const config = require("../config/general")

exports.query_pagination =  function query_pagination(req, res, page, size){
    let offset, req_query_pagination, pagination

    if(size == undefined || size == 0){
        pagination = config.base_response.pagination
    } else {
        pagination = size
    }

    if(page){
        offset = parseInt(pagination * (page-1))
    } else {
        offset = parseInt(0)
    }

    req_query_pagination = ` LIMIT ${pagination} OFFSET ${offset}`

    return req_query_pagination 
}

exports.successResp = function successResp(req, res, error_code, error_message, total_data, total_query_data, page, result, size) {
    total_data = parseInt(total_data) || 0;
    total_query_data = parseInt(total_query_data) || 0;
    page = parseInt(page);
    size = parseInt(size);

    const pagination = (size > 0) ? size : config.base_response.pagination || 10
    const total_page = total_data > 0 ? Math.ceil(total_data / pagination) : 0
    const current_page = (page > 0 && page <= total_page) ? page : (total_page > 0 ? 1 : 0)
    const total_data_per_page = (total_query_data > 0) ? total_query_data : 0

    const default_response = {
        error_schema: {
            error_code: error_code,
            error_message: error_message
        },
        output_schema: {
            pagination: {
                current_page: current_page,
                total_page: total_page,
                total_data_per_page: total_data_per_page,
                total_data: total_data
            },
            result
        }
    };

    return res.status(200).json(default_response);
};


// exports.successResp = function successResp(req, res, error_code, error_message, total_data, total_query_data, page, result, size) {
//     var page = parseInt(page)
//     var total_data = parseInt(total_data)
//     var total_query_data = parseInt(total_query_data)
//     var pagination = parseInt(size) || config.base_response.pagination

//     if(size == undefined || size == 0){
//         pagination = config.base_response.pagination
//     } else {
//         pagination = size  
//     }

//     if(total_data < pagination || total_data == undefined){
//         if(total_data == undefined || total_data == 0){
//             total_data = parseInt(0)
//             total_data_per_page = parseInt(0)
//             total_page = 0
//         }
//         else {
//             total_data_per_page = total_query_data
//             total_page = parseInt(1)
//         }
//     }  else {
//         current_page = parseInt(page)
//         total_data_per_page = pagination
//         total_page = parseInt(Math.ceil(total_data / pagination))

//         if(page > total_page){
//             total_data = parseInt(0)
//             total_data_per_page = parseInt(0)
//             total_page = parseInt(0)
//         }
//     }

//     // if(total_page != 0 && page != undefined){
//     //     current_page = parseInt(page)
//     // } else if (total_page != 0 && page == undefined) {
//     //     current_page = parseInt(1)
//     // }else {
//     //     current_page = parseInt(0)
//     // }

//     const current_page = (page > 0 && total_page > 0) ? page : (total_page > 0 ? 1 : 0);

//     var default_response = {
//         "error_schema" : {
//             "error_code" : error_code,
//             "error_message" : error_message
//         },
//         "output_schema" : {
//             "pagination" : {
//                 "current_page" : current_page,
//                 "total_page" : total_page,
//                 "total_data_per_page" : total_data_per_page,
//                 "total_data" : total_data
//             },
//             result      
//         }
//     }

//     return res.status(200).json(default_response)
// }