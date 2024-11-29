var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ActivityActionSchema = new mongoose.Schema({    
    actionText:  { type : String , required : true },
    actionCode : String,
    colorCode: String,
    iconCode: String,
    isMTApplicable: { 
        type: Boolean,
        default: false
    },
    isQAApplicable: { 
        type: Boolean,
        default: false
    },
    isActive: { 
        type: Number,
        default: 1
    },
})

ActivityActionSchema.plugin(mongoosePaginate)
const ActivityAction = mongoose.model('ActivityAction', ActivityActionSchema, 'activityActions')

module.exports = ActivityAction;

