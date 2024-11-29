const mongoose = require("mongoose");
const typeOfVisitSchema = mongoose.Schema({
  name: {
    type: String,
  },
  typeofvisitkey: {
    type: String,
  },
  description: {
    type: String,
  },
});
module.exports = mongoose.model("typeOfVisit", typeOfVisitSchema, "typeOfVisits");
