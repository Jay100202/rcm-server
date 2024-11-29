const mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

const encCptSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
      // required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consortiumPatientAppointment",
      // required: true
    },
    cptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cpt4",
      // required: true
    },
    Code: {
      type: String,
      // required: true
    },
    units: {
      type: Number,
      // required: true
    },
    rate: {
      type: String,
      // required: true
    },
    diagPoint: {
      type: String,
      // required: true
    },
    modifier1: {
      type: String,
      // required: true
    },
    modifier2: {
      type: String,
      // required: true
    },
    modifier3: {
      type: String,
      // required: true
    },
    modifier4: {
      type: String,
      // required: true
    },
    cptFromDate: {
      type: Date,
      // required: true
    },
    cptToDate: {
      type: Date,
      // required: true
    },
    chargeAmount: {
      type: Number,
    },
    Description: {
      type: String,
    },
    Price: {
      type: Number,
    },
    catId: {
      type: Number,
    },
    grpId: {
      type: Number,
    },
    exAmount: {
      type: Number,
    },
    ageFrom: {
      type: Number,
    },
    ageTo: {
      type: Number,
    },
    gender: {
      type: String,
    },
    frequency: {
      type: Number,
    },
    ordProcedure: {
      type: String,
    },
    executedBy: {
      type: String,
    },
    serviceLocationId: {
      type: Number,
    },
    labCode: {
      type: String,
    },
    active: {
      type: String,
    },
    obgyn: {
      type: Number,
    },
    isFav: {
      type: String,
    },
    unlisted: {
      type: String,
    },
    insuranceBill: {
      type: String,
    },
    type: {
      type: String,
    },
    drugName: {
      type: String,
    },
    sendDescSV1017: {
      type: String,
    },
    rlsd: {
      type: String,
    },
    revenueCode: {
      type: String,
    },
    supervisingProvider: {
      type: String,
    },
    effectiveDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    modifier: {
      type: String,
    },
    notes: {
      type: String,
    },
    pointers: [
      {
        dx_code: String,
        formatted_dx_code: String,
        valid_for_coding: String,
        short_desc: String,
        long_desc: String,
        active: Number,
        revision: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

encCptSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("encCpt", encCptSchema, "encCpts");
