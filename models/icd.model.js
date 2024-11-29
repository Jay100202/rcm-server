const mongoose = require("mongoose");
const icdSchema = mongoose.Schema({
  dx_code: {
    type: String,
  },
  formatted_dx_code: {
    type: String,
  },
  valid_for_coding: {
    type: String,
  },
  short_desc: {
    type: String,
  },
  long_desc: {
    type: String,
  },
  active: {
    type: Number,
  },
  revision: {
    type: Number,
  },
});

module.exports = mongoose.model("icd10_dx_order_code", icdSchema);
