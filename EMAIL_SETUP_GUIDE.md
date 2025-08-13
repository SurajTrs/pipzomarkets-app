# Email Setup Guide for Password Reset Functionality

## Overview

This guide will help you set up the email functionality for the "Forgot Password" feature in PipzoMarkets. The system uses Nodemailer with Gmail to send password reset links to users.

## Prerequisites

- A Gmail account
- 2-Step Verification enabled on your Google account

## Step 1: Enable 2-Step Verification

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select "Security" from the left navigation panel
3. Under "Signing in to Google," select "2-Step Verification"
4. Follow the steps to turn on 2-Step Verification

## Step 2: Generate an App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select "Security" from the left navigation panel
3. Under "Signing in to Google," select "App passwords" (you'll only see this option if 2-Step Verification is enabled)
4. At the bottom, select "Select app" and choose "Other (Custom name)"
5. Enter "PipzoMarkets" or any name you prefer
6. Click "Generate"
7. Google will display a 16-character app password. **Copy this password**

## Step 3: Configure Environment Variables

1. Open the `.env` file in the `server` directory
2. Update the following variables:
   ```
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_APP_PASSWORD=your-16-character-app-password
   CLIENT_URL=http://localhost:5174
   ```
   Replace `your-gmail-address@gmail.com` with your actual Gmail address and `your-16-character-app-password` with the app password you generated in Step 2.

## Step 4: Restart the Server

After updating the `.env` file, restart the server to apply the changes:

```bash
cd server
npm run dev
```

## Testing the Password Reset Functionality

1. Go to the login page
2. Click on "Forgot Password?"
3. Enter your email address
4. Check your email for the password reset link
5. Click the link and set a new password

## Troubleshooting

### Email Not Received

- Check your spam/junk folder
- Verify that the email address entered matches your registered account
- Ensure your `.env` file has the correct Gmail credentials
- Check the server console for any error messages related to email sending

### Invalid or Expired Token

- Password reset tokens expire after 1 hour
- Request a new password reset link

### Gmail Security Issues

- Ensure that "Less secure app access" is turned off (it should be if you're using 2-Step Verification)
- If you're still having issues, check Google's security page for any alerts: https://myaccount.google.com/security

## Notes

- For production environments, consider using a dedicated email service like SendGrid, Mailgun, or Amazon SES
- The current implementation uses Gmail, which has daily sending limits
- For testing purposes, the reset token is also logged to the server console