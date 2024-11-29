const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

const claimDetailSchema = new mongoose.Schema(
  {
    claimId: {
      type: ObjectId,
      // required: true,
    },
    patientId: {
      type: ObjectId,
      // required: true,
    },
    appointmentId: {
      type: ObjectId,
      // required: true,
    },
    dosFrom: {
      type: Date,
      // required: true,
    },
    dosTo: {
      type: Date,
      // required: true,
    },
    cptCode: {
      type: String,
      // required: true,
    },
    proCode: {
      type: String,
      // required: true,
    },
    modifier: {
      type: String,
      // required: true,
    },
    modifier2: {
      type: String,
      // required: true,
    },
    modifier3: {
      type: String,
      // required: true,
    },
    modifier4: {
      type: String,
      // required: true,
    },
    preDxCode: {
      type: String,
      // required: true,
    },
    dxCode2: {
      type: String,
      // required: true,
    },
    dxCode3: {
      type: String,
      // required: true,
    },
    dxCode4: {
      type: String,
      // required: true,
    },
    unit: {
      type: Number,
      // required: true,
    },
    chargeAmount: {
      type: Number,
      // required: true,
    },
    primaryPaymentAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    secondaryPaymentAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    tertiaryPaymentAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    patientPaymentAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    copayAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    deductibleAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    coinsuranceAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    writeOffAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    primaryDenialCode: {
      type: String,
      // required: true,
    },
    primaryDenialReason: {
      type: String,
      // required: true,
    },
    secondaryDenialCode: {
      type: String,
      // required: true,
    },
    secondaryDenialReason: {
      type: String,
      // required: true,
    },
    tertiaryDenialCode: {
      type: String,
      // required: true,
    },
    tertiaryDenialReason: {
      type: String,
      // required: true,
    },
    remarks: {
      type: String,
      // required: true,
    },
    dateOfPrimaryDenial: {
      type: Date,
      // required: true,
    },
    primaryFollowUpAction: {
      type: String,
      // required: true,
    },
    dateOfSecondaryDenial: {
      type: Date,
      // required: true,
    },
    secondaryFollowUpAction: {
      type: String,
      // required: true,
    },
    dateOfTertiaryDenial: {
      type: Date,
      // required: true,
    },
    tertiaryFollowUpAction: {
      type: String,
      // required: true,
    },
    facilityId: {
      type: ObjectId,
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

claimDetailSchema.plugin(mongoosePaginate);

const ClaimDetail = mongoose.model(
  "ClaimDetail",
  claimDetailSchema,
  "claimDetails"
);

module.exports = ClaimDetail;
