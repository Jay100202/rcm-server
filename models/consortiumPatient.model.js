var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumPatientSchema = new mongoose.Schema({
    consortium: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consortium'
    },
    patientId: Number,
    patientIdStr: String,
    salutation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Salutation'
    },
    fullName: String,
    firstName: String,
    middleName: String,
    lastName: String,
    birthDate: Number,
    birthDateStr: String,
    householdHeadName: String,
    mrNumber: String,
    physicianName: String,
    primaryCarePhysicianName: String,
    refferingPhysicianName: String,
    address: String,
    email: String,
    emergencyContactPersonName: String,
    emergencyContactPersonRelationship: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Relationship'
    },
    emergencyContactPersonNumber: String,
    gender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Gender'
    },
    description: String,
    primaryInsurancePlanName: String,
    primaryInsuranceGroupNumber: String,
    primaryInsuranceSubscriberID: String,
    primaryInsuranceCarrier: String,
    primaryInsurancePolicyNumber: String,
    primaryInsurancePerson: String,
    primaryInsuranceRelationshipToInsured: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Relationship'
    },
    primaryInsuranceSpecialProgramCode: String,
    primaryIssueDate: Number,
    primaryExpirationDate: Number,
    copayAmount: Number,
    primaryBenefitSandNotes: String,
    secondaryInsurancePlanName: String,
    secondaryGroupNumber: String,
    secondarySubscriberID: String,
    secondaryInsuranceCarrier: String,
    secondaryInsurancePolicyNumber: String,
    secondaryInsuredPerson: String,
    secondaryRelationshipToInsured:  { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Relationship'
    },
    secondaryIssueDate: Number,
    secondaryExpirationDate: Number,
    crossoverClaim: { 
        type: Boolean,
        default: false
    },
    secondaryBenefitSandNotes : String,
    tertiaryPlanName : String,
    tertiaryGroupNumber : String,
    tertiarySubscriberID : String,
    tertiaryInsuranceCarrier: String,
    tertiaryInsurancePolicyNumber: String,
    tertiaryInsuredPerson : String,
    tertiaryRelationshipToInsured : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Relationship'
    },
    tertiaryIssueDate : Number,
    tertiaryExpirationDate : Number,
    tertiaryBenefitSandNotes : String,
    consulatation : String,
    followUp : String,
    proceduresNotes  : String,
    labRecords : String,
    immunizationAndVaccineRecords : String,
    attachments: [{
        attType: {
            type: String,
            default: "Attachment",
          },
        attFilePath: String,
        attFilePathActual : String,
        attFilePathThumb : String,
        isImage : { 
            type: Boolean,
            default: false
        },
        attFileName: String,
        attFileSizeBytes: Number,
        attFileUrl: String,
        attImageActualUrl: String,
        attImageThumbUrl: String,
        attFileUrlExpiresAt : Number,
    }],
    specialProgramCode : String,
    hasPolicyIsCapitated : { 
        type: Boolean,
        default: false
    },
    hasCollectCoinsurance : { 
        type: Boolean,
        default: false
    },
    isActive: { 
        type: Number,
        default: 1
    },
    isAddedByConsortiumUser: { 
        type: Boolean,
        default: false
    },
    createdAt: { 
        type: Number
    },
    createdBySystemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    createdByConsortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
    updatedAt: { 
        type: Number
    },
    updatedBySystemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    updatedByConsortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
    isDeleted: { 
        type: Number,
        default: 0
    },
})


ConsortiumPatientSchema.plugin(mongoosePaginate)
const ConsortiumPatient = mongoose.model('ConsortiumPatient', ConsortiumPatientSchema, 'consortiumPatients')

module.exports = ConsortiumPatient;
