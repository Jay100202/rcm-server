var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumLocationSchema = new mongoose.Schema({
    consortium: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consortium'
    },
    locationName: String,
    address : {
        addressLine1: String,
        addressLine2: String,
        addressLine3: String
    },
    phoneNumber1: String,
    phoneNumber2: String,
    phoneNumber3: String,
    email: String,
    websiteUrl: String,
    description: String,
    //timeZoneOption : added on 20/02/24 by AGT
    timeZoneOption: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TimeZoneOption'
    },
    //startTime : added on 20/02/24 by AGT
    startTime : String,
    //startTimeInt : added on 20/02/24 by AGT
    startTimeInt : Number,
    //endTime : added on 20/02/24 by AGT
    endTime : String,
    //endTimeInt : added on 20/02/24 by AGT
    endTimeInt : Number,
    isActive: { 
        type: Number,
        default: 1
    },
    createdAt: { 
        type: Number
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    updatedAt: { 
        type: Number
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    isDeleted: { 
        type: Number,
        default: 0
    },
})

ConsortiumLocationSchema.plugin(mongoosePaginate)
const ConsortiumLocation = mongoose.model('ConsortiumLocation', ConsortiumLocationSchema, 'consortiumLocations')

module.exports = ConsortiumLocation;
