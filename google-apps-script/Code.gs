/**
 * Harrison Dessoy Fan Club Form Handler
 * This script processes form submissions, saves them to Google Sheets,
 * and sends email notifications.
 */

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  // Your email address to receive notifications
  ADMIN_EMAIL: 'your-email@example.com',

  // Sheet name where submissions will be saved
  SHEET_NAME: 'Fan Club Submissions',

  // Email subject for admin notifications
  ADMIN_SUBJECT: 'New Fan Club Signup - Harrison Dessoy',

  // Email subject for user confirmation
  USER_SUBJECT: 'Welcome to Harrison Dessoy Fan Club!',

  // Website URL for confirmation email
  WEBSITE_URL: 'https://yourdomain.com'
};

/**
 * Main function to handle POST requests from the form
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.name || !data.email) {
      return createResponse(false, 'Name and email are required fields');
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      return createResponse(false, 'Invalid email address');
    }

    // Save to Google Sheet
    saveToSheet(data);

    // Send notification email to admin
    sendAdminNotification(data);

    // Send confirmation email to user
    sendUserConfirmation(data);

    // Return success response
    return createResponse(true, 'Thank you for joining the Harrison Dessoy Fan Club!');

  } catch (error) {
    Logger.log('Error processing form: ' + error.toString());
    return createResponse(false, 'An error occurred while processing your submission');
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput('Harrison Dessoy Fan Club Form Handler is active. Use POST to submit data.');
}

/**
 * Save form data to Google Sheet
 */
function saveToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    // Add headers
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Country', 'Message', 'IP Address', 'User Agent']);
    sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  // Add new row with form data
  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.country || '',
    data.message || '',
    data.ip || 'N/A',
    data.userAgent || 'N/A'
  ]);

  // Auto-resize columns for better readability
  sheet.autoResizeColumns(1, 7);
}

/**
 * Send notification email to admin
 */
function sendAdminNotification(data) {
  const emailBody = `
    <h2>New Fan Club Signup</h2>
    <p>A new member has joined the Harrison Dessoy Fan Club!</p>

    <h3>Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${data.name}</li>
      <li><strong>Email:</strong> ${data.email}</li>
      <li><strong>Country:</strong> ${data.country || 'Not provided'}</li>
      <li><strong>Message:</strong> ${data.message || 'No message'}</li>
      <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
    </ul>

    <p><a href="https://docs.google.com/spreadsheets/d/${SpreadsheetApp.getActiveSpreadsheet().getId()}">View all submissions</a></p>
  `;

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: CONFIG.ADMIN_SUBJECT,
    htmlBody: emailBody
  });
}

/**
 * Send confirmation email to user
 */
function sendUserConfirmation(data) {
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #e63946 0%, #1d3557 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to the Harrison Dessoy Fan Club!</h1>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <p>Hi ${data.name},</p>

        <p>Thank you for joining the Harrison Dessoy Fan Club! We're thrilled to have you as part of our community as Harrison prepares for his historic debut in the World Superbikes Sportbike class in 2026.</p>

        <h3 style="color: #1d3557;">What's Next?</h3>
        <ul>
          <li>You'll receive exclusive updates about Harrison's training and preparation</li>
          <li>Behind-the-scenes content from race weekends</li>
          <li>Early access to meet-and-greet opportunities</li>
          <li>Special member-only offers and merchandise</li>
        </ul>

        <p>Stay tuned for your first newsletter coming soon!</p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${CONFIG.WEBSITE_URL}" style="display: inline-block; padding: 12px 30px; background: #e63946; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Website</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Follow Harrison on social media:<br>
          Instagram: @harrison_dessoy55<br>
          Facebook: Harrison Dessoy
        </p>
      </div>

      <div style="background: #1d3557; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>&copy; 2025 Harrison Dessoy. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: data.email,
      subject: CONFIG.USER_SUBJECT,
      htmlBody: emailBody
    });
  } catch (error) {
    Logger.log('Error sending user confirmation: ' + error.toString());
    // Don't throw error - admin notification already sent
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create JSON response
 */
function createResponse(success, message) {
  const response = {
    success: success,
    message: message
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - run this to test the sheet creation
 */
function testSheetCreation() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    country: 'Test Country',
    message: 'This is a test submission'
  };

  saveToSheet(testData);
  Logger.log('Test data saved to sheet successfully');
}
