var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var encounterSchema = new mongoose.Schema(
{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient"
    },
    eNo: {
      type: Number,
    },
    eDate: {
      type: Date,
    },
    eStatus: {
      type: String,
      ref: "encounterStatus"
    },
    dateOfService: {
      type: Date,
    },
    physician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    typeOfVisit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "typeOfVisit"
    },
    adminDate: {
      type: Date,
    },
    medicalAssitant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    billingPhysician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    billingStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "billingStatus"
    },
    copayCollected: {
      type: Number,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facility"
    },
    isActive: {
        type: Number,
        default: 1
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'systemUser'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'systemUser'
    },
    isDeleted: {
      type: Number,
      default: 0
  }
  },
  {
    timestamps: true,
  }
)

encounterSchema.plugin(mongoosePaginate)

const Encounter = mongoose.model('encounter', encounterSchema, 'encounters')

module.exports = Encounter;
