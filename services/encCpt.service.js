const EncCpt = require("../models/encCpt.model");
// Adjust the path as necessary

exports.createEncCpt = async (
  data,
  patientId,
  savedEncounter,
  chargeAmount
) => {
  console.log("datasssEnc", data);
  console.log("chargeAmounttttttttttttt", chargeAmount);

  // Check if a record with the given cptCode already exists
  let encCptData = await EncCpt.findOne({ Code: data.Code });

  if (encCptData) {
    // Update the existing record
    encCptData.patientId = patientId;
    encCptData.appointmentId = savedEncounter;
    encCptData.cptId = data._id;
    encCptData.Description = data.Description;
    encCptData.Price = data.Price;
    encCptData.catId = data.Cat_Id;
    encCptData.grpId = data.Grp_Id;
    encCptData.exAmount = data.ExAmount;
    encCptData.ageFrom = data.agefrom;
    encCptData.ageTo = data.ageto;
    encCptData.gender = data.gender;
    encCptData.frequency = data.frequency;
    encCptData.ordProcedure = data.ord_procedure;
    encCptData.executedBy = data.executedby;
    encCptData.serviceLocationId = data.servicelocationid;
    encCptData.labCode = data.lab_code;
    encCptData.units = data.units;
    encCptData.active = data.Active;
    encCptData.obgyn = data.OBGYn;
    encCptData.isFav = data.isfav;
    encCptData.unlisted = data.unlisted;
    encCptData.insuranceBill = data.Insurance_bill;
    encCptData.type = data.Type;
    encCptData.drugName = data.Drugname;
    encCptData.sendDescSV1017 = data.SendDesc_SV101_7;
    encCptData.rlsd = data.RLSD;
    encCptData.revenueCode = data.RevenueCode;
    encCptData.supervisingProvider = data.SupervisingProvider;
    encCptData.effectiveDate = data.EffectiveDate;
    encCptData.expiryDate = data.ExpiryDate;
    encCptData.modifier1 = data.modifier1;
    encCptData.modifier2 = data.modifier2;
    encCptData.modifier3 = data.modifier3;
    encCptData.modifier4 = data.modifier4;
    encCptData.cptFromDate = data.cptFromDate;
    encCptData.cptToDate = data.cptToDate;
    encCptData.notes = data.notes;
    encCptData.pointers = data.pointers;
    encCptData.chargeAmount = chargeAmount;
    encCptData.createdBy = data.createdBy;
  } else {
    // Create a new record
    encCptData = new EncCpt({
      patientId: patientId,
      appointmentId: savedEncounter,
      cptId: data._id,
      Code: data.Code,
      Description: data.Description,
      Price: data.Price,
      catId: data.Cat_Id,
      grpId: data.Grp_Id,
      exAmount: data.ExAmount,
      ageFrom: data.agefrom,
      ageTo: data.ageto,
      gender: data.gender,
      frequency: data.frequency,
      ordProcedure: data.ord_procedure,
      executedBy: data.executedby,
      serviceLocationId: data.servicelocationid,
      labCode: data.lab_code,
      units: data.units,
      active: data.Active,
      obgyn: data.OBGYn,
      isFav: data.isfav,
      unlisted: data.unlisted,
      insuranceBill: data.Insurance_bill,
      type: data.Type,
      drugName: data.Drugname,
      sendDescSV1017: data.SendDesc_SV101_7,
      rlsd: data.RLSD,
      revenueCode: data.RevenueCode,
      supervisingProvider: data.SupervisingProvider,
      effectiveDate: data.EffectiveDate,
      expiryDate: data.ExpiryDate,
      modifier1: data.modifier1,
      modifier2: data.modifier2,
      modifier3: data.modifier3,
      modifier4: data.modifier4,
      cptFromDate: data.cptFromDate,
      cptToDate: data.cptToDate,
      notes: data.notes,
      pointers: data.pointers,
      chargeAmount: chargeAmount,
      createdBy: data.createdBy,
    });
  }

  return await encCptData.save();
};

exports.getEncCptByEncounterId = async (id) => {
  return await EncCpt.find({ encounterId: id });
};

exports.updateEncCpt = async (id, data) => {
  return await EncCpt.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteEncCpt = async (id) => {
  return await EncCpt.findByIdAndDelete(id);
};

exports.getEncCptByPatientId = async (patientId) => {
  return await EncCpt.find({ appointmentId: patientId });
};

exports.getEncCptByAppointmentId = async (id) => {
  return await EncCpt.find({ appointmentId: id });
};