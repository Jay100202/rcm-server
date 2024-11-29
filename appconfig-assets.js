const fontsFolderBasePath = '/var/www/ana-backend/public/assets/pdfGenerationFonts/';
const plainFontsFolderBasePath = fontsFolderBasePath + 'English/';
const englishFontsFolderBasePath = fontsFolderBasePath + 'English/';

const projectFolderBasePath = '/var/www/ana-backend/';
const projectFolderTempUploadsPath = projectFolderBasePath + 'public/uploads/tempUploads/';
const tempUploadReportsBasePath = projectFolderTempUploadsPath + "reports/";
const tempUploadConsortiumUserTemplateBulkDownloadBasePath = projectFolderTempUploadsPath + "consortiumUserTemplateBulkDownload/";
const tempUploadConsortiumUserSampleBulkDownloadBasePath = projectFolderTempUploadsPath + "consortiumUserSampleBulkDownload/";

const tempUploadConsortiumUserTemplateBulkDownloadableUrlFolderPath = 'uploads/tempUploads/consortiumUserTemplateBulkDownload/';
const tempUploadConsortiumUserSampleBulkDownloadableUrlFolderPath = 'uploads/tempUploads/consortiumUserSampleBulkDownload/';

module.exports = {
    
    FONTS_FOLDER_BASE_PATH : fontsFolderBasePath,
    PLAIN_FONTS_FOLDER_BASE_PATH : plainFontsFolderBasePath,
    ENGLISH_FONTS_FOLDER_BASE_PATH : englishFontsFolderBasePath,


    PROJECT_FOLDER_BASE_PATH : projectFolderBasePath,
    PROJECT_FOLDER_TEMP_UPLOADS_BASE_PATH : projectFolderTempUploadsPath,
    TEMP_UPLOADS_REPORTS_BASE_PATH : tempUploadReportsBasePath,
    TEMP_UPLOADS_CONSORTIUM_USER_TEMPLATE_BULK_DOWNLOAD_BASE_PATH : tempUploadConsortiumUserTemplateBulkDownloadBasePath,
    TEMP_UPLOADS_CONSORTIUM_USER_SAMPLE_BULK_DOWNLOAD_BASE_PATH : tempUploadConsortiumUserSampleBulkDownloadBasePath,

    TEMP_UPLOADS_CONSORTIUM_USER_TEMPLATE_BULK_DOWNLOADABLE_URL_FOLDER_PATH : tempUploadConsortiumUserTemplateBulkDownloadableUrlFolderPath,
    TEMP_UPLOADS_CONSORTIUM_USER_SAMPLE_BULK_DOWNLOADABLE_URL_FOLDER_PATH : tempUploadConsortiumUserSampleBulkDownloadableUrlFolderPath,

}