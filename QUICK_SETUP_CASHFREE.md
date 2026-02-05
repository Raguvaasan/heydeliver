# Quick Setup Guide - Cashfree Integration

## Step 1: Get Cashfree Credentials (Do this NOW)

You're already on the Cashfree dashboard! Follow these steps:

1. **Click on "Payment Gateway"** (the first card on your screen)
2. Navigate to **Developers** section in the sidebar
3. Click on **API Keys**
4. Copy these credentials:
   - `App ID` (Client ID)
   - `Secret Key` (Client Secret)
   
⚠️ **Important**: Keep these credentials safe. Never commit them to Git!

## Step 2: Share These with Your Backend Team

Your backend developer needs to implement 5 endpoints. Share this file with them:
- **`backend-reference/cashfree-backend-example.js`**

They need to add these environment variables:
```env
CASHFREE_CLIENT_ID=your_app_id_here
CASHFREE_CLIENT_SECRET=your_secret_key_here
CASHFREE_API_URL=https://sandbox.cashfree.com/pg
```

## Step 3: Backend Must Implement These APIs

```
1. GET  /api/wallet/balance
   → Return user's wallet balance

2. POST /api/wallet/create-payment-order
   → Create Cashfree order and return sessionId

3. POST /api/wallet/verify-payment
   → Verify payment and credit wallet

4. GET  /api/wallet/transactions
   → Return transaction history

5. POST /webhook/cashfree (Optional but recommended)
   → Handle real-time payment updates
```

## Step 4: Test the Integration

Once backend is ready:

1. Go to: http://localhost:5173/admin/wallet/add
2. Enter amount: ₹500
3. Click "Proceed to Payment"
4. Use test credentials:
   - **Test Card**: 4111 1111 1111 1111
   - **CVV**: 123
   - **OTP**: 123456
   - **Test UPI**: success@upi

## Step 5: Verify Everything Works

✅ Wallet balance shows correctly
✅ Payment order created successfully
✅ Redirected to Cashfree payment page
✅ Payment completed
✅ Redirected back to success page
✅ Wallet credited with correct amount
✅ Transaction shows in history

## Current Status

✅ Frontend - 100% Complete
✅ Documentation - Complete
✅ Cashfree Account - Ready (You're logged in!)
⏳ Backend Implementation - Pending
⏳ Testing - Pending

## Who Does What?

**You (Frontend/Product):**
- ✅ Frontend integration done
- ⏳ Get API credentials from Cashfree
- ⏳ Share credentials with backend team
- ⏳ Test once backend is ready

**Backend Team:**
- ⏳ Implement 5 endpoints (use reference file)
- ⏳ Set up Cashfree API integration
- ⏳ Test in sandbox mode
- ⏳ Deploy to staging

**Testing Team:**
- ⏳ Test all payment scenarios
- ⏳ Test error cases
- ⏳ Verify webhook handling

---

**Next Action**: Get your API credentials from Cashfree dashboard (Developers → API Keys)
