# 🧪 TESTING GUIDE - Frontend + Backend Integration

## ✅ Backend is Ready! Now Test Complete Flow

### Step 1: Start Backend Server

```bash
cd backend-folder
npm run dev
# or
npm start
```

**Verify Backend is Running:**
- Should see: `Server running on port 3000`
- Check: http://localhost:3000 (or your backend port)

---

### Step 2: Update Frontend API URL (If Needed)

Check your frontend `env` file:

```env
VITE_API_URL=http://localhost:3000/api
# OR if using proxy
VITE_API_URL=/api
```

**Current Setting**: `/api` (using proxy) ✅

---

### Step 3: Start Frontend Server

```bash
cd g:\heydeliver\heydeliver
npm run dev
```

Should see: `http://localhost:5173`

---

### Step 4: Complete Test Flow

#### 4.1 Login to Admin Portal
1. Open: http://localhost:5173/admin/login
2. Login with your credentials
3. Verify you get JWT token in sessionStorage

#### 4.2 Check Wallet Balance
1. Go to: http://localhost:5173/admin/wallet/add
2. You should see current balance (even if ₹0.00)
3. **If you see balance** ✅ API is working!

#### 4.3 Add Money to Wallet
1. Enter amount: **₹500**
2. Select payment method: **UPI** or **Card**
3. Click: **"Proceed to Payment"**
4. Should redirect to Cashfree payment page ✅

#### 4.4 Complete Payment (TEST MODE)
**For Card Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: `12/28` (any future date)
- OTP: `123456`

**For UPI Payment:**
- UPI ID: `success@upi` (for success)
- UPI ID: `failure@upi` (for testing failure)

#### 4.5 Verify Success
After payment:
1. Should redirect to: `/admin/wallet/payment-callback`
2. Should see: ✅ "Payment Successful!"
3. Click: "Go to Wallet"
4. **Check balance** - Should be credited with ₹500

---

## 🔍 Troubleshooting

### Issue 1: "Failed to fetch wallet balance"

**Check:**
```bash
# Test backend directly
curl http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Solution:**
- Make sure backend is running
- Check JWT token is valid
- Verify MongoDB is connected

---

### Issue 2: "Payment gateway not loaded"

**Check:**
- Open browser console (F12)
- Look for Cashfree SDK errors
- Verify internet connection

**Solution:**
- Refresh the page
- Clear browser cache
- Check network tab for failed requests

---

### Issue 3: "Failed to create payment order"

**Check Backend Console:**
```
Should see: POST /api/wallet/create-payment-order
```

**Solution:**
- Verify Cashfree credentials in backend .env
- Check backend logs for Cashfree API errors
- Verify amount is >= ₹100

---

### Issue 4: Payment completed but wallet not credited

**Two possibilities:**

**A. Check Verification Endpoint**
```bash
# Test manually
curl -X POST http://localhost:3000/api/wallet/verify-payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_123","paymentId":"PAY_456"}'
```

**B. Check Webhook (Better)**
- Webhook automatically credits wallet
- Check backend logs for webhook calls
- Verify signature verification passed

**Solution:**
- For local testing, use ngrok for webhooks
- Or manually call verify-payment endpoint

---

## 📊 Complete Test Checklist

### Frontend Tests:
- [ ] Login page works
- [ ] Navigate to /admin/wallet/add
- [ ] Current balance displays correctly
- [ ] Amount input accepts values
- [ ] Quick amount buttons work (+₹500, +₹1000, etc.)
- [ ] Payment method selection works
- [ ] "Proceed to Payment" button enabled
- [ ] Redirects to Cashfree

### Payment Flow Tests:
- [ ] Cashfree payment page loads
- [ ] Can select payment method
- [ ] Test card payment works
- [ ] Test UPI payment works
- [ ] Redirects back to callback page

### Callback Tests:
- [ ] Success page shows for successful payment
- [ ] Failure page shows for failed payment
- [ ] Balance updates after success
- [ ] Can navigate to wallet page
- [ ] Transaction shows in history

### Backend Tests:
- [ ] GET /api/wallet/balance returns correct data
- [ ] POST /api/wallet/create-payment-order creates order
- [ ] Cashfree session ID received
- [ ] POST /api/wallet/verify-payment verifies correctly
- [ ] Wallet balance updates in database
- [ ] Transaction record created
- [ ] GET /api/wallet/transactions returns history
- [ ] Webhook endpoint receives notifications

---

## 🎯 Test Scenarios

### Scenario 1: Successful Payment (Happy Path)
1. Login ✅
2. Go to add money page ✅
3. Enter ₹500 ✅
4. Select UPI ✅
5. Click proceed ✅
6. Use `success@upi` ✅
7. Complete payment ✅
8. See success page ✅
9. Verify balance = ₹500 ✅
10. Check transaction history ✅

### Scenario 2: Failed Payment
1. Enter ₹500
2. Use `failure@upi`
3. Payment fails
4. See failure page ✅
5. Verify balance unchanged ✅
6. Can retry payment ✅

### Scenario 3: Minimum Amount Validation
1. Try to enter ₹50
2. Should show error: "Minimum amount is ₹100" ✅

### Scenario 4: Multiple Payments
1. Add ₹500 (Balance: ₹500)
2. Add ₹1000 (Balance: ₹1500)
3. Add ₹2000 (Balance: ₹3500)
4. Verify all transactions in history ✅

---

## 🔧 Backend Verification Commands

### Check if Backend is Running:
```bash
curl http://localhost:3000/health
# or
curl http://localhost:3000/api/wallet/balance
```

### Check MongoDB Connection:
```bash
# In MongoDB shell or Compass
use freightrek
db.wallets.find()
db.orders.find()
db.transactions.find()
```

### Check Environment Variables:
```bash
# In backend folder
cat .env | grep CASHFREE
```

Should see:
```
CASHFREE_CLIENT_ID=TEST108...
CASHFREE_CLIENT_SECRET=cfsk_ma...
CASHFREE_API_URL=https://sandbox.cashfree.com/pg
```

---

## 📱 Test on Different Browsers

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if on Mac)

Verify:
- [ ] Cashfree SDK loads
- [ ] Payment flow works
- [ ] Callbacks work
- [ ] UI looks correct

---

## 🎬 Next Steps After Testing

### If Everything Works:
1. ✅ Mark integration as complete
2. Document any issues found
3. Prepare for staging deployment
4. Plan production migration

### If Issues Found:
1. Note the exact error messages
2. Check backend logs
3. Check browser console
4. Check network tab in DevTools
5. Share error details for debugging

---

## 🚀 Production Deployment (After Testing)

When ready for production:

### Backend Changes:
```env
# Update in production .env
CASHFREE_CLIENT_ID=<production_app_id>
CASHFREE_CLIENT_SECRET=<production_secret>
CASHFREE_API_URL=https://api.cashfree.com/pg
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### Frontend Changes:
```env
# Update in production .env
VITE_API_URL=https://api.yourdomain.com/api
```

### Cashfree Dashboard:
1. Switch to "Production" mode
2. Generate production API keys
3. Add production webhook URL
4. Test with small real transaction (₹10)

---

## ✨ Success Criteria

Integration is successful when:
- ✅ User can see wallet balance
- ✅ User can initiate payment
- ✅ Payment completes successfully
- ✅ Wallet is credited automatically
- ✅ Transaction appears in history
- ✅ No errors in console
- ✅ Backend logs show successful flow

---

**Ready to Test?** Start both servers and follow Step 4 above! 🚀
