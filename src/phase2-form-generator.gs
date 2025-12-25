/**
 * SmartHire AI - Phase 2: Dynamic Google Form Generator
 * Created by: Smrutimanjari Jena
 * 
 * This script automatically creates Google Forms based on questions
 * listed in a spreadsheet. Eliminates manual form creation for each position.
 */

// ============================================
// CONFIGURATION
// ============================================

const FORM_SHEET_NAME = 'Interview Questions';
const JD_SHEET_NAME = 'Job Descriptions';

// ============================================
// MENU CREATION
// ============================================

/**
 * Adds Phase 2 menu items to the existing SmartHire AI menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 SmartHire AI')
    // Phase 1 items
    .addItem('✨ Generate Job Description', 'generateJobDescription')
    .addSeparator()
    .addItem('📋 Clear Generated JD', 'clearJobDescription')
    .addSeparator()
    // Phase 2 items (NEW)
    .addSubMenu(ui.createMenu('📝 Form Generator')
      .addItem('🎯 Create Interview Form', 'createInterviewForm')
      .addItem('📊 View Form Responses', 'viewFormResponses')
      .addItem('🗑️ Delete Form', 'deleteForm'))
    .addSeparator()
    .addItem('⚙️ Setup Instructions', 'showSetupInstructions')
    .addToUi();
}

// ============================================
// MAIN FUNCTION: CREATE GOOGLE FORM
// ============================================

/**
 * Creates a Google Form based on questions in the spreadsheet
 */
function createInterviewForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName(FORM_SHEET_NAME);
  const jdSheet = ss.getSheetByName(JD_SHEET_NAME);
  const ui = SpreadsheetApp.getUi();
  
  // Validate sheet exists
  if (!formSheet) {
    ui.alert('⚠️ Setup Required', 
             'Please run the setup function first to create the "Interview Questions" sheet.',
             ui.ButtonSet.OK);
    return;
  }
  
  try {
    // Show loading message
    ui.alert('📝 Creating Form...', 
             'Generating Google Form from your questions.\nThis may take 10-20 seconds.', 
             ui.ButtonSet.OK);
    
    // Get job title for form name
    const jobTitle = jdSheet.getRange('B3').getValue() || 'Position';
    const formTitle = `${jobTitle} - Interview Application`;
    
    // Create new form
    const form = FormApp.create(formTitle);
    form.setDescription(`Application form for ${jobTitle} position. Please answer all questions thoroughly.`);
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(true);
    form.setShowLinkToRespondAgain(false);
    
    // Get questions from sheet (starting from row 3)
    const lastRow = formSheet.getLastRow();
    let questionCount = 0;
    
    for (let i = 3; i <= lastRow; i++) {
      const questionText = formSheet.getRange(i, 2).getValue(); // Column B
      const questionType = formSheet.getRange(i, 3).getValue(); // Column C
      const options = formSheet.getRange(i, 4).getValue();      // Column D
      const required = formSheet.getRange(i, 5).getValue();     // Column E
      
      // Skip empty rows
      if (!questionText) continue;
      
      // Create question based on type
      let item;
      
      switch(questionType.toLowerCase()) {
        case 'short answer':
        case 'text':
          item = form.addTextItem();
          item.setTitle(questionText);
          if (required === 'Yes' || required === 'TRUE') {
            item.setRequired(true);
          }
          break;
          
        case 'paragraph':
        case 'long answer':
          item = form.addParagraphTextItem();
          item.setTitle(questionText);
          if (required === 'Yes' || required === 'TRUE') {
            item.setRequired(true);
          }
          break;
          
        case 'multiple choice':
          item = form.addMultipleChoiceItem();
          item.setTitle(questionText);
          if (options) {
            const optionsList = options.split(',').map(opt => opt.trim());
            item.setChoiceValues(optionsList);
          }
          if (required === 'Yes' || required === 'TRUE') {
            item.setRequired(true);
          }
          break;
          
        case 'checkboxes':
          item = form.addCheckboxItem();
          item.setTitle(questionText);
          if (options) {
            const optionsList = options.split(',').map(opt => opt.trim());
            item.setChoiceValues(optionsList);
          }
          if (required === 'Yes' || required === 'TRUE') {
            item.setRequired(true);
          }
          break;
          
        case 'dropdown':
          item = form.addListItem();
          item.setTitle(questionText);
          if (options) {
            const optionsList = options.split(',').map(opt => opt.trim());
            item.setChoiceValues(optionsList);
          }
          if (required === 'Yes' || required === 'TRUE') {
            item.setRequired(true);
          }
          break;
          
        case 'scale':
        case 'linear scale':
          item = form.addScaleItem();
          item.setTitle(questionText);
          item.setBounds(1, 5); // Default 1-5 scale
          if (required === 'Yes' || required === 'TRUE') {
            item.setRequired(true);
          }
          break;
          
        case 'date':
          item = form.addDateItem();
          item.setTitle(questionText);
          if (required === 'Yes' || required === 'TRUE') {
            item.setRequired(true);
          }
          break;
          
        default:
          // Default to short answer if type not recognized
          item = form.addTextItem();
          item.setTitle(questionText);
          if (required === 'Yes' || required === 'TRUE') {
            item.setRequired(true);
          }
      }
      
      questionCount++;
    }
    
    // Link responses to a new sheet
    const responseSheet = ss.insertSheet(`${jobTitle} - Responses`);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    
    // Store form URL in the original sheet
    const formUrl = form.getPublishedUrl();
    const editUrl = form.getEditUrl();
    
    formSheet.getRange('B' + (lastRow + 3)).setValue('Form Created:');
    formSheet.getRange('C' + (lastRow + 3)).setValue(formUrl);
    formSheet.getRange('B' + (lastRow + 4)).setValue('Edit Form:');
    formSheet.getRange('C' + (lastRow + 4)).setValue(editUrl);
    formSheet.getRange('B' + (lastRow + 5)).setValue('Created At:');
    formSheet.getRange('C' + (lastRow + 5)).setValue(new Date().toLocaleString());
    
    // Success message
    ui.alert('✅ Form Created Successfully!', 
             `Google Form created with ${questionCount} questions!\n\n` +
             `Form URL: ${formUrl}\n\n` +
             `The link has been added to your sheet. Share it with candidates!`,
             ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('❌ Error', 
             'Failed to create form.\n\nError: ' + error.message, 
             ui.ButtonSet.OK);
    Logger.log('Error: ' + error.message);
  }
}

// ============================================
// VIEW FORM RESPONSES
// ============================================

/**
 * Opens the form responses in a new tab
 */
function viewFormResponses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  // Find response sheet
  const sheets = ss.getSheets();
  const responseSheet = sheets.find(sheet => sheet.getName().includes('Responses'));
  
  if (!responseSheet) {
    ui.alert('ℹ️ No Responses Yet', 
             'No form responses found. Create a form first and collect responses.',
             ui.ButtonSet.OK);
    return;
  }
  
  // Activate the responses sheet
  ss.setActiveSheet(responseSheet);
  ui.alert('✅ Response Sheet Active', 
           'You can now view all form responses in this sheet.',
           ui.ButtonSet.OK);
}

// ============================================
// DELETE FORM
// ============================================

/**
 * Deletes the created form (cleanup)
 */
function deleteForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName(FORM_SHEET_NAME);
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert('⚠️ Delete Form?', 
                            'This will permanently delete the Google Form.\n\nAre you sure?', 
                            ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    try {
      // Get form URL from sheet
      const lastRow = formSheet.getLastRow();
      const editUrl = formSheet.getRange('C' + (lastRow - 1)).getValue();
      
      if (!editUrl) {
        ui.alert('ℹ️ No Form Found', 
                 'No form URL found in the sheet.',
                 ui.ButtonSet.OK);
        return;
      }
      
      // Extract form ID from edit URL
      const formId = extractFormId(editUrl);
      
      if (formId) {
        // Delete the form
        DriveApp.getFileById(formId).setTrashed(true);
        
        // Clear form URLs from sheet
        formSheet.getRange('B' + (lastRow - 2) + ':C' + lastRow).clearContent();
        
        ui.alert('✅ Form Deleted', 
                 'The Google Form has been deleted successfully.',
                 ui.ButtonSet.OK);
      }
      
    } catch (error) {
      ui.alert('❌ Error', 
               'Failed to delete form.\n\nError: ' + error.message, 
               ui.ButtonSet.OK);
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Extracts form ID from edit URL
 */
function extractFormId(url) {
  const match = url.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// ============================================
// SETUP FUNCTION FOR PHASE 2
// ============================================

/**
 * Creates the Interview Questions sheet structure
 */
function setupPhase2Sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(FORM_SHEET_NAME);
  
  // Create sheet if doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(FORM_SHEET_NAME);
  }
  
  // Clear existing content
  sheet.clear();
  
  // Set column widths
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 500);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 300);
  sheet.setColumnWidth(5, 100);
  
  // Title
  sheet.getRange('A1:E1').merge();
  sheet.getRange('A1')
    .setValue('📝 SmartHire AI - Interview Questions')
    .setFontSize(16)
    .setFontWeight('bold')
    .setBackground('#34A853')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  
  // Header row
  sheet.getRange('A2').setValue('#').setFontWeight('bold').setBackground('#E8F0FE');
  sheet.getRange('B2').setValue('Question').setFontWeight('bold').setBackground('#E8F0FE');
  sheet.getRange('C2').setValue('Type').setFontWeight('bold').setBackground('#E8F0FE');
  sheet.getRange('D2').setValue('Options (comma-separated)').setFontWeight('bold').setBackground('#E8F0FE');
  sheet.getRange('E2').setValue('Required?').setFontWeight('bold').setBackground('#E8F0FE');
  
  // Sample questions
  const sampleQuestions = [
    [1, 'What is your full name?', 'Short Answer', '', 'Yes'],
    [2, 'What is your email address?', 'Short Answer', '', 'Yes'],
    [3, 'What is your phone number?', 'Short Answer', '', 'Yes'],
    [4, 'Years of experience in this field?', 'Multiple Choice', '0-2, 3-5, 6-10, 10+', 'Yes'],
    [5, 'Why are you interested in this position?', 'Paragraph', '', 'Yes'],
    [6, 'What is your current salary expectation?', 'Short Answer', '', 'Yes'],
    [7, 'What technologies are you proficient in?', 'Checkboxes', 'Python, Java, JavaScript, React, Node.js, AWS', 'Yes'],
    [8, 'When can you start?', 'Multiple Choice', 'Immediately, 2 weeks, 1 month, 2 months', 'Yes'],
    [9, 'Rate your English communication skills', 'Linear Scale', '', 'Yes'],
    [10, 'Tell us about your most significant project', 'Paragraph', '', 'Yes']
  ];
  
  for (let i = 0; i < sampleQuestions.length; i++) {
    const row = i + 3;
    sheet.getRange(row, 1, 1, 5).setValues([sampleQuestions[i]]);
  }
  
  // Instructions
  sheet.getRange('A14').setValue('📌 INSTRUCTIONS:').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A15').setValue(
    '1. Customize the questions above\n' +
    '2. Add/remove rows as needed\n' +
    '3. Choose question type from dropdown\n' +
    '4. Go to: SmartHire AI > Form Generator > Create Interview Form\n' +
    '5. Share the generated form link with candidates!'
  ).setWrap(true);
  
  // Data validation for Type column
  const typeRange = sheet.getRange('C3:C100');
  const typeValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Short Answer',
      'Paragraph', 
      'Multiple Choice',
      'Checkboxes',
      'Dropdown',
      'Linear Scale',
      'Date'
    ], true)
    .setAllowInvalid(false)
    .build();
  typeRange.setDataValidation(typeValidation);
  
  // Data validation for Required column
  const requiredRange = sheet.getRange('E3:E100');
  const requiredValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'No'], true)
    .setAllowInvalid(false)
    .build();
  requiredRange.setDataValidation(requiredValidation);
  
  SpreadsheetApp.getUi().alert('✅ Phase 2 Setup Complete!', 
    'Interview Questions sheet created!\n\n' +
    'Next steps:\n' +
    '1. Customize the questions\n' +
    '2. Click: SmartHire AI > Form Generator > Create Interview Form',
    SpreadsheetApp.getUi().ButtonSet.OK);
}
