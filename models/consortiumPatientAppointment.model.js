var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

var ConsortiumPatientAppointmentSchema = new mongoose.Schema({
  consortium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consortium",
  },
  consortiumUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsortiumUser",
  },
  appointmentId: { type: Number },
  consortiumPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsortiumPatient",
  },
  appointmentDate: Number,
  startTime: { type: Number },
  endTime: { type: Number },
  //appointmentDateInt : Added On 01/03/24 By AGT
  appointmentDateInt: Number,
  //startTimeInt : Added On 01/03/24 By AGT
  startTimeInt: Number,
  //endTimeInt : Added On 01/03/24 By AGT
  endTimeInt: Number,
  appointmentStatus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AppointmentStatus",
  },
  transcriptionStatus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TranscriptionStatus",
  },
  transcriptionStatusNotes: String,
  consortiumLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsortiumLocation",
  },
  notes: { type: String },
  additionalTranscriptionNotes: String,
  appointmentAttachments: [
    {
      attType: {
        type: String,
        default: "Attachment",
      },
      attFilePath: String,
      attFilePathActual: String,
      attFilePathThumb: String,
      isImage: {
        type: Boolean,
        default: false,
      },
      attFileName: String,
      attFileSizeBytes: Number,
      attFileUrl: String,
      attImageActualUrl: String,
      attImageThumbUrl: String,
      attFileUrlExpiresAt: Number,
    },
  ],
  transcriptionAssignedAt: Number,
  transcriptionAssignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  isSubmitted: {
    type: Boolean,
    default: false,
  },
  transcriptionSubmittedAt: Number,
  transcriptionSubmittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  transcriptionCompletedAt: Number,
  transcriptionCompletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  hasDictation: {
    type: Boolean,
    default: false,
  },
  isDictationUploadCompleted: {
    type: Boolean,
    default: false,
  },
  dictationUploadCompletedAt: Number,
  totalDictationUploadCount: Number,
  totalDicationAttachmentFileSizeBytes: {
    type: Number,
    default: 0,
  },
  totalDicationDurationInSeconds: {
    type: Number,
    default: 0,
  },
  flagOffMarkedAt: Number,
  flagOffMarkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  mtAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  mtAssignedAt: Number,
  mtAssignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  //mtActivityAction added on 14/08/23 By AGT
  mtActivityAction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityAction",
  },
  //mtActivityStatus added on 26/10/23 By AGT
  mtActivityStatus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityStatus",
  },
  qa1AssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  qa1AssignedAt: Number,
  qa1AssignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  //qa1ActivityAction added on 14/08/23 By AGT
  qa1ActivityAction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityAction",
  },
  qa2AssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  qa2AssignedAt: Number,
  qa2AssignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  //qa2ActivityAction added on 14/08/23 By AGT
  qa2ActivityAction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityAction",
  },
  qa3AssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  qa3AssignedAt: Number,
  qa3AssignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  //qa3ActivityAction added on 14/08/23 By AGT
  qa3ActivityAction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityAction",
  },
  //activityPriority added on 03/07/23 By AGT
  activityPriority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityPriority",
  },
  //transcriptionAllocationDate added on 24/07/23 By AGT
  transcriptionAllocationDate: Number,
  //submittedTranscriptionAttachment added on 03/07/23 By AGT
  submittedTranscriptionAttachment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsortiumPatientAppointmentTranscriptionAttachment",
  },
  //ongoingActivityAction added on 03/07/23 By AGT
  ongoingActivityAction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityAction",
  },
  //ongoingActivityFileStatus added on 03/07/23 By AGT
  ongoingActivityFileStatus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActivityFileStatus",
  },
  //ongoingActivityStakeholder added on 03/07/23 By AGT
  ongoingActivityStakeholder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  //ongoingActivityTranscriptorRole added on 03/07/23 By AGT
  ongoingActivityTranscriptorRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TranscriptorRole",
  },
  //areAppointmentDetailsFilled added on 08/04/24 By AGT
  areAppointmentDetailsFilled: {
    type: Boolean,
    default: true,
  },
  //isBulkDictationAppointment added on 19/04/24 By AGT
  isBulkDictationAppointment: {
    type: Boolean,
    default: false,
  },
  //isDuplicatedDictationAppointment added on 28/05/24 By AGT
  isDuplicatedDictationAppointment: {
    type: Boolean,
    default: false,
  },
  //duplicatedBasePatientAppointment added on 28/05/24 By AGT
  duplicatedBasePatientAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsortiumPatientAppointment",
  },
  patientFullName: String,
  patientFirstName: String,
  patientLastName: String,
  patientBirthDate: Number,
  patientBirthDateStr: String,
  patientMRNumber: String,
  //isFinalTranscriptionAttachmentDownloaded added on 28/05/24 By AGT
  isFinalTranscriptionAttachmentDownloaded: {
    type: Boolean,
    default: false,
  },
  confirmedAt: {
    type: Number,
    default: 0,
  },
  arrivedAt: {
    type: Number,
    default: 0,
  },
  aptStartedAt: {
    type: Number,
    default: 0,
  },
  aptEndedAt: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Number,
    default: 1,
  },
  isAddedByConsortiumUser: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Number,
  },
  createdBySystemUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  createdByConsortiumUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsortiumUser",
  },
  updatedAt: {
    type: Number,
  },
  updatedBySystemUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  updatedByConsortiumUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsortiumUser",
  },
  isDeleted: {
    type: Number,
    default: 0,
  },
  coderAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  coderqaAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  BillerAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  BillerqaAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  coderNotes: {
    type: [{}],
    default: [],
  },
  followUpNotes: {
    type: [{}],
    default: [],
  },
});

ConsortiumPatientAppointmentSchema.plugin(mongoosePaginate);
const ConsortiumPatientAppointment = mongoose.model(
  "ConsortiumPatientAppointment",
  ConsortiumPatientAppointmentSchema,
  "consortiumPatientAppointments"
);

module.exports = ConsortiumPatientAppointment;
