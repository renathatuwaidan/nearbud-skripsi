const cron = require('node-cron')

const rating_controller = require("./controller/rating")
const notification_controller = require("./controller/notification")
const users_controller = require("./controller/users")

// - kalua status accepted/rejected event/community date h+7, delete dri notif
// - kalua event yang status reqJoin pending + event date < now, bakalan delete dari notif + eventlink
// - hapus notif kalo statusnya newEvent jika sudah berlalu
// - job untuk remove users where not is_verified = true yang udah > 24 jam
// - add Rating by Job, jika created < now
// if user blocked 3 times, then suspended 
// if suspended > seminggu, then unsuspended


cron.schedule('* * * * *', () => {
    rating_controller.getRatingTask()
    notification_controller.cleanRejectAcc()
    notification_controller.cleanNewEvent()
    notification_controller.removePastEvent()
    users_controller.deleteUnverifUser()
    users_controller.unsuspendingUser()
    users_controller.suspendingUser()
})
