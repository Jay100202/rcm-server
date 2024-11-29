const claimDetailModel = require("../models/claimDetails.model");
const ClaimModel = require("../models/claim.model");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");

const calculateTotalAmounts = async (patientId) => {
  return claimDetailModel.aggregate([
    { $match: { patientId: new mongoose.Types.ObjectId(patientId) } },
    {
      $group: {
        _id: null,
        totalPrimaryPayment: { $sum: "$primaryPaymentAmount" },
        totalSecondaryPayment: { $sum: "$secondaryPaymentAmount" },
        totalPatientPayment: { $sum: "$patientPaymentAmount" },
        totalCopay: { $sum: "$copayAmount" },
        totalDeductible: { $sum: "$deductibleAmount" },
        totalCoinsurance: { $sum: "$coinsuranceAmount" },
        totalWriteOff: { $sum: "$writeOffAmount" },
      },
    },
  ]);
};

const updateClaimRecord = async (patientId, totals) => {
  let claim = await ClaimModel.findOne({
    patientId: new mongoose.Types.ObjectId(patientId),
  });

  if (!claim) {
    claim = new ClaimModel({
      patientId: new mongoose.Types.ObjectId(patientId),
    });
  }

  claim.primaryPaymentAmount = totals.totalPrimaryPayment || 0;
  claim.secondaryPaymentAmount = totals.totalSecondaryPayment || 0;
  claim.patientPaymentAmount = totals.totalPatientPayment || 0;
  claim.copayAmount = totals.totalCopay || 0;
  claim.deductibleAmount = totals.totalDeductible || 0;
  claim.coinsuranceAmount = totals.totalCoinsurance || 0;
  claim.writeOffAmount = totals.totalWriteOff || 0;

  await claim.save();
};

exports.getClaimDetailById = async (id) => {
  return claimDetailModel.findById(id);
};

exports.createClaimDetail = async (data) => {
  const newClaimDetail = new claimDetailModel(data);
  await newClaimDetail.save();

  const { patientId } = newClaimDetail;
  const totalAmounts = await calculateTotalAmounts(patientId);

  if (totalAmounts.length > 0) {
    await updateClaimRecord(patientId, totalAmounts[0]);
  }

  return newClaimDetail;
};

exports.updateClaimDetail = async (id, data) => {
  const updatedClaimDetail = await claimDetailModel.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  const { patientId } = updatedClaimDetail;
  const totalAmounts = await calculateTotalAmounts(patientId);

  if (totalAmounts.length > 0) {
    await updateClaimRecord(patientId, totalAmounts[0]);
  }

  return updatedClaimDetail;
};

exports.deleteClaimDetail = async (id) => {
  const deletedClaimDetail = await claimDetailModel.findByIdAndDelete(id);
  const { patientId } = deletedClaimDetail;

  const totalAmounts = await calculateTotalAmounts(patientId);

  let totalAmount = 0;

  if (totalAmounts.length > 0) {
    totalAmount =
      parseFloat(totalAmounts[0].totalPrimaryPayment || 0) +
      parseFloat(totalAmounts[0].totalSecondaryPayment || 0) +
      parseFloat(totalAmounts[0].totalPatientPayment || 0) +
      parseFloat(totalAmounts[0].totalCopay || 0) +
      parseFloat(totalAmounts[0].totalDeductible || 0) +
      parseFloat(totalAmounts[0].totalCoinsurance || 0) +
      parseFloat(totalAmounts[0].totalWriteOff || 0);
  }

  let claim = await ClaimModel.findOne({
    patientId: new mongoose.Types.ObjectId(patientId),
  });

  if (!claim) {
    claim = new ClaimModel({
      patientId: new mongoose.Types.ObjectId(patientId),
    });
  }

  claim.amount = totalAmount;
  await claim.save();

  return deletedClaimDetail;
};

exports.listClaimDetailExcel = async (queryParams) => {
  const { skip, perPage, sortOn, sortDir, match } = queryParams;

  let query = [];

  if (match) {
    query.push({
      $match: {
        $or: [{ proCode: { $regex: match, $options: "i" } }],
      },
    });
  }

  query.push(
    {
      $match: {
        denialCode: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "claims",
        localField: "claimId",
        foreignField: "_id",
        as: "claimDetails",
      },
    },
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patientDetails",
      },
    },
    {
      $lookup: {
        from: "encounters",
        localField: "encounterId",
        foreignField: "_id",
        as: "encounterDetails",
      },
    },
    {
      $unwind: {
        path: "$claimDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$patientDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$encounterDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        totalAmount: {
          $sum: [
            "$primaryPaymentAmount",
            "$secondaryPaymentAmount",
            "$patientPaymentAmount",
            "$copayAmount",
            "$deductibleAmount",
            "$coinsuranceAmount",
            "$writeOffAmount",
          ],
        },
      },
    }
  );

  if (sortOn) {
    query.push({
      $sort: { [sortOn]: sortDir === "desc" ? -1 : 1 },
    });
  }

  query.push({
    $skip: skip || 0,
  });
  query.push({
    $limit: perPage || 10,
  });

  const data = await claimDetailModel.aggregate(query);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Claim Details");

  worksheet.columns = [
    { header: "Claim ID", key: "claimId" },
    { header: "Patient ID", key: "patientId" },
    { header: "Encounter ID", key: "encounterId" },
    { header: "Primary Payment Amount", key: "primaryPaymentAmount" },
    { header: "Secondary Payment Amount", key: "secondaryPaymentAmount" },
    { header: "Patient Payment Amount", key: "patientPaymentAmount" },
    { header: "Copay Amount", key: "copayAmount" },
    { header: "Deductible Amount", key: "deductibleAmount" },
    { header: "Coinsurance Amount", key: "coinsuranceAmount" },
    { header: "Write Off Amount", key: "writeOffAmount" },
    { header: "Total Amount", key: "totalAmount" },
  ];

  data.forEach((item) => {
    worksheet.addRow({
      claimId: item.claimDetails._id || "",
      patientId: item.patientDetails._id || "",
      encounterId: item.encounterDetails._id || "",
      primaryPaymentAmount: item.primaryPaymentAmount || 0,
      secondaryPaymentAmount: item.secondaryPaymentAmount || 0,
      patientPaymentAmount: item.patientPaymentAmount || 0,
      copayAmount: item.copayAmount || 0,
      deductibleAmount: item.deductibleAmount || 0,
      coinsuranceAmount: item.coinsuranceAmount || 0,
      writeOffAmount: item.writeOffAmount || 0,
      totalAmount: item.totalAmount || 0,
    });
  });

  const filename = `Claim_Details_${new Date().toISOString()}.xlsx`;

  return { workbook, filename };
};

exports.updatePrimaryDenial = async (id, { denial_code, denial_reason }) => {
  try {
    // Update the claim detail entry
    const updatedClaimDetail = await claimDetailModel.findByIdAndUpdate(
      id,
      {
        primary_denial_code: denial_code,
        primary_denial_reason: denial_reason,
        primary_payment_amount: 0,
      },
      { new: true }
    );

    if (!updatedClaimDetail) {
      throw new Error("Claim detail not found");
    }

    // Get the encounter_id from the updated claim detail
    const { encounter_id } = updatedClaimDetail;

    // Calculate the updated total primary payment amount for the corresponding claim
    const totalPrimaryAmount = await claimDetailModel.aggregate([
      { $match: { encounter_id: new mongoose.Types.ObjectId(encounter_id) } },
      {
        $group: {
          _id: null,
          totalPrimaryPayment: { $sum: "$primary_payment_amount" },
        },
      },
    ]);

    const primaryPaymentAmount = totalPrimaryAmount[0]
      ? totalPrimaryAmount[0].totalPrimaryPayment
      : 0;

    // Update the claim record with the new primary payment amount
    const updatedClaim = await ClaimModel.findOneAndUpdate(
      { encounter_id: new mongoose.Types.ObjectId(encounter_id) },
      { primary_payment_amount: primaryPaymentAmount },
      { new: true }
    );

    if (!updatedClaim) {
      throw new Error("Claim not found");
    }

    return { updatedClaimDetail, updatedClaim };
  } catch (error) {
    throw error;
  }
};

exports.updateSecondaryDenial = async (id, { denial_code, denial_reason }) => {
  try {
    // Update the claim detail entry
    const updatedClaimDetail = await claimDetailModel.findByIdAndUpdate(
      id,
      {
        secondary_denial_code: denial_code,
        secondary_denial_reason: denial_reason,
        secondary_payment_amount: 0,
      },
      { new: true }
    );

    if (!updatedClaimDetail) {
      throw new Error("Claim detail not found");
    }

    // Get the encounter_id from the updated claim detail
    const { encounter_id } = updatedClaimDetail;

    // Calculate the updated total secondary payment amount for the corresponding claim
    const totalSecondaryAmount = await claimDetailModel.aggregate([
      { $match: { encounter_id: new mongoose.Types.ObjectId(encounter_id) } },
      {
        $group: {
          _id: null,
          totalSecondaryPayment: { $sum: "$secondary_payment_amount" },
        },
      },
    ]);

    const secondaryPaymentAmount = totalSecondaryAmount[0]
      ? totalSecondaryAmount[0].totalSecondaryPayment
      : 0;

    // Update the claim record with the new secondary payment amount
    const updatedClaim = await ClaimModel.findOneAndUpdate(
      { encounter_id: new mongoose.Types.ObjectId(encounter_id) },
      { secondary_payment_amount: secondaryPaymentAmount },
      { new: true }
    );

    if (!updatedClaim) {
      throw new Error("Claim not found");
    }

    return { updatedClaimDetail, updatedClaim };
  } catch (error) {
    throw error;
  }
};

exports.updateTertiaryDenial = async (id, { denial_code, denial_reason }) => {
  try {
    // Update the claim detail entry
    const updatedClaimDetail = await claimDetailModel.findByIdAndUpdate(
      id,
      {
        tertiary_denial_code: denial_code,
        tertiary_denial_reason: denial_reason,
        tertiary_payment_amount: 0,
      },
      { new: true }
    );

    if (!updatedClaimDetail) {
      throw new Error("Claim detail not found");
    }

    // Get the encounter_id from the updated claim detail
    const { encounter_id } = updatedClaimDetail;

    // Calculate the updated total tertiary payment amount for the corresponding claim
    const totalTertiaryAmount = await claimDetailModel.aggregate([
      { $match: { encounter_id: new mongoose.Types.ObjectId(encounter_id) } },
      {
        $group: {
          _id: null,
          totalTertiaryPayment: { $sum: "$tertiary_payment_amount" },
        },
      },
    ]);

    const tertiaryPaymentAmount = totalTertiaryAmount[0]
      ? totalTertiaryAmount[0].totalTertiaryPayment
      : 0;

    // Update the claim record with the new tertiary payment amount
    const updatedClaim = await ClaimModel.findOneAndUpdate(
      { encounter_id: new mongoose.Types.ObjectId(encounter_id) },
      { tertiary_payment_amount: tertiaryPaymentAmount },
      { new: true }
    );

    if (!updatedClaim) {
      throw new Error("Claim not found");
    }

    return { updatedClaimDetail, updatedClaim };
  } catch (error) {
    throw error;
  }
};
exports.getClaimDetailByEncounterId = async (id)=>{
  return claimDetailModel.find({
    encounterId: id,
  });
}

exports.updateManyClaimDetails = async(id,existingClaimId)=>{
  const updatedClaimDetails = await claimDetailModel.updateMany(
    { encounterId: id },
    { $set: { claimId: existingClaimId } }
  );

  return updatedClaimDetails;
}

exports.findOneClaimDetails = async(id,code)=>{
  return await ClaimDetail.findOne({
    encounterId: id,
    cptCode: code,
  });
}

exports.updateOneClaimDetail = async(id,data)=>{
  return  await ClaimDetail.updateOne({ _id: id },{
    modifier: data.modifier1,
    modifier2: data.modifier2,
    modifier3: data.modifier3,
    modifier4: data.modifier4,
    chargeAmount: data.units * data.rate,
    unit: data.units,
  });
}

exports.deleteClaimDetailByEncId = async(id,code)=>{
  return await ClaimDetail.findOneAndDelete({
    encounterId: id,
    cptCode: code,
  });
}

exports.updateClaimIdClaimDetail = async(id,claimId)=>{
  await ClaimDetail.updateMany(
    { encounterId: id },
    { $set: { claimId: claimId } }
  );
}

exports.getClaimDetailByEncounterId = async (id)=>{
  return claimDetailModel.find({
    encounterId: id,
  });
}

exports.updateManyClaimDetails = async(id,existingClaimId)=>{
  const updatedClaimDetails = await claimDetailModel.updateMany(
    { encounterId: id },
    { $set: { claimId: existingClaimId } }
  );

  return updatedClaimDetails;
}

exports.findOneClaimDetails = async(id,code)=>{
  return await ClaimDetail.findOne({
    encounterId: id,
    cptCode: code,
  });
}

exports.updateOneClaimDetail = async(id,data)=>{
  return  await ClaimDetail.updateOne({ _id: id },{
    modifier: data.modifier1,
    modifier2: data.modifier2,
    modifier3: data.modifier3,
    modifier4: data.modifier4,
    chargeAmount: data.units * data.rate,
    unit: data.units,
  });
}

exports.deleteClaimDetailByEncId = async(id,code)=>{
  return await ClaimDetail.findOneAndDelete({
    encounterId: id,
    cptCode: code,
  });
}

exports.updateClaimIdClaimDetail = async(id,claimId)=>{
  await ClaimDetail.updateMany(
    { encounterId: id },
    { $set: { claimId: claimId } }
  );
}