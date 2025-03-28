const asyncHandler = require("express-async-handler")
const dayjs = require('dayjs')
require('dayjs/locale/id');
const log = require("../utils/logger")
const config = require("../config/general")

exports.emailValidation = function emailValidation(users_email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    var emailValid = pattern.test(users_email) ? true : false

    return emailValid
}

exports.dobValidation = function dobValidation(users_dob) {
    const pattern = /^\d{4}-\d{2}-\d{2}$/
    var dobValid = pattern.test(users_dob) ? true : false

    return dobValid
}

exports.genderValidation = function genderValid(users_gender) {
    if(users_gender.toLowerCase() != "f" || users_gender.toLowerCase() != "m" || users_gender.toLowerCase() != "female" || users_gender.toLowerCase() != "male") return true
    else return false
}

exports.toTitleCase = function toTitleCase(string) {
    var splitStr = string.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
        }
    
    return splitStr.join(' '); 
}

exports.getAge = function getAge(dob) {
    let today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    let monthDiff = today.getMonth() - dob.getMonth();
    let dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age
}

exports.getEndDate = function getEndDate(inpStartTime, duration){
    const [jam, menit] = inpStartTime.split(':').map(Number);

    const startTime = new Date();
    startTime.setHours(jam);
    startTime.setMinutes(menit);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    // Tambahkan durasi dalam menit
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Format kembali ke 'HH:MM'
    const hour_endTime = endTime.getHours().toString().padStart(2, '0');
    const min_endTime = endTime.getMinutes().toString().padStart(2, '0');

    return `${hour_endTime}:${min_endTime}`;
}

exports.fullDisplayDate = function fullDisplayDate(date) {
    const tempDate = dayjs(date).locale('ID');
    const formatted = tempDate.format('dddd, DD MMMM YYYY');

    return formatted
}