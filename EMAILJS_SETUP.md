# EmailJS Setup Guide

## Quick Setup for Real Email Sending

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Copy the **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template content:

**Subject:** Your Free Coupon Code from {{business_name}}

**Body:**
```
Hi {{to_name}},

Thank you for requesting your free vehicle inspection!

🎉 Your Exclusive Coupon Code: {{coupon_code}}

{{offer_name}}

This coupon code will be automatically applied when you book your appointment.

Book Your Appointment: {{booking_url}}

If you have any questions, please call us at {{business_phone}}.

Best regards,
{{from_name}}
{{business_address}}
```

4. Save the template and copy the **Template ID** (e.g., `template_xyz789`)

### 4. Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key** (e.g., `user_abc123def456`)

### 5. Update Environment Variables
Add these to your `.env.local` file:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### 6. Test the Setup
1. Restart your development server
2. Submit the form with a real email address
3. Check your email inbox for the coupon code

## Free Tier Limits
- 200 emails per month
- Perfect for testing and small businesses
- Upgrade for more emails if needed

## Troubleshooting
- Make sure all environment variables are set correctly
- Check the browser console for any error messages
- Verify your email service is properly connected in EmailJS dashboard
