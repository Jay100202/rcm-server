var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SpecialitySchema = new mongoose.Schema({
    specialityName: String,
    description: String,
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

SpecialitySchema.plugin(mongoosePaginate)

const Speciality = mongoose.model('Speciality', SpecialitySchema, 'specialities')

module.exports = Speciality;
