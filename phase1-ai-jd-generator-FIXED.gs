/**
 * SmartHire AI - Phase 1: AI Job Description Generator (CORRECTED)
 * Fixed row references to match actual sheet structure
 */

// ============================================
// CONFIGURATION
// ============================================

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE';
const JD_SHEET_NAME = 'Job Descriptions';

// ============================================
// MENU CREATION
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 SmartHire AI')
    .addItem('✨ Generate Job Description', 'generateJobDescription')
    .addSeparator()
    .addItem('📋 Clear Generated JD', 'clearJobDescription')
    .addItem('⚙️ Setup Instructions', 'showSetupInstructions')
    .addToUi();
}

// ============================================
// MAIN FUNCTION: GENERATE JOB DESCRIPTION
// ============================================

function generateJobDescription() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(JD_SHEET_NAME);
  const ui = SpreadsheetApp.getUi();
  
  // Validate API key
  if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    ui.alert('⚠️ Setup Required', 
             'Please add your OpenAI API key in the script.\n\n' +
             'Go to: Extensions > Apps Script > Update OPENAI_API_KEY',
             ui.ButtonSet.OK);
    return;
  }
  
  try {
    // Show loading message
    ui.alert('🤖 AI Processing...', 
             'Generating professional job description.\nThis may take 10-15 seconds.', 
             ui.ButtonSet.OK);
    
    // ✅ CORRECTED: Get input values from correct rows
    const jobTitle = sheet.getRange('B3').getValue();           // Row 3
    const department = sheet.getRange('B4').getValue();         // Row 4
    const experienceLevel = sheet.getRange('B5').getValue();    // Row 5
    const employmentType = sheet.getRange('B6').getValue();     // Row 6
    const location = sheet.getRange('B7').getValue();           // Row 7
    const keySkills = sheet.getRange('B8').getValue();          // Row 8
    const educationRequired = sheet.getRange('B9').getValue();  // Row 9
    const additionalRequirements = sheet.getRange('B10').getValue(); // Row 10
    
    // Log values for debugging
    Logger.log('Job Title: ' + jobTitle);
    Logger.log('Department: ' + department);
    Logger.log('Experience Level: ' + experienceLevel);
    
    // Validate required fields
    if (!jobTitle || !department || !experienceLevel) {
      ui.alert('⚠️ Missing Information', 
               'Please fill in at least:\n• Job Title (B3)\n• Department (B4)\n• Experience Level (B5)', 
               ui.ButtonSet.OK);
      return;
    }
    
    // Build prompt for OpenAI
    const prompt = buildJobDescriptionPrompt(
      jobTitle, 
      department, 
      experienceLevel, 
      employmentType,
      location,
      keySkills, 
      educationRequired, 
      additionalRequirements
    );
    
    // Call OpenAI API
    const jobDescription = callOpenAI(prompt);
    
    // Write generated JD to sheet (row 12)
    sheet.getRange('B12').setValue(jobDescription);
    
    // Add timestamp (row 13)
    const timestamp = new Date().toLocaleString();
    sheet.getRange('B13').setValue(timestamp);
    
    // Success message
    ui.alert('✅ Success!', 
             'Job description generated successfully!\n\nScroll down to see the result in row 12.', 
             ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('❌ Error', 
             'Failed to generate job description.\n\nError: ' + error.message, 
             ui.ButtonSet.OK);
    Logger.log('Error: ' + error.message);
  }
}

// ============================================
// OPENAI API INTEGRATION
// ============================================

function callOpenAI(prompt) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an expert HR professional and recruitment specialist. Generate professional, compelling job descriptions that attract top talent.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + OPENAI_API_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  if (responseCode !== 200) {
    throw new Error('OpenAI API Error: ' + responseText);
  }
  
  const result = JSON.parse(responseText);
  return result.choices[0].message.content.trim();
}

// ============================================
// PROMPT BUILDING
// ============================================

function buildJobDescriptionPrompt(jobTitle, department, experienceLevel, employmentType, location, keySkills, education, additionalReqs) {
  let prompt = `Create a professional and compelling job description for the following position:\n\n`;
  
  prompt += `Job Title: ${jobTitle}\n`;
  prompt += `Department: ${department}\n`;
  prompt += `Experience Level: ${experienceLevel}\n`;
  
  if (employmentType) prompt += `Employment Type: ${employmentType}\n`;
  if (location) prompt += `Location: ${location}\n`;
  if (keySkills) prompt += `Key Skills Required: ${keySkills}\n`;
  if (education) prompt += `Education: ${education}\n`;
  if (additionalReqs) prompt += `Additional Requirements: ${additionalReqs}\n`;
  
  prompt += `\nPlease structure the job description with the following sections:\n`;
  prompt += `1. Job Overview (2-3 sentences about the role)\n`;
  prompt += `2. Key Responsibilities (5-7 bullet points)\n`;
  prompt += `3. Required Qualifications (4-6 bullet points)\n`;
  prompt += `4. Preferred Qualifications (3-4 bullet points)\n`;
  prompt += `5. What We Offer (3-4 bullet points)\n\n`;
  prompt += `Make it engaging, professional, and attractive to top candidates. Use clear, action-oriented language.`;
  
  return prompt;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function clearJobDescription() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(JD_SHEET_NAME);
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert('Clear Job Description?', 
                            'This will delete the generated job description.\n\nAre you sure?', 
                            ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    sheet.getRange('B12').clearContent();
    sheet.getRange('B13').clearContent();
    ui.alert('✅ Cleared', 'Job description has been cleared.', ui.ButtonSet.OK);
  }
}

function showSetupInstructions() {
  const ui = SpreadsheetApp.getUi();
  
  const instructions = `📋 SETUP INSTRUCTIONS\n\n` +
    `1. Get OpenAI API Key:\n` +
    `   • Go to: https://platform.openai.com/api-keys\n` +
    `   • Sign up/Login\n` +
    `   • Create new API key\n` +
    `   • Copy the key\n\n` +
    `2. Add API Key to Script:\n` +
    `   • Go to: Extensions > Apps Script\n` +
    `   • Find line: const OPENAI_API_KEY = '...'\n` +
    `   • Replace with your key\n` +
    `   • Save (Ctrl+S)\n\n` +
    `3. Use the Tool:\n` +
    `   • Fill in job details (rows 3-10)\n` +
    `   • Click: SmartHire AI > Generate Job Description\n` +
    `   • Wait 10-15 seconds\n` +
    `   • JD appears in row 12!\n\n` +
    `💡 Tip: You get $5 free credits from OpenAI!`;
  
  ui.alert('Setup Instructions', instructions, ui.ButtonSet.OK);
}
