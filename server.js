require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Provide a fallback dummy key so the server doesn't crash on startup if .env is missing.
// It will only fail when actually trying to send an email.
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy123456789");

const pendingOrders = new Map();

const PRODUCTS = [
  { id: "practice-cone", name: "Practice cone", price: 10, image: "Practice Cone" },
  { id: "normal-cone", name: "Normal henna cones", price: 20, image: "Normal Cone" },
  { id: "bridal-cone", name: "Bridal henna cone", price: 30, image: "Bridal Cone" },
  { id: "henna-dip", name: "Henna dip", price: 40, image: "Henna Dip" },
  { id: "stencil", name: "Stencil", price: 150, image: "Stencil" },
  { id: "aftercare-balm", name: "Aftercare balm", price: 30, image: "Aftercare Balm" },
];
const SHIPPING_FLAT = 30;

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, paymentMethod, customerNotes } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    // Server-side recalculation of totals
    let calculatedSubtotal = 0;
    let totalItems = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (product) {
        const itemSubtotal = product.price * item.quantity;
        calculatedSubtotal += itemSubtotal;
        totalItems += item.quantity;
        
        enrichedItems.push({
          productId: product.id,
          productName: product.name,
          image: product.image,
          quantity: item.quantity,
          price: product.price,
          subtotal: itemSubtotal
        });
      }
    }

    const grandTotal = calculatedSubtotal + SHIPPING_FLAT;
    
    // Generate Order ID & Dates
    const orderId = "HN" + Math.floor(100000 + Math.random() * 900000);
    const dateObj = new Date();
    const orderDate = dateObj.toLocaleDateString();
    const orderTime = dateObj.toLocaleTimeString();

    // Generate HTML Email
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px; background: #0a0a0a; color: #D4A853;">
          <h1 style="margin: 0;">NEW ORDER RECEIVED</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #6B1E2A; margin-top: 0;">Order #${orderId}</h2>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Order Time:</strong> ${orderTime}</p>
          <p><strong>Status:</strong> <span style="background: #e6f4ea; color: #137333; padding: 3px 8px; border-radius: 4px;">New Order</span></p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${customer.name}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Phone:</strong> ${customer.phone}</p>
          <p><strong>Address:</strong><br/>
            ${customer.address}<br/>
            ${customer.city}, PIN: ${customer.pin}
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <h3>Product Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${enrichedItems.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">
                    ${item.productName} <br><small style="color: #666;">SKU: ${item.productId}</small>
                  </td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.subtotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>Total Items:</strong> ${totalItems}</p>
            <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₹${calculatedSubtotal.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Shipping:</strong> ₹${SHIPPING_FLAT.toFixed(2)}</p>
            <h3 style="margin: 15px 0 0; color: #6B1E2A; font-size: 20px;">Grand Total: ₹${grandTotal.toFixed(2)}</h3>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <h3>Payment Information</h3>
          <p><strong>Method:</strong> ${paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> Pending</p>

          ${customerNotes ? `
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <h3>Customer Notes</h3>
          <p style="background: #fff3cd; padding: 10px; border-radius: 4px;">${customerNotes}</p>
          ` : ''}
        </div>
      </div>
    `;

    if (paymentMethod === 'upi') {
      pendingOrders.set(orderId, { customer, orderId, grandTotal, htmlEmail });
      
      const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
      const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
      const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
      
      const payload = {
        merchantId: merchantId,
        merchantTransactionId: orderId,
        merchantUserId: 'MUID123',
        amount: Math.round(grandTotal * 100),
        redirectUrl: `http://localhost:3000/api/payment/callback/${orderId}`,
        redirectMode: 'POST',
        callbackUrl: `http://localhost:3000/api/payment/callback/${orderId}`,
        mobileNumber: customer.phone || '9999999999',
        paymentInstrument: { type: 'PAY_PAGE' }
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const endpoint = '/pg/v1/pay';
      const checksum = crypto.createHash('sha256').update(base64Payload + endpoint + saltKey).digest('hex') + '###' + saltIndex;
      
      const phonePeHost = process.env.PHONEPE_HOST || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
      
      try {
        const response = await fetch(`${phonePeHost}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
          },
          body: JSON.stringify({ request: base64Payload })
        });
        const data = await response.json();
        if (data.success) {
          return res.status(200).json({ success: true, redirectUrl: data.data.instrumentResponse.redirectInfo.url, orderId });
        } else {
          console.error("PhonePe error:", data);
          return res.status(400).json({ error: 'Payment gateway configuration error.' });
        }
      } catch (err) {
        console.error("PhonePe API error:", err);
        return res.status(500).json({ error: 'Failed to initiate payment gateway.' });
      }
    }

    // Send Admin Email for COD or other methods
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received - #${orderId} - ${customer.name}`,
      html: htmlEmail,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(500).json({ error: 'Failed to send order email.' });
    }

    res.status(200).json({ success: true, orderId, total: grandTotal });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/payment/callback/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  const orderData = pendingOrders.get(orderId);
  
  if (orderData) {
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `New Order Received (UPI/PhonePe) - #${orderId} - ${orderData.customer.name}`,
        html: orderData.htmlEmail,
      });
      pendingOrders.delete(orderId);
    } catch (err) {
      console.error('Email error in callback:', err);
    }
  }
  
  res.redirect(`/index2.html?payment=success&orderId=${orderId}`);
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, date, service, message } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px; background: #0a0a0a; color: #D4A853;">
          <h1 style="margin: 0;">NEW BOOKING REQUEST</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Preferred Date:</strong> ${date || 'N/A'}</p>
          <p><strong>Service:</strong> ${service || 'N/A'}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <h3>Message</h3>
          <p style="white-space: pre-wrap;">${message || 'No additional message provided.'}</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New Booking Request - ${name}`,
      html: htmlEmail,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(500).json({ error: 'Failed to send contact email.' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact Server Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
