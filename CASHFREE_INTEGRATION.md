# Cashfree Payment Gateway Integration

## Overview
This implementation integrates Cashfree payment gateway for wallet recharge functionality in the HeyDeliver admin portal.

## Features
- ✅ Real-time wallet balance display
- ✅ Multiple payment methods (UPI, Netbanking, Credit/Debit Card)
- ✅ Quick amount selection buttons
- ✅ Secure payment processing via Cashfree
- ✅ Payment verification and callback handling
- ✅ Success/Failure status pages
- ✅ Transaction history tracking
- ✅ Loading states and error handling

## Files Created/Modified

### New Files
1. **`src/store/walletStore.ts`** - Zustand store for wallet state management
2. **`src/pages/Wallet/PaymentCallbackPage.tsx`** - Payment callback handler page
3. **`CASHFREE_INTEGRATION.md`** - This documentation file

### Modified Files
1. **`src/pages/Wallet/AddMoneyPage.tsx`** - Updated with Cashfree integration
2. **`src/index.tsx`** - Added payment callback route

## Backend Requirements

Your backend needs to implement the following API endpoints:

### 1. Get Wallet Balance
```
GET /wallet/balance
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "balance": 1500.00
}
```

### 2. Create Payment Order
```
POST /wallet/create-payment-order
Headers: Authorization: Bearer <token>
Body:
{
  "amount": 1000,
  "paymentMethod": "upi" | "card"
}

Response:
{
  "success": true,
  "orderId": "order_123456789",
  "sessionId": "session_cashfree_xyz",
  "amount": 1000,
  "currency": "INR"
}
```

**Backend Implementation Steps:**
1. Create order in your database with status "pending"
2. Call Cashfree API to create payment session:
   ```
   POST https://sandbox.cashfree.com/pg/orders
   (Use production URL for live: https://api.cashfree.com/pg/orders)
   
   Headers:
   - x-client-id: <your-client-id>
   - x-client-secret: <your-client-secret>
   - x-api-version: 2023-08-01
   - Content-Type: application/json
   
   Body:
   {
     "order_id": "order_123456789",
     "order_amount": 1000,
     "order_currency": "INR",
     "customer_details": {
       "customer_id": "user_id",
       "customer_email": "user@example.com",
       "customer_phone": "9999999999"
     },
     "order_meta": {
       "return_url": "https://yourdomain.com/admin/wallet/payment-callback?order_id={order_id}",
       "notify_url": "https://yourbackend.com/webhook/cashfree"
     }
   }
   ```
3. Return `orderId` and `payment_session_id` to frontend

### 3. Verify Payment
```
POST /wallet/verify-payment
Headers: Authorization: Bearer <token>
Body:
{
  "orderId": "order_123456789",
  "paymentId": "payment_xyz"
}

Response:
{
  "success": true,
  "status": "SUCCESS",
  "amount": 1000
}
```

**Backend Implementation Steps:**
1. Verify payment status with Cashfree:
   ```
   GET https://sandbox.cashfree.com/pg/orders/{order_id}/payments
   Headers:
   - x-client-id: <your-client-id>
   - x-client-secret: <your-client-secret>
   - x-api-version: 2023-08-01
   ```
2. If payment successful:
   - Update order status to "completed"
   - Add amount to user's wallet
   - Create transaction record
3. Return verification result

### 4. Get Transactions
```
GET /wallet/transactions
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "transactions": [
    {
      "id": "txn_123",
      "amount": 1000,
      "type": "credit",
      "status": "completed",
      "description": "Wallet Recharge",
      "createdAt": "2026-02-03T10:30:00Z",
      "paymentMethod": "upi"
    }
  ]
}
```

## Cashfree Setup

### 1. Get Cashfree Credentials
1. Sign up at [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Navigate to Developers > API Keys
3. Get your `Client ID` and `Client Secret`
4. For testing, use Sandbox credentials

### 2. Environment Configuration
Add to your backend `.env`:
```env
# Sandbox (Testing)
CASHFREE_CLIENT_ID=your_sandbox_client_id
CASHFREE_CLIENT_SECRET=your_sandbox_client_secret
CASHFREE_API_URL=https://sandbox.cashfree.com/pg

# Production
# CASHFREE_CLIENT_ID=your_prod_client_id
# CASHFREE_CLIENT_SECRET=your_prod_client_secret
# CASHFREE_API_URL=https://api.cashfree.com/pg
```

### 3. Webhook Configuration (Recommended)
Set up webhook in Cashfree dashboard for real-time payment updates:
```
Webhook URL: https://yourbackend.com/webhook/cashfree
```

**Webhook Handler:**
```typescript
app.post('/webhook/cashfree', (req, res) => {
  const { orderId, orderAmount, txStatus, referenceId, txTime } = req.body;
  
  // Verify webhook signature
  const signature = req.headers['x-webhook-signature'];
  // ... verify signature logic
  
  if (txStatus === 'SUCCESS') {
    // Update order status
    // Credit wallet
    // Create transaction record
  }
  
  res.status(200).send('OK');
});
```

## Payment Flow

### 1. User Flow
1. User navigates to `/admin/wallet/add`
2. Views current wallet balance
3. Enters recharge amount (min ₹100)
4. Selects payment method (UPI/Card)
5. Clicks "Proceed To Payment"
6. Redirected to Cashfree payment page
7. Completes payment
8. Redirected to `/admin/wallet/payment-callback`
9. Sees success/failure status
10. Redirected to wallet page

### 2. Technical Flow
```
Frontend (AddMoneyPage)
  → API: POST /wallet/create-payment-order
    ← Returns: orderId, sessionId
  
  → Cashfree SDK: Initialize with sessionId
  → Cashfree SDK: Redirect to payment page
  
Cashfree Payment Gateway
  → User completes payment
  → Redirects to: /admin/wallet/payment-callback
  
Frontend (PaymentCallbackPage)
  → API: POST /wallet/verify-payment
    ← Returns: payment status
  → API: GET /wallet/balance (refresh)
  → Show success/failure message
```

## Testing

### Test Credentials (Sandbox)
Use these test card details:
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
OTP: 123456
```

UPI Test IDs:
```
success@upi
failure@upi
```

### Test Scenarios
1. **Successful Payment**: Use test card, verify wallet credited
2. **Failed Payment**: Use failure@upi, verify graceful error handling
3. **Minimum Amount**: Try amount < ₹100, verify validation
4. **Network Error**: Disconnect internet, verify error messages
5. **Browser Back**: Test back button during payment

## Security Considerations

1. **Never expose secrets in frontend**
   - Client ID can be in frontend
   - Client Secret must ONLY be in backend

2. **Verify all payments server-side**
   - Don't trust frontend status
   - Always verify with Cashfree API

3. **Use HTTPS in production**
   - Payment gateway requires HTTPS
   - Redirect URLs must be HTTPS

4. **Implement webhook verification**
   - Verify signature of webhook requests
   - Prevent fake payment notifications

5. **Sanitize user inputs**
   - Validate amount ranges
   - Prevent SQL injection in order IDs

## Error Handling

The implementation handles:
- ✅ Network failures
- ✅ Payment gateway loading failures
- ✅ Invalid payment amounts
- ✅ Payment cancellation
- ✅ Payment failures
- ✅ Verification failures

## Migration to Production

### Checklist
- [ ] Get production Cashfree credentials
- [ ] Update backend environment variables
- [ ] Change Cashfree API URL to production
- [ ] Update return URLs to production domain
- [ ] Set up webhook URL in Cashfree dashboard
- [ ] Test with small real transaction
- [ ] Set up monitoring and alerts
- [ ] Configure proper logging
- [ ] Add payment retry mechanism
- [ ] Set up reconciliation process

### Production Environment Variables
```env
CASHFREE_CLIENT_ID=your_production_client_id
CASHFREE_CLIENT_SECRET=your_production_client_secret
CASHFREE_API_URL=https://api.cashfree.com/pg
CASHFREE_WEBHOOK_SECRET=your_webhook_secret
```

## Troubleshooting

### Issue: Payment gateway not loading
**Solution**: Check browser console, ensure Cashfree SDK script loaded successfully

### Issue: Payment fails immediately
**Solution**: Verify backend returns valid `sessionId` and `orderId`

### Issue: Callback page shows error
**Solution**: Check payment status in Cashfree dashboard, verify webhook received

### Issue: Wallet not credited after payment
**Solution**: Check backend logs, verify webhook handler working correctly

## Support Resources

- [Cashfree Documentation](https://docs.cashfree.com/)
- [Cashfree JS SDK](https://docs.cashfree.com/docs/web-integration)
- [Payment Gateway API](https://docs.cashfree.com/reference/pg-new-apis-endpoint)
- [Cashfree Support](https://support.cashfree.com/)

## Future Enhancements

Potential improvements:
1. Add payment retry mechanism
2. Implement recurring payments
3. Add payment method preferences
4. Show transaction receipts/invoices
5. Add cashback/offers system
6. Implement auto-recharge based on balance
7. Add payment analytics dashboard
8. Support multiple currencies

## License
Part of HeyDeliver Admin Portal - Internal Use Only
