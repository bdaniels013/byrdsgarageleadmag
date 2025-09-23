# Byrd's Garage Lead Magnet Landing Page

A modern, professional lead magnet landing page for Byrd's Garage that captures customer information, delivers coupon codes via email/SMS, and integrates with Tekmetric for seamless booking.

## Features

- 🎯 **Lead Capture**: Collect customer information with enhanced form validation
- 📱 **Multi-Channel Delivery**: Send coupon codes via SMS and email
- 🔗 **Tekmetric Integration**: Automatic redirect to booking with pre-applied coupon codes
- 💳 **Payment Processing**: Optional upsell with Stripe integration
- 📊 **Analytics**: Comprehensive tracking for conversion optimization
- 📱 **Mobile-First**: Fully responsive design optimized for all devices
- ⚡ **Performance**: Modern web technologies and optimized loading

## Tech Stack

- **Frontend**: React 18, Next.js 14, Framer Motion, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **SMS**: Twilio
- **Email**: Nodemailer with SMTP
- **Payments**: Stripe
- **Icons**: Lucide React

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp env.example .env.local
```

Update the following environment variables in `.env.local`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/byrds-garage

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Tekmetric Integration
TEKMETRIC_BOOK_URL=https://booking.shopgenie.io/?shop=byrds-garage-3978714221&preselect_account=byrds-garage-3978713555&promo=

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Database Setup

Make sure MongoDB is running and accessible at the URI specified in your environment variables.

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the landing page.

## Configuration

### Lead Magnet Offers

The available offers are configured in the main component file. Each offer includes:

- Unique coupon code
- Service description
- Value proposition
- Fine print terms

### Trust Signals

Update trust signals in the CONFIG object:

```javascript
trustSignals: {
  googleRating: 4.8,
  totalReviews: 127,
  yearsInBusiness: 4,
  customersServed: 500,
  warrantyMonths: 12,
  warrantyMiles: 12000,
}
```

### Brand Information

Customize brand details:

```javascript
brand: {
  name: "Byrd's Garage",
  phone: "(916) 991-1079",
  address: "220 Elverta Rd, Elverta, CA 95626",
  hours: "Mon–Fri 8:00 AM – 5:00 PM",
  established: "2020",
}
```

## API Endpoints

### Lead Capture
- **POST** `/api/leads/create`
- Captures lead information and stores in MongoDB
- Includes duplicate prevention and validation

### Coupon Delivery
- **POST** `/api/coupons/send`
- Sends coupon codes via SMS and email
- Updates lead record with delivery status

### Upsell Tracking
- **POST** `/api/upsell/record`
- Tracks upsell interactions for analytics

## Integration with Tekmetric

The landing page automatically redirects users to your Tekmetric booking system with the coupon code pre-applied:

```javascript
const bookingUrl = `${TEKMETRIC_BOOK_URL}${encodeURIComponent(couponCode)}`;
```

## SMS and Email Templates

### SMS Template
```
🎉 FREE 90‑Point Digital Vehicle Inspection - Code: BYRD-DVI90

Comprehensive inspection with photos & vehicle health score

Book now: [booking-url]

Byrd's Garage - (916) 991-1079
Valid for 30 days from booking.
```

### Email Template
- Professional HTML email with Byrd's Garage branding
- Includes coupon details and booking link
- Mobile-responsive design
- Clear call-to-action buttons

## Analytics and Tracking

The landing page includes comprehensive tracking:

- Form submission events
- Offer selection tracking
- Upsell interaction tracking
- UTM parameter capture
- Conversion funnel analysis

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted VPS

## Customization

### Styling
- Uses Tailwind CSS for styling
- Custom color palette in `tailwind.config.js`
- Responsive design with mobile-first approach

### Content
- All text content is easily customizable in the main component
- Images can be replaced in the public folder
- Brand colors and fonts can be updated in the config

### Functionality
- Add new lead magnet offers in the OFFERS array
- Customize form fields and validation
- Modify email and SMS templates
- Add new API endpoints as needed

## Support

For technical support or customization requests, contact the development team.

## License

MIT License - see LICENSE file for details.
