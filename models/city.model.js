var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CitySchema = new mongoose.Schema({
    cityName:  { type : String, required : true },
    description: String,
    state: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'State'
    },
    country: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Country'
    },
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

CitySchema.plugin(mongoosePaginate)
const City = mongoose.model('City', CitySchema, 'cities')

module.exports = City;