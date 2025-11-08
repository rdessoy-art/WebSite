# Google Apps Script Setup Instructions

## Step-by-Step Guide to Set Up Your Fan Club Form Handler

### Part 1: Create the Google Apps Script

1. **Create a new Google Sheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Click **+ Blank** to create a new spreadsheet
   - Name it "Harrison Dessoy Fan Club Submissions" (or any name you prefer)

2. **Open the Script Editor**
   - In your Google Sheet, click **Extensions** → **Apps Script**
   - This opens the Apps Script editor in a new tab

3. **Delete the default code**
   - You'll see a default `function myFunction() {}`
   - Delete all of it

4. **Paste the script code**
   - Copy all the code from `Code.gs`
   - Paste it into the script editor

5. **Configure your settings**
   - At the top of the script, find the `CONFIG` object
   - Update these values:
     ```javascript
     ADMIN_EMAIL: 'your-email@example.com',  // Your email address
     WEBSITE_URL: 'https://yourdomain.com'   // Your website URL
     ```

6. **Save the script**
   - Click the **💾 Save** button (or Ctrl+S / Cmd+S)
   - Name your project: "Fan Club Form Handler"

### Part 2: Test the Script

1. **Run a test**
   - In the script editor, select the function `testSheetCreation` from the dropdown
   - Click the **▶ Run** button

2. **Authorize the script** (first time only)
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to Fan Club Form Handler (unsafe)**
   - Click **Allow**

3. **Verify the test**
   - Go back to your Google Sheet
   - You should see a new sheet tab called "Fan Club Submissions"
   - It should have a test entry with headers

### Part 3: Deploy as a Web App

1. **Deploy the script**
   - In the Apps Script editor, click **Deploy** → **New deployment**
   - Click the gear icon ⚙️ next to "Select type"
   - Choose **Web app**

2. **Configure deployment settings**
   - **Description:** "Fan Club Form v1"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
   - Click **Deploy**

3. **Copy the Web App URL**
   - You'll see a "Web app" URL that looks like:
     ```
     https://script.google.com/macros/s/AKfycby.../exec
     ```
   - **IMPORTANT:** Copy this entire URL - you'll need it for your website!

4. **Test the web app**
   - Open the URL in your browser
   - You should see: "Harrison Dessoy Fan Club Form Handler is active. Use POST to submit data."

### Part 4: Update Your Website Form

1. **Open your website's index.html file**

2. **Find the form submission URL**
   - Look for this line (around line 742):
     ```javascript
     const response = await fetch('https://api.web3forms.com/submit', {
     ```

3. **Replace with your Google Apps Script URL**
   - Change it to your Web App URL from Part 3, step 3:
     ```javascript
     const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
     ```

4. **Remove the access_key field**
   - Find and delete this line (around line 651):
     ```html
     <input type="hidden" name="access_key" value="849b83c2-85b1-495c-8074-a020510f09b7">
     ```

5. **Save and upload your updated index.html**

### Part 5: Test the Complete Setup

1. **Visit your website**
   - Go to the Fan Club section
   - Fill out the form with test data
   - Submit it

2. **Verify everything works**
   - ✅ You should see a success message on your website
   - ✅ Check your Google Sheet - new row should appear with the submission
   - ✅ Check your email - you should receive an admin notification
   - ✅ Check the test email - confirmation email should be sent

## Customization Options

### Change Email Templates

To customize the emails, edit these functions in `Code.gs`:
- `sendAdminNotification()` - Admin notification email
- `sendUserConfirmation()` - User confirmation email

### Add More Form Fields

1. Add the field to your HTML form in `index.html`
2. Update the `saveToSheet()` function to include the new field
3. Update email templates if needed

### Add Auto-Responder Settings

You can add more features like:
- Auto-tagging in the sheet (e.g., "VIP", "New Member")
- Integration with other services (MailChimp, etc.)
- Custom triggers for different actions

## Troubleshooting

### Form submission fails
- Check that your Web App URL is correct
- Verify the script is deployed as "Anyone" can access
- Check browser console for error messages

### Emails not sending
- Verify your ADMIN_EMAIL is correct
- Check your Gmail spam folder
- Ensure you authorized the script to send emails

### Data not appearing in sheet
- Check if the sheet name matches CONFIG.SHEET_NAME
- Look at Apps Script logs: View → Executions

### "Authorization required" error
- Re-run the authorization process (Part 2, step 2)
- Make sure you granted all permissions

## Security Notes

- The script is deployed as "Anyone" can access, but it only accepts POST requests
- Form data is validated before being saved
- Email addresses are validated with regex
- All errors are logged but not exposed to users

## Updating the Script

When you make changes to the script:
1. Save the changes in the script editor
2. Click **Deploy** → **Manage deployments**
3. Click the pencil icon ✏️ to edit
4. Change the version to "New version"
5. Click **Deploy**
6. Your web app URL stays the same!

---

## Need Help?

If you encounter any issues, check:
1. Apps Script execution logs: View → Executions
2. Browser console for frontend errors
3. Make sure all Google Sheet permissions are granted

Your form is now set up and ready to collect fan club signups! 🏁
