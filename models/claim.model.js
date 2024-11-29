const mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

const claimSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consortiumPatientAppointment",
    },
    claimDate: {
      type: Date,
      default: Date.now,
    },
    priInsId: {
      type: String,
      default: "",
    },
    priInsurance: {
      type: String,
      default: "",
    },
    priPlan: {
      type: String,
      default: "",
    },
    priExpiry: {
      type: Date,
      default: null,
    },
    priEffDate: {
      type: Date,
      default: null,
    },
    priPolicyNo: {
      type: String,
      default: "",
    },
    secInsId: {
      type: String,
      default: "",
    },
    secInsurance: {
      type: String,
      default: "",
    },
    secPlan: {
      type: String,
      default: "",
    },
    secExpiry: {
      type: Date,
      default: null,
    },
    secEffDate: {
      type: Date,
      default: null,
    },
    secPolicyNo: {
      type: String,
      default: "",
    },
    terInsId: {
      type: String,
      default: "",
    },
    terInsurance: {
      type: String,
      default: "",
    },
    terPlan: {
      type: String,
      default: "",
    },
    terExpiry: {
      type: Date,
      default: null,
    },
    terEffDate: {
      type: Date,
      default: null,
    },
    terPolicyNo: {
      type: String,
      default: "",
    },
    dx1_10: {
      type: String,
      default: "",
    },
    dx2_10: {
      type: String,
      default: "",
    },
    dx3_10: {
      type: String,
      default: "",
    },
    dx4_10: {
      type: String,
      default: "",
    },
    dx5_10: {
      type: String,
      default: "",
    },
    dx6_10: {
      type: String,
      default: "",
    },
    dx7_10: {
      type: String,
      default: "",
    },
    dx8_10: {
      type: String,
      default: "",
    },
    dx9_10: {
      type: String,
      default: "",
    },
    dx10_10: {
      type: String,
      default: "",
    },
    dx11_10: {
      type: String,
      default: "",
    },
    dx12_10: {
      type: String,
      default: "",
    },
    chargeAmount: {
      type: Number,
      default: 0,
    },
    primaryPaymentAmount: {
      type: Number,
      default: 0,
    },
    secondaryPaymentAmount: {
      type: Number,
      default: 0,
    },
    tertiaryPaymentAmount: {
      type: Number,
      default: 0,
    },
    patientPaymentAmount: {
      type: Number,
      default: 0,
    },
    copayAmount: {
      type: Number,
      default: 0,
    },
    deductibleAmount: {
      type: Number,
      default: 0,
    },
    coinsuranceAmount: {
      type: Number,
      default: 0,
    },
    writeOffAmount: {
      type: Number,
      default: 0,
    },
    primaryDenialCode: {
      type: String,
      default: "",
    },
    primaryDenialReason: {
      type: String,
      default: "",
    },
    secondaryDenialCode: {
      type: String,
      default: "",
    },
    secondaryDenialReason: {
      type: String,
      default: "",
    },
    tertiaryDenialCode: {
      type: String,
      default: "",
    },
    tertiaryDenialReason: {
      type: String,
      default: "",
    },
    priClaimId: {
      type: String,
      default: "",
    },
    secClaimId: {
      type: String,
      default: "",
    },
    terClaimId: {
      type: String,
      default: "",
    },
    priBatchNo: {
      type: String,
      default: "",
    },
    secBatchNo: {
      type: String,
      default: "",
    },
    terBatchNo: {
      type: String,
      default: "",
    },
    priClaimStatusCode: {
      type: String,
      default: "",
    },
    priClaimStatusDate: {
      type: Date,
      default: null,
    },
    secClaimStatusCode: {
      type: String,
      default: "",
    },
    secClaimStatusDate: {
      type: Date,
      default: null,
    },
    ediStatus: {
      type: String,
      default: "",
    },
    ediMessage: {
      type: String,
      default: "",
    },
    ediMsgInitiator: {
      type: String,
      default: "",
    },
    ediMsgRecdDate: {
      type: Date,
      default: null,
    },
    ediMsgRecdTime: {
      type: String,
      default: "",
    },
    secEdiStatus: {
      type: String,
      default: "",
    },
    secMessage: {
      type: String,
      default: "",
    },
    secMsgInitiator: {
      type: String,
      default: "",
    },
    secMsgRecdDate: {
      type: Date,
      default: null,
    },
    secMsgRecdTime: {
      type: String,
      default: "",
    },
    primaryClaimStatus: {
      type: Number,
      default: 0, // Default to 'Pended' status
      enum: [
        0, 1, 2, 3, 4, 5, 10, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27,
        29, 30, 31,
      ],
    },
    secondaryClaimStatus: {
      type: Number,
      default: 0, // Default to 'Pended' status
      enum: [
        0, 1, 2, 3, 4, 5, 10, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27,
        29, 30, 31,
      ],
    },
    tertiaryClaimStatus: {
      type: Number,
      default: 0, // Default to 'Pended' status
      enum: [
        0, 1, 2, 3, 4, 5, 10, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27,
        29, 30, 31,
      ],
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SystemUser",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SystemUser",
    },
  },
  {
    timestamps: true,
  }
);
claimSchema.plugin(mongoosePaginate);
const Claim = mongoose.model("Claim", claimSchema, "claims");

module.exports = Claim;
