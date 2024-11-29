var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CountrySchema = new mongoose.Schema({
    countryName: String,
    description: String,
    /* dialingCode : Added on 11/01/23 By AJP*/
    dialingCode: String,
    isActive: {
        type: Number,
        default: 1
    },
    createdAt: Number,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    updatedAt: Number,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    isDeleted: {
        type: Number,
        default: 0
    }
})

CountrySchema.plugin(mongoosePaginate)

const Country = mongoose.model('Country', CountrySchema, 'countries')

module.exports = Country;
