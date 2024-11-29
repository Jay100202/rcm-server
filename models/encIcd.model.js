const mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

const encIcdSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
      // required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consortiumPatientAppointment", // required: true
    },
    icd10Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "icd10_dx_order_code",
      // required: true
    },
    dx_code: {
      type: String,
      // required: true
    },
    formatted_dx_code: {
      type: String,
      // required: true
    },
    valid_for_coding: {
      type: String,
      // required: true
    },
    active: {
      type: String,
      // required: true
    },
    short_desc: {
      type: String,
      // required: true
    },
    long_desc: {
      type: String,
      // required:
    },
    primaryDx: {
      type: String,
      // required: true
    },
    newDx: {
      type: String,
      // required: true
    },
    diagIndex: {
      type: Number,
      // required: true
    },
    revision: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

encIcdSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("encIcd", encIcdSchema, "encIcds");
