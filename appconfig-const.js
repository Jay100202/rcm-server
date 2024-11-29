const systemUserMasterPwd = "uABdDmgYRx";
const consortiumUserMasterPwd = "UahrGrINpJ";


const patientSearchByCodeContactNo = "CNTC";
const patientSearchByTextContactNo = "Mobile No";

const patientSearchByCodePatientId = "PTID";
const patientSearchByTextPatientId = "Patient ID";

const patientSearchByCodePatientName = "PTNM";
const patientSearchByTextPatientName = "Patient Name";

const patientSearchByCodeAllPatientParams = "PTALL";
const patientSearchByTextAllPatientParams = "ID & Name";

const chatThreadStatusCodeAll = "AL";
const chatThreadStatusTextAll = "All";

const chatThreadStatusCodeOpen = "OP";
const chatThreadStatusTextOpen = "Open";

const chatThreadStatusCodeClosed = "CL";
const chatThreadStatusTextClosed = "Closed";

module.exports = {

    APP_SORT_ORDER_ASC : 'ASC',
    APP_SORT_ORDER_DSC : 'DSC',

    DEFAULT_CURRENCY_PREFIX : 'Rs. ',
    DEFAULT_CURRENCY_CODE : 'Rs',
    DEFAULT_CURRENCY_TEXT : 'Rupees',

    MAT_COLUMN_NAME_STATUS : 'status',

    FORMULATED_HIERARCH_NAME_STRING_SEP: ' > ',

    PARAM_SKIP_RESPONSE: 'skipResponse',

    SUPER_USER_MASTER_PASSWORD : systemUserMasterPwd,
    CONSORTIUM_USER_MASTER_PASSWORD : consortiumUserMasterPwd,

    PAYMENT_STATUS_PENDING_CODE: 'PND',
    PAYMENT_STATUS_PARTLY_PAID_CODE: 'PRT',
    PAYMENT_STATUS_PAID_CODE: 'CMP',
    
    DELIVERY_STATUS_PENDING_CODE: 'PND',
    DELIVERY_STATUS_PARTLY_DELIVERED_CODE: 'PRT',
    DELIVERY_STATUS_COMPLETED_CODE: 'CMP',

    ACTIVITY_STATUS_NOT_ASSIGNED_CODE: 'NASD',
    ACTIVITY_STATUS_PENDING_CODE: 'PND',
    ACTIVITY_STATUS_IN_PROGRESS_CODE: 'INP',
    ACTIVITY_STATUS_COMPLETED_CODE: 'CMP',
    
    ITEM_REORDER_LIST : 'REPORT_ITEM_REORDER_LIST',
    ITEM_EXPIRY_LIST : 'REPORT_ITEM_EXPIRY_LIST',
    ITEM_STOCK_TRANSACTION_LIST : 'REPORT_ITEM_TRANSACTION_LIST',
    STOCK_SUMMARY : 'REPORT_STOCK_SUMMARY',
    LOW_STOCK_SUMMARY : 'REPORT_LOW_STOCK_SUMMARY',
    SALES_ORDER : 'REPORT_SALES_ORDER',
    PENDING_ORDER : 'REPORT_PENDING_ORDER',
    PURCHASE_REPORT : 'REPORT_PURCHASE_REPORT',

    CLUBBED_ITEM_INWARD_TYPE_CODE: 'CLB_',
    INDIVIDUAL_ITEM_INWARD_TYPE_CODE : 'IND_',

    CLUBBED_ITEM_INWARD_TYPE_CODE_PREFIX: 'CLB',
    INDIVIDUAL_ITEM_INWARD_TYPE_CODE_PREFIX : 'IND',

    APPOINTMENT_STATUS_CODE_CONSULTED : 'CNSLTD',
    APPOINTMENT_STATUS_CODE_WALK_IN : 'WLKIN',
    APPOINTMENT_STATUS_CODE_PENDING : 'PND',

    TRANSCRIPTOR_ROLE_CODE_MT : 'MT',
    TRANSCRIPTOR_ROLE_CODE_QA : 'QA',
    TRANSCRIPTOR_ROLE_CODE_STAFF : 'STF',
    TRANSCRIPTOR_ROLE_CODE_MT_QA : 'MT-QA',
    TRANSCRIPTOR_ROLE_CODE_CODER : 'CD',
    
    ROLE_CODE_MT : 'MT',
    ROLE_CODE_QA1 : 'QA1',
    ROLE_CODE_QA2 : 'QA2',
    ROLE_CODE_QA3 : 'QA3',
    ROLE_CODE_ALL : 'ALL',
    ROLE_CODE_CODER : 'CODER',
    
    TRANSCRIPTION_STATUS_CODE_ASSIGNMENT_PENDING : 'PND',
    TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED : 'TRNS',
    TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED : 'QA1',
    TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED : 'QA2',
    TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED : 'QA3',
    TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_COMPLETED : 'CMP',
    TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_SUBMITTED : 'SUB',

    ACTIVITY_FILE_STATUS_CODE_PENDING : 'PND',
    ACTIVITY_FILE_STATUS_CODE_COMPLETED : 'CMP',

    CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER : 'CONS_USER',
    CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER : 'SYS_USER',

    CONSORTIUM_CHAT_STATUS_CODE_ON_HOLD : 'HLD',
    CONSORTIUM_CHAT_STATUS_CODE_IN_PROGRESS : 'INP',
    CONSORTIUM_CHAT_STATUS_CODE_PENDING : 'PND',
    CONSORTIUM_CHAT_STATUS_CODE_RESOLVED : 'RSV',
    CONSORTIUM_CHAT_STATUS_CODE_UNRESOLVED : 'URSV',

    WORK_POOL_LIST_CODE_IN_PROGRESS : 'INP',
    WORK_POOL_LIST_CODE_COMPLETED : 'CMP',
    WORK_POOL_LIST_CODE_PENDING : 'PND',

    
    ACTIVITY_ACTION_CODE_EDIT : 'EDIT',
    ACTIVITY_ACTION_CODE_FLAG_OFF : 'FLGOF',
    ACTIVITY_ACTION_CODE_CLEAR : 'CLR',
    ACTIVITY_ACTION_CODE_SEND_BACK_TO_MT : 'SNDTOMT',
    ACTIVITY_ACTION_CODE_SEND_BACK_TO_QA : 'SNDTOQA',

    TRANSCRIPTION_LOG_ACTION_STARTED : 'Started',
    TRANSCRIPTION_LOG_ACTION_STOPPED : 'Stopped',
    TRANSCRIPTION_LOG_ACTION_ASSIGNED : 'Assigned',
    TRANSCRIPTION_LOG_ACTION_DEASSIGNED : 'Deassigned',
    TRANSCRIPTION_LOG_ACTION_GIVEBACK : 'Giveback',
    TRANSCRIPTION_LOG_ACTION_UPLOADS : 'Uploads',

    PATIENT_SEARCH_BY_CODE_CONTACT_NO : patientSearchByCodeContactNo,
    PATIENT_SEARCH_BY_CODE_PATIENT_ID : patientSearchByCodePatientId,
    PATIENT_SEARCH_BY_CODE_PATIENT_NAME : patientSearchByCodePatientName,
    PATIENT_SEARCH_BY_CODE_ALL_PATIENT_PARAMS : patientSearchByCodeAllPatientParams,
  
    PATIENT_SEARCH_BY_OPTION_SELECT_ARR: [
        { 'id': patientSearchByCodeAllPatientParams, 'text': patientSearchByTextAllPatientParams },
        // { 'id': patientSearchByCodeContactNo, 'text': patientSearchByTextContactNo },
        { 'id': patientSearchByCodePatientId, 'text': patientSearchByTextPatientId },
        { 'id': patientSearchByCodePatientName, 'text': patientSearchByTextPatientName }
    ],

    CHAT_THREAD_STATUS_CODE_ALL : chatThreadStatusCodeAll,
    CHAT_THREAD_STATUS_CODE_OPEN : chatThreadStatusCodeOpen,
    CHAT_THREAD_STATUS_CODE_CLOSED : chatThreadStatusCodeClosed,
    CHAT_THREAD_STATUS_CODE_DEFAULT : chatThreadStatusCodeOpen,
  
    CHAT_THREAD_STATUS_OPTION_SELECT_ARR: [
        { 'id': chatThreadStatusCodeAll, 'text': chatThreadStatusTextAll },
        { 'id': chatThreadStatusCodeOpen, 'text': chatThreadStatusTextOpen },
        { 'id': chatThreadStatusCodeClosed, 'text': chatThreadStatusTextClosed },
    ],
  
    CHAT_THREAD_STATUS_CODE_PERMITTED_ARR: [
        chatThreadStatusCodeAll,
        chatThreadStatusCodeOpen,
         chatThreadStatusCodeClosed
    ],

    APP_NOTIFICATION_MODULE_CODE_CHAT : 'CHAT',
    APP_NOTIFICATION_ACTION_CODE_NOTIF : 'NOTIF',
    APP_NOTIFICATION_LIMIT : 20,


    CONSORTIUM_JOB_TYPE_APPOINTMENT : 'APT',


    REPORT_COLUMN_CONSORTIUM_TEXT : 'Consortium',
    REPORT_COLUMN_CONSORTIUM_ID : 1,

    REPORT_COLUMN_LOCATION_TEXT : 'Location',
    REPORT_COLUMN_LOCATION_ID : 2,

    REPORT_COLUMN_PROVIDER_TEXT : 'Provider',
    REPORT_COLUMN_PROVIDER_ID : 3,

    REPORT_COLUMN_APPOINTMENT_DATE_TEXT : 'Apt Date',
    REPORT_COLUMN_APPOINTMENT_DATE_ID : 4,

    REPORT_COLUMN_PROCESSING_DATE_TEXT : 'Processing Date',
    REPORT_COLUMN_PROCESSING_DATE_ID : 5,


    REPORT_COLUMN_APPOINTMENT_ID_TEXT : 'Apt ID',
    REPORT_COLUMN_APPOINTMENT_ID_ID : 6,

    REPORT_COLUMN_AUDIO_LENGTH_TEXT : 'Audio Length',
    REPORT_COLUMN_AUDIO_LENGTH_ID : 7,

    REPORT_COLUMN_PATIENT_NAME_TEXT : 'Patient Name',
    REPORT_COLUMN_PATIENT_NAME_ID : 8,

    REPORT_COLUMN_SCRIBE_TEXT : 'Scribe',
    REPORT_COLUMN_SCRIBE_ID : 9,

    REPORT_COLUMN_FIRST_CHECK_TEXT : 'First Check',
    REPORT_COLUMN_FIRST_CHECK_ID : 10,

    REPORT_COLUMN_SECOND_CHECK_TEXT : 'Second Check',
    REPORT_COLUMN_SECOND_CHECK_ID : 11,

    REPORT_COLUMN_FINAL_CHECK_TEXT : 'Final Check',
    REPORT_COLUMN_FINAL_CHECK_ID : 12,


  

    PRODUCTIVITY_REPORT : 'PRODUCTIVITY_REPORT',
    DATE_REPORT : 'DATE_REPORT',
    PROVIDER_REPORT : 'PROVIDER_REPORT',
    USER_REPORT : 'USER_REPORT',
    MY_REPORT : 'MY_REPORT',


}
