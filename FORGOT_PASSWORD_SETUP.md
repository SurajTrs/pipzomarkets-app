# Setting Up the Forgot Password Feature

This document provides instructions on how to set up the email functionality for the Forgot Password feature in PipzoMarkets.

## Prerequisites

1. A Gmail account (or another email service)
2. 2-Step Verification enabled on your Google account

## Setup Instructions

### 1. Generate an App Password for Gmail

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App passwords"
4. Select "Mail" as the app and "Other" as the device (name it "PipzoMarkets")
5. Click "Generate"
6. Copy the 16-character password that appears

### 2. Configure Environment Variables

1. In the server directory, create a `.env` file based on the `.env.example` template
2. Set the following variables:
   ```
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_APP_PASSWORD=your-16-character-app-password
   CLIENT_URL=http://localhost:5174
   ```

### 3. Restart the Server

After configuring the environment variables, restart the server to apply the changes:

```
cd server
npm run dev
```

## Testing the Feature

1. Navigate to the login page
2. Click on "Forgot Password?"
3. Enter your email address
4. Check your email for the password reset link
5. Click the link and set a new password

## Troubleshooting

If you're not receiving emails:

1. Check the server console for any error messages
2. Verify that your app password is correct
3. Check your spam folder
4. Ensure that your Gmail account allows less secure apps (if using a regular password instead of an app password)

## Security Considerations

- The reset token expires after 1 hour
- For production, consider using a dedicated email service like SendGrid or Mailgun
- Never commit your `.env` file with real credentials to version control