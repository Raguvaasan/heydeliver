# Cashfree Payment Flow - Visual Guide

## 🔄 Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

1. USER OPENS WALLET PAGE
   ↓
   /admin/wallet/add
   ┌──────────────────────────────────┐
   │  Add Money to Wallet             │
   │  ┌────────────────────────────┐  │
   │  │ Current Balance: ₹0.00    │  │
   │  └────────────────────────────┘  │
   │                                  │
   │  Enter Amount: [___500___]       │
   │  Quick: +₹500 +₹1000 +₹2000     │
   │                                  │
   │  Payment Method:                 │
   │  ○ UPI / Netbanking             │
   │  ○ Credit / Debit Card          │
   │                                  │
   │  [Proceed To Payment]            │
   └──────────────────────────────────┘
   ↓
   
2. FRONTEND CALLS BACKEND
   ↓
   POST /api/wallet/create-payment-order
   {
     "amount": 500,
     "paymentMethod": "upi"
   }
   ↓
   
3. BACKEND CREATES ORDER
   ↓
   Backend → Cashfree API
   POST https://sandbox.cashfree.com/pg/orders
   {
     "order_id": "ORDER_123",
     "order_amount": 500,
     ...
   }
   ↓
   
4. CASHFREE RETURNS SESSION
   ↓
   Backend ← Cashfree API
   {
     "payment_session_id": "session_xyz",
     "order_id": "ORDER_123"
   }
   ↓
   
5. FRONTEND GETS SESSION ID
   ↓
   Frontend ← Backend
   {
     "orderId": "ORDER_123",
     "sessionId": "session_xyz"
   }
   ↓
   
6. FRONTEND REDIRECTS TO CASHFREE
   ↓
   Cashfree SDK → cashfree.redirect()
   ↓
   User sees Cashfree payment page
   ┌──────────────────────────────────┐
   │  Cashfree Payment Gateway        │
   │                                  │
   │  Amount: ₹500                    │
   │                                  │
   │  Select Payment Method:          │
   │  ○ UPI                          │
   │  ○ Credit Card                  │
   │  ○ Debit Card                   │
   │  ○ Net Banking                  │
   │                                  │
   │  [Continue]                      │
   └──────────────────────────────────┘
   ↓
   
7. USER COMPLETES PAYMENT
   ↓
   (User enters UPI PIN / Card details / OTP)
   ↓
   
8. CASHFREE PROCESSES PAYMENT
   ↓
   Payment Success/Failure
   ↓
   
9. CASHFREE REDIRECTS BACK
   ↓
   Redirects to: /admin/wallet/payment-callback
   ?order_id=ORDER_123
   &payment_id=PAY_456
   &status=SUCCESS
   ↓
   
10. CALLBACK PAGE VERIFIES PAYMENT
    ↓
    POST /api/wallet/verify-payment
    {
      "orderId": "ORDER_123",
      "paymentId": "PAY_456"
    }
    ↓
    
11. BACKEND VERIFIES WITH CASHFREE
    ↓
    Backend → Cashfree API
    GET /pg/orders/ORDER_123/payments
    ↓
    Cashfree confirms payment status
    ↓
    
12. BACKEND CREDITS WALLET
    ↓
    ✓ Update order status → "completed"
    ✓ Add ₹500 to user wallet
    ✓ Create transaction record
    ↓
    
13. USER SEES SUCCESS PAGE
    ↓
    ┌──────────────────────────────────┐
    │  ✓ Payment Successful!           │
    │                                  │
    │  Your wallet has been recharged  │
    │  successfully.                   │
    │                                  │
    │  [Go to Wallet]                  │
    │  [Go to Dashboard]               │
    └──────────────────────────────────┘
```

## 📊 Component Structure

```
src/
├── pages/
│   └── Wallet/
│       ├── AddMoneyPage.tsx         ← Main recharge page
│       ├── PaymentCallbackPage.tsx  ← Payment result handler
│       ├── WalletPage.tsx           ← Wallet dashboard
│       └── TransactionsPage.tsx     ← Transaction history
│
├── store/
│   └── walletStore.ts               ← Zustand state management
│
└── utils/
    └── cashfreeUtils.ts             ← Helper functions
```

## 🔐 Security Flow

```
FRONTEND                    BACKEND                     CASHFREE
─────────                   ───────                     ────────

[User enters amount]
        │
        ├─────────────────→ POST /create-order
        │                           │
        │                           ├─────────────→ POST /orders
        │                           │              (with secret)
        │                           │
        │                           │←─────────────┐
        │                           │              │
        │←──────────────────┐      │              │
        │   sessionId        │      │              │
        │                           │              │
[Cashfree SDK loads]               │              │
        │                           │              │
        ├────────────────────────────────────────→│
        │           Redirect with sessionId        │
        │                                          │
[User pays]                                        │
        │                                          │
        │                                          │
[Payment complete]                                 │
        │                                          │
        │←─────────────────────────────────────────┤
        │    Redirect to callback URL              │
        │                                          │
        ├─────────────────→ POST /verify-payment  │
        │                           │              │
        │                           ├─────────────→│
        │                           │  Verify      │
        │                           │              │
        │                           │←─────────────┤
        │                           │              │
        │                    [Credit wallet]       │
        │                           │              │
        │←──────────────────┐      │              │
        │   Success/Fail     │      │              │
        │                           │              │
[Show result]                                      │
```

## 🎨 UI States

### State 1: Loading Balance
```
┌──────────────────────┐
│ Current Balance      │
│ ⟳ Loading...        │
└──────────────────────┘
```

### State 2: Ready to Pay
```
┌──────────────────────┐
│ Current Balance      │
│ ₹ 1,250.00          │
└──────────────────────┘
[Proceed To Payment]
```

### State 3: Processing
```
┌──────────────────────┐
│ ⟳ Processing...     │
└──────────────────────┘
```

### State 4: Payment Gateway Loading
```
┌──────────────────────┐
│ ⟳ Loading Payment    │
│   Gateway...         │
└──────────────────────┘
```

### State 5: Verifying Payment
```
┌──────────────────────┐
│ ⟳ Verifying Payment  │
│ Please wait...       │
└──────────────────────┘
```

### State 6: Success
```
┌──────────────────────┐
│ ✓ Payment Successful!│
│ Wallet recharged     │
└──────────────────────┘
```

### State 7: Failed
```
┌──────────────────────┐
│ ✗ Payment Failed     │
│ Try again            │
└──────────────────────┘
```

## 📱 Error Handling Matrix

| Error Type | Where | Handling |
|-----------|-------|----------|
| Invalid amount | Frontend | Show validation error |
| SDK not loaded | Frontend | Show loading message |
| Network error | Frontend | Show retry option |
| Order creation fail | Backend | Return error message |
| Cashfree API error | Backend | Log & return generic error |
| Payment cancelled | Cashfree | Redirect to failure page |
| Payment failed | Cashfree | Show retry option |
| Verification fail | Backend | Don't credit wallet |
| Webhook failure | Backend | Use polling as fallback |

## 🧪 Test Scenarios

### ✅ Happy Path
```
1. User enters ₹500
2. Selects UPI
3. Clicks proceed
4. Completes payment
5. Sees success page
6. Wallet credited
```

### ❌ Payment Failure
```
1. User enters ₹500
2. Selects Card
3. Clicks proceed
4. Enters wrong OTP
5. Payment fails
6. Sees failure page
7. Wallet NOT credited
```

### ⚠️ Network Error
```
1. User enters ₹500
2. Network disconnects
3. Shows error
4. User retries
5. Works when network returns
```

### 🔄 Browser Back Button
```
1. User on payment page
2. Clicks back button
3. Returns to add money page
4. Can retry payment
5. Old order marked abandoned
```

## 📈 Monitoring Points

Monitor these for production:

1. **Order Creation Rate**
   - Track successful vs failed order creations
   
2. **Payment Success Rate**
   - Percentage of successful payments
   
3. **Verification Success**
   - How many payments verified successfully
   
4. **Average Time**
   - Time from order creation to wallet credit
   
5. **Error Rates**
   - Track different error types
   
6. **Webhook Delivery**
   - Monitor webhook success rate

## 🔗 Integration Checklist

- [x] Frontend: Cashfree SDK loading
- [x] Frontend: Payment order creation
- [x] Frontend: Payment redirect
- [x] Frontend: Callback handling
- [x] Frontend: Success/failure pages
- [ ] Backend: Order creation endpoint
- [ ] Backend: Cashfree API integration
- [ ] Backend: Payment verification
- [ ] Backend: Wallet credit logic
- [ ] Backend: Webhook handler
- [ ] Testing: Sandbox testing
- [ ] Testing: Production testing
- [ ] Monitoring: Error tracking
- [ ] Monitoring: Payment analytics

---

**Next Step**: Implement backend endpoints following the backend-reference example.
