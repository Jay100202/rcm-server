const mongoose = require("mongoose");

const cpt4Schema = mongoose.Schema({
  Code: {
    type: String,
  },
  Description: {
    type: String,
  },
  Price: {
    type: Number,
  },
  Cat_Id: {
    type: Number,
  },
  Grp_Id: {
    type: Number,
  },
  ExAmount: {
    type: Number,
  },
  ModifierId: {
    type: Number,
  },
  ModifierId2: {
    type: Number,
  },
  ModifierId3: {
    type: Number,
  },
  ModifierId4: {
    type: Number,
  },
  agefrom: {
    type: Number,
  },
  ageto: {
    type: Number,
  },
  gender: {
    type: String,
  },
  frequency: {
    type: Number,
  },
  ord_procedure: {
    type: String,
  },
  executedby: {
    type: String,
  },
  servicelocationid: {
    type: Number,
  },
  lab_code: {
    type: String,
  },
  units: {
    type: Number,
  },
  Active: {
    type: String,
  },
  OBGYn: {
    type: Number,
  },
  isfav: {
    type: String,
  },
  unlisted: {
    type: String,
  },
  Insurance_bill: {
    type: String,
  },
  Type: {
    type: String,
  },
  Drugname: {
    type: String,
  },
  SendDesc_SV101_7: {
    type: String,
  },
  RLSD: {
    type: String,
  },
  RevenueCode: {
    type: String,
  },
  SupervisingProvider: {
    type: String,
  },
  EffectiveDate: {
    type: Date,
  },
  ExpiryDate: {
    type: Date,
  },
});

module.exports = mongoose.model("cpt4", cpt4Schema);
