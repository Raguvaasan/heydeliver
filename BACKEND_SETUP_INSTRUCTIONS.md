# 🔐 Cashfree API Credentials - BACKEND SETUP

## Your Credentials (Test Environment)

```
APPID (Client ID): your_test_client_id_here
Secret Key: your_test_client_secret_here
```

⚠️ **IMPORTANT**: These are TEST/SANDBOX credentials - perfect for development!

---

## 🎯 What Your Backend Developer Needs to Do

### Step 1: Add Environment Variables

Create/update your backend `.env` file:

```env
# Cashfree Payment Gateway - TEST Environment
CASHFREE_CLIENT_ID=your_test_client_id_here
CASHFREE_CLIENT_SECRET=your_test_client_secret_here
CASHFREE_API_URL=https://sandbox.cashfree.com/pg

# Frontend URL (for callbacks)
FRONTEND_URL=http://localhost:5173
```

### Step 2: Install Required Packages

```bash
npm install axios
# or
yarn add axios
```

### Step 3: Implement the 5 API Endpoints

Use the reference implementation in: `backend-reference/cashfree-backend-example.js`

**Required Endpoints:**

1. **Create Payment Order**
   ```
   POST /api/wallet/create-payment-order
   Body: { amount: 500, paymentMethod: "upi" }
   Returns: { orderId, sessionId }
   ```

2. **Verify Payment**
   ```
   POST /api/wallet/verify-payment
   Body: { orderId: "ORDER_123", paymentId: "PAY_456" }
   Returns: { success: true, amount: 500 }
   ```

3. **Get Wallet Balance**
   ```
   GET /api/wallet/balance
   Returns: { balance: 1500.00 }
   ```

4. **Get Transactions**
   ```
   GET /api/wallet/transactions
   Returns: { transactions: [...] }
   ```

5. **Webhook Handler** (Optional but recommended)
   ```
   POST /webhook/cashfree
   Handles real-time payment updates
   ```

### Step 4: Test with These Credentials

**Test Card (Successful Payment):**
- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date
- OTP: `123456`

**Test UPI:**
- Success: `success@upi`
- Failure: `failure@upi`

---

## 🧪 Testing Flow

1. **Start your backend** with the credentials above
2. **Start frontend**: `npm run dev`
3. **Navigate to**: http://localhost:5173/admin/wallet/add
4. **Enter amount**: ₹500
5. **Click**: "Proceed to Payment"
6. **Use test credentials** above
7. **Verify**: Wallet is credited

---

## 📋 Backend Implementation Checklist

- [ ] Add environment variables
- [ ] Install axios package
- [ ] Implement `POST /api/wallet/create-payment-order`
- [ ] Implement `POST /api/wallet/verify-payment`
- [ ] Implement `GET /api/wallet/balance`
- [ ] Implement `GET /api/wallet/transactions`
- [ ] (Optional) Implement `POST /webhook/cashfree`
- [ ] Test with sandbox credentials
- [ ] Test all payment scenarios

---

## 🔄 Production Migration (Later)

When ready for production:

1. **Switch to Production** in Cashfree dashboard
2. **Generate Production API Keys**
3. **Update environment variables**:
   ```env
   CASHFREE_CLIENT_ID=your_production_app_id
   CASHFREE_CLIENT_SECRET=your_production_secret
   CASHFREE_API_URL=https://api.cashfree.com/pg
   ```
4. **Test with small real transaction**
5. **Set up webhook URL** in Cashfree dashboard

---

## 🆘 Need Help?

Reference files:
- **Backend Implementation**: `backend-reference/cashfree-backend-example.js`
- **Complete Guide**: `CASHFREE_INTEGRATION.md`
- **Flow Diagram**: `CASHFREE_FLOW_GUIDE.md`
- **API Documentation**: https://docs.cashfree.com/

---

## ✅ Current Status

- ✅ Frontend Integration: Complete
- ✅ Cashfree Account: Setup & Credentials Ready
- ⏳ Backend Implementation: Ready to Start
- ⏳ Testing: Pending backend completion

**Next Action**: Share these credentials with your backend developer securely (don't commit to Git!)
