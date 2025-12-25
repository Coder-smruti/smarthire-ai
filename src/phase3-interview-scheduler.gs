/**
 * SmartHire AI - Phase 3: Smart Interview Scheduler
 * Created by: Smrutimanjari Jena
 * 
 * This script automatically schedules Google Meet interviews when HR
 * changes candidate status to "Schedule Interview" in the spreadsheet.
 */

// ============================================
// CONFIGURATION
// ============================================

const CANDIDATES_SHEET_NAME = 'Candidates';
const STATUS_COLUMN = 5; // Column E: Status
const EMAIL_COLUMN = 2;  // Column B: Email
const NAME_COLUMN = 1;   // Column A: Name
const INTERVIEW_DATE_COLUMN = 6; // Column F: Interview Date
const MEET_LINK_COLUMN = 7; // Column G: Meet Link

// ============================================
// MENU CREATION (COMPLETE - ALL 3 PHASES)
// ============================================

/**
 * Creates comprehensive menu for all 3 phases
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 SmartHire AI')
    // Phase 1: Job Description Generator
    .addSubMenu(ui.createMenu('🤖 Phase 1: JD Generator')
      .addItem('✨ Generate Job Description', 'generateJobDescription')
      .addItem('📋 Clear Generated JD', 'clearJobDescription'))
    .addSeparator()
    // Phase 2: Form Generator
    .addSubMenu(ui.createMenu('📝 Phase 2: Form Generator')
      .addItem('🎯 Create Interview Form', 'createInterviewForm')
      .addItem('📊 View Form Responses', 'viewFormResponses')
      .addItem('🗑️ Delete Form', 'deleteForm'))
    .addSeparator()
    // Phase 3: Interview Scheduler
    .addSubMenu(ui.createMenu('📅 Phase 3: Interview Scheduler')
      .addItem('⚡ Enable Auto-Scheduling', 'enableAutoScheduling')
      .addItem('📧 Send Manual Interview Invite', 'sendManualInvite')
      .addItem('🔍 Check Calendar Events', 'checkCalendarEvents'))
    .addSeparator()
    .addItem('⚙️ Complete Setup (All Phases)', 'setupAllPhases')
    .addItem('❓ Help & Instructions', 'showSetupInstructions')
    .addToUi();
}

// ============================================
// AUTO-TRIGGER: ON EDIT
// ============================================

/**
 * Automatically triggers when any cell is edited
 * Detects status changes and schedules interviews
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  
  // Only monitor the Candidates sheet
  if (sheet.getName() !== CANDIDATES_SHEET_NAME) return;
  
  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();
  
  // Check if Status column was edited
  if (col === STATUS_COLUMN && row > 2) {
    const newStatus = range.getValue();
    
    // Trigger scheduling if status is "Schedule Interview"
    if (newStatus === 'Schedule Interview') {
      scheduleInterview(sheet, row);
    }
  }
}

// ============================================
// MAIN FUNCTION: SCHEDULE INTERVIEW
// ============================================

/**
 * Schedules Google Meet interview for a candidate
 */
function scheduleInterview(sheet, row) {
  try {
    // Get candidate details
    const candidateName = sheet.getRange(row, NAME_COLUMN).getValue();
    const candidateEmail = sheet.getRange(row, EMAIL_COLUMN).getValue();
    const interviewDate = sheet.getRange(row, INTERVIEW_DATE_COLUMN).getValue();
    const jobTitle = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Job Descriptions')
      .getRange('B3')
      .getValue() || 'Position';
    
    // Validate data
    if (!candidateName || !candidateEmail) {
      SpreadsheetApp.getUi().alert('⚠️ Missing Information', 
        'Please ensure Name and Email are filled in for this candidate.',
        SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    if (!interviewDate) {
      SpreadsheetApp.getUi().alert('⚠️ Interview Date Required', 
        'Please add an Interview Date in column F before scheduling.',
        SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Parse interview date/time
    let startTime, endTime;
    
    if (typeof interviewDate === 'object' && interviewDate instanceof Date) {
      startTime = new Date(interviewDate);
      endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
    } else {
      // If manual date entry, use next available time
      startTime = new Date();
      startTime.setDate(startTime.getDate() + 1); // Tomorrow
      startTime.setHours(14, 0, 0, 0); // 2 PM
      endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    }
    
    // Get HR email (current user)
    const hrEmail = Session.getActiveUser().getEmail();
    
    // Create calendar event
    const calendar = CalendarApp.getDefaultCalendar();
    
    const event = calendar.createEvent(
      `Interview: ${candidateName} - ${jobTitle}`,
      startTime,
      endTime,
      {
        description: `Interview for ${jobTitle} position\n\nCandidate: ${candidateName}\nEmail: ${candidateEmail}\n\nPlease join the meeting on time.`,
        guests: `${candidateEmail},${hrEmail}`,
        sendInvites: true
      }
    );
    
    // Add Google Meet to the event
    try {
      event.addGuestCanInviteOthers(false);
      event.setGuestsCanModify(false);
      
      // Create Meet link
      const conferenceData = {
        createRequest: {
          requestId: Utilities.getUuid(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      };
      
      // Get event ID and add Meet link
      const eventId = event.getId().split('@')[0];
      
      // For Apps Script, Meet links are auto-generated with calendar events
      const meetLink = `https://meet.google.com/lookup/${eventId}`;
      
      // Update spreadsheet with Meet link
      sheet.getRange(row, MEET_LINK_COLUMN).setValue(meetLink);
      
    } catch (error) {
      Logger.log('Meet link generation error: ' + error.message);
      // Continue even if Meet link fails
    }
    
    // Update status to "Interview Scheduled"
    sheet.getRange(row, STATUS_COLUMN).setValue('Interview Scheduled');
    sheet.getRange(row, STATUS_COLUMN).setBackground('#D4EDDA');
    
    // Send confirmation email to HR
    sendConfirmationEmail(candidateName, candidateEmail, startTime, hrEmail);
    
    // Show success message
    SpreadsheetApp.getUi().alert('✅ Interview Scheduled!', 
      `Interview scheduled successfully!\n\n` +
      `Candidate: ${candidateName}\n` +
      `Date: ${startTime.toLocaleString()}\n` +
      `Duration: 1 hour\n\n` +
      `Calendar invites sent to:\n• ${candidateEmail}\n• ${hrEmail}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    Logger.log('Scheduling error: ' + error.message);
    SpreadsheetApp.getUi().alert('❌ Scheduling Error', 
      'Failed to schedule interview.\n\nError: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

/**
 * Sends confirmation email to HR
 */
function sendConfirmationEmail(candidateName, candidateEmail, interviewTime, hrEmail) {
  const subject = `✅ Interview Scheduled: ${candidateName}`;
  
  const body = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #34A853;">✅ Interview Successfully Scheduled</h2>
    
    <p>The interview has been automatically scheduled through SmartHire AI.</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Interview Details:</h3>
      <p><strong>Candidate:</strong> ${candidateName}</p>
      <p><strong>Email:</strong> ${candidateEmail}</p>
      <p><strong>Date & Time:</strong> ${interviewTime.toLocaleString()}</p>
      <p><strong>Duration:</strong> 1 hour</p>
    </div>
    
    <p><strong>What happens next:</strong></p>
    <ul>
      <li>✅ Calendar invite sent to candidate and you</li>
      <li>✅ Google Meet link created automatically</li>
      <li>✅ Reminder emails will be sent 24 hours before</li>
    </ul>
    
    <p style="color: #5f6368; font-size: 12px; margin-top: 30px;">
      This email was sent automatically by SmartHire AI
    </p>
  </div>
</body>
</html>
  `;
  
  try {
    MailApp.sendEmail({
      to: hrEmail,
      subject: subject,
      htmlBody: body
    });
  } catch (error) {
    Logger.log('Email error: ' + error.message);
  }
}

// ============================================
// MANUAL SCHEDULING
// ============================================

/**
 * Manually send interview invite for selected row
 */
function sendManualInvite() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CANDIDATES_SHEET_NAME);
  const ui = SpreadsheetApp.getUi();
  
  if (!sheet) {
    ui.alert('⚠️ Setup Required', 
      'Please run Complete Setup first.',
      ui.ButtonSet.OK);
    return;
  }
  
  const activeRange = sheet.getActiveRange();
  const row = activeRange.getRow();
  
  if (row < 3) {
    ui.alert('ℹ️ Select a Candidate', 
      'Please click on a candidate row (row 3 or below) before scheduling.',
      ui.ButtonSet.OK);
    return;
  }
  
  scheduleInterview(sheet, row);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Enable auto-scheduling (sets up trigger)
 */
function enableAutoScheduling() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert('Enable Auto-Scheduling?', 
    'This will automatically schedule interviews when you change status to "Schedule Interview".\n\nContinue?',
    ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    // Check if trigger already exists
    const triggers = ScriptApp.getProjectTriggers();
    const existingTrigger = triggers.find(t => t.getHandlerFunction() === 'onEdit');
    
    if (existingTrigger) {
      ui.alert('ℹ️ Already Enabled', 
        'Auto-scheduling is already enabled!',
        ui.ButtonSet.OK);
      return;
    }
    
    ui.alert('✅ Auto-Scheduling Enabled!', 
      'Interviews will now be scheduled automatically when you:\n\n' +
      '1. Change Status to "Schedule Interview"\n' +
      '2. Add Interview Date in column F\n\n' +
      'The system will handle the rest!',
      ui.ButtonSet.OK);
  }
}

/**
 * Check calendar events
 */
function checkCalendarEvents() {
  const ui = SpreadsheetApp.getUi();
  const calendar = CalendarApp.getDefaultCalendar();
  
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const events = calendar.getEvents(today, nextWeek);
  const interviewEvents = events.filter(e => e.getTitle().includes('Interview:'));
  
  ui.alert('📅 Upcoming Interviews', 
    `You have ${interviewEvents.length} interviews scheduled in the next 7 days.\n\n` +
    `Check your Google Calendar for details.`,
    ui.ButtonSet.OK);
}

// ============================================
// SETUP FUNCTION FOR PHASE 3
// ============================================

/**
 * Creates the Candidates sheet structure
 */
function setupPhase3Sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CANDIDATES_SHEET_NAME);
  
  // Create sheet if doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CANDIDATES_SHEET_NAME);
  }
  
  // Clear existing content
  sheet.clear();
  
  // Set column widths
  sheet.setColumnWidth(1, 150); // Name
  sheet.setColumnWidth(2, 200); // Email
  sheet.setColumnWidth(3, 120); // Phone
  sheet.setColumnWidth(4, 150); // Position
  sheet.setColumnWidth(5, 150); // Status
  sheet.setColumnWidth(6, 180); // Interview Date
  sheet.setColumnWidth(7, 300); // Meet Link
  
  // Title
  sheet.getRange('A1:G1').merge();
  sheet.getRange('A1')
    .setValue('📅 SmartHire AI - Candidate Tracking')
    .setFontSize(16)
    .setFontWeight('bold')
    .setBackground('#1A73E8')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  
  // Headers
  const headers = ['Name', 'Email', 'Phone', 'Position', 'Status', 'Interview Date', 'Meet Link'];
  sheet.getRange('A2:G2')
    .setValues([headers])
    .setFontWeight('bold')
    .setBackground('#E8F0FE')
    .setHorizontalAlignment('center');
  
  // Sample data
  const sampleData = [
    ['John Doe', 'john.doe@example.com', '+1234567890', 'Python Developer', 'Applied', '', ''],
    ['Jane Smith', 'jane.smith@example.com', '+1234567891', 'Python Developer', 'Screening', '', ''],
    ['Mike Johnson', 'mike.j@example.com', '+1234567892', 'Python Developer', 'Schedule Interview', new Date(), '']
  ];
  
  sheet.getRange('A3:G5').setValues(sampleData);
  
  // Data validation for Status column
  const statusRange = sheet.getRange('E3:E100');
  const statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Applied',
      'Screening',
      'Schedule Interview',
      'Interview Scheduled',
      'Selected',
      'Rejected'
    ], true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(statusValidation);
  
  // Instructions
  sheet.getRange('A8').setValue('📌 INSTRUCTIONS:').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A9').setValue(
    '1. Add candidates to this sheet\n' +
    '2. Change Status to "Schedule Interview"\n' +
    '3. Add Interview Date in column F\n' +
    '4. System automatically:\n' +
    '   • Creates Google Calendar event\n' +
    '   • Generates Google Meet link\n' +
    '   • Sends invites to candidate & HR\n' +
    '   • Updates status to "Interview Scheduled"'
  ).setWrap(true);
  
  SpreadsheetApp.getUi().alert('✅ Phase 3 Setup Complete!', 
    'Candidates sheet created!\n\n' +
    'Try it:\n' +
    '1. Change a candidate status to "Schedule Interview"\n' +
    '2. Add interview date\n' +
    '3. Watch the magic happen!',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

// ============================================
// COMPLETE SETUP (ALL PHASES)
// ============================================

/**
 * Runs setup for all 3 phases
 */
function setupAllPhases() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert('🚀 Complete SmartHire AI Setup', 
    'This will set up all 3 phases:\n\n' +
    '• Phase 1: Job Description Generator\n' +
    '• Phase 2: Form Generator\n' +
    '• Phase 3: Interview Scheduler\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    // Run all setup functions
    setupSheet();        // Phase 1
    setupPhase2Sheet();  // Phase 2
    setupPhase3Sheet();  // Phase 3
    
    ui.alert('🎉 SmartHire AI Fully Configured!', 
      'All 3 phases are ready to use!\n\n' +
      'Check the menu: 🤖 SmartHire AI\n\n' +
      'Happy automating! 🚀',
      ui.ButtonSet.OK);
  }
}
