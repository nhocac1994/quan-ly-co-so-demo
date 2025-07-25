// Google Apps Script để ghi dữ liệu vào Google Sheets
// Deploy script này và lấy URL để sử dụng

function doPost(e) {
  try {
    // Parse request data
    const data = JSON.parse(e.postData.contents);
    const { action, spreadsheetId, sheetName, values } = data;
    
    if (action === 'writeSheet') {
      // Mở spreadsheet
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      
      // Lấy sheet hoặc tạo mới
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
      }
      
      // Xóa dữ liệu cũ
      sheet.clear();
      
      // Ghi dữ liệu mới
      if (values && values.length > 0) {
        sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
      }
      
      // Trả về kết quả thành công
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Ghi dữ liệu thành công' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Action không hợp lệ' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Google Apps Script đang hoạt động' }))
    .setMimeType(ContentService.MimeType.JSON);
} 