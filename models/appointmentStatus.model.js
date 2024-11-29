var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var AppointmentStatusSchema = new mongoose.Schema({    
    statusText:  { type : String , required : true },
    statusCode : String,
    priority : String,
    colorCode: String,
    isDefault: { 
        type: Boolean,
        default: false
    },
})

AppointmentStatusSchema.plugin(mongoosePaginate)
const AppointmentStatus = mongoose.model('AppointmentStatus', AppointmentStatusSchema, 'appointmentStatuses')

module.exports = AppointmentStatus;

