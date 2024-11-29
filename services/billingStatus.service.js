var BillingStatus = require("../models/billingStatus.model");

exports.billingStatusList = async(req)=>{
        return await BillingStatus.find();
}

exports.createBillingStatus = async(req,systemUser)=>{
        const billingData = req.body;
    
        const billingStatusData = new BillingStatus({
            ...billingData,
            createdBy : systemUser
        });

        await billingStatusData.save();

        return billingStatusData;
}

exports.updateBillingStatus = async(req,systemUser)=>{
        const id = req.params.id;

        const updatedData = req.body;
    
        const updatedBillingStatus = await BillingStatus.findByIdAndUpdate(id,{
            ...updatedData,
            updatedBy : systemUser
        });

        return updatedBillingStatus;
}

exports.deleteBillingStatus = async(Id,systemUser)=>{
    
        const deletedBillingStatus = await BillingStatus.findByIdAndUpdate(Id,{
            isDeleted : 1,
            updatedBy : systemUser
});

        return deletedBillingStatus;
}