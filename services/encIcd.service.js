const EncIcd = require("../models/encIcd.model");

exports.createEncIcd = async (data, patientId, savedEncounter) => {
  console.log("datasssssssssss", data);

  // Check if a record with the given dx_code already exists
  let encIcdData = await EncIcd.findOne({ dx_code: data.dx_code });

  if (encIcdData) {
    // Update the existing record
    encIcdData.patientId = patientId;
    encIcdData.appointmentId = savedEncounter;
    encIcdData.icd10Id = data.icd10Id;
    encIcdData.formatted_dx_code = data.formatted_dx_code;
    encIcdData.valid_for_coding = data.valid_for_coding;
    encIcdData.active = data.active;
    encIcdData.short_desc = data.short_desc;
    encIcdData.long_desc = data.long_desc;
    encIcdData.revision = data.revision;
    encIcdData.primaryDx = data.primaryDx;
    encIcdData.newDx = data.newDx;
    encIcdData.diagIndex = data.diagIndex;
  } else {
    // Create a new record
    encIcdData = new EncIcd({
      patientId: patientId,
      appointmentId: savedEncounter,
      icd10Id: data.icd10Id,
      dx_code: data.dx_code,
      formatted_dx_code: data.formatted_dx_code,
      valid_for_coding: data.valid_for_coding,
      active: data.active,
      short_desc: data.short_desc,
      long_desc: data.long_desc,
      revision: data.revision,
      primaryDx: data.primaryDx,
      newDx: data.newDx,
      diagIndex: data.diagIndex,
    });
  }

  return await encIcdData.save();
};

exports.getEncIcdByEncounterId = async (id) => {
  return await EncIcd.find({ encounterId: id });
};

exports.updateEncIcd = async (id, data) => {
  return await EncIcd.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteEncIcd = async (id) => {
  return await EncIcd.findByIdAndDelete(id);
};

exports.getEncIcdByPatientId = async (patientId) => {
  console.log("patientId", patientId);
  return await EncIcd.find({ appointmentId: patientId });
};

exports.getEncIcdByAppointmentId = async (id) => {
  return await EncIcd.find({ appointmentId: id });
};
