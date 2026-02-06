# 🔧 Wallet API Fix - February 6, 2026

## Issue
The wallet payment creation API was returning **400 Bad Request** error with message "Failed to create payment order".

## Root Cause
The `vercel.json` had a broad rewrite rule that was conflicting with wallet API serverless functions:
```json
{
  "source": "/api/:path*",
  "destination": "https://freightrekapi.vercel.app/:path*"  // ❌ Missing /api prefix
}
```

## Fixes Applied

### 1. ✅ Fixed `vercel.json` Rewrites
**File**: `vercel.json`

**Changed**:
- Removed the broad `/api/:path*` rewrite rule
- Added specific `/api/admin/:path*` rewrite instead
- This ensures wallet API routes use serverless functions, not rewrites

### 2. ✅ Added Validation to `create-payment-order.ts`
**File**: `api/wallet/create-payment-order.ts`

**Added**:
- Input validation for `amount` and `paymentMethod`
- Debug logging to trace requests
- Better error messages with debug info

```typescript
// Validate input
if (!amount || !paymentMethod) {
  return res.status(400).json({ 
    success: false, 
    message: 'Amount and payment method are required',
    debug: { receivedBody: req.body }
  });
}
```

### 3. ✅ Fixed `verify-payment.ts`
**File**: `api/wallet/verify-payment.ts`

**Changed**:
- Now accepts and forwards **both** `orderId` and `paymentId`
- Added validation for both fields
- Backend requires both parameters per documentation

**Before**:
```typescript
const { orderId } = req.body;
```

**After**:
```typescript
const { orderId, paymentId } = req.body;

if (!orderId || !paymentId) {
  return res.status(400).json({ 
    success: false, 
    message: 'Order ID and payment ID are required' 
  });
}
```

### 4. ✅ Created `transactions.ts` Endpoint  
**File**: `api/wallet/transactions.ts` (NEW)

**Added**:
- New proxy endpoint for fetching wallet transactions
- Supports pagination (page, limit)
- Supports filtering by type (credit/debit)
- Forwards query parameters correctly

### 5. ✅ Enhanced Error Handling in Store
**File**: `src/store/walletStore.ts`

**Added**:
- Console logging for debugging
- Frontend validation before API call
- Better error messages

```typescript
// Validate amount
if (!amount || amount <= 0) {
  throw new Error('Invalid amount')
}

if (!paymentMethod) {
  throw new Error('Payment method is required')
}
```

## How Wallet API Now Works

### Request Flow
```
Frontend → /api/wallet/* → Serverless Function → Backend API
```

1. **Frontend** calls `/api/wallet/create-payment-order`
2. **Vercel Serverless Function** (`api/wallet/create-payment-order.ts`) receives request
3. Function validates and forwards to backend: `https://freightrekapi.vercel.app/api/wallet/create-payment-order`
4. Backend processes and returns response
5. Serverless function returns response to frontend

### Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/wallet/balance` | GET | Get wallet balance |
| `/api/wallet/create-payment-order` | POST | Create Cashfree payment order |
| `/api/wallet/verify-payment` | POST | Verify payment after completion |
| `/api/wallet/transactions` | GET | Get transaction history |

## Deployment Steps

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "fix: wallet API routing and validation issues"
   git push
   ```

2. **Vercel will auto-deploy** (connected to GitHub)

3. **Verify Deployment**:
   - Check Vercel dashboard for successful deployment
   - Test wallet add money flow

## Testing Checklist

Once deployed, test the following:

- [ ] ✅ Open wallet page: `https://heydeliver.vercel.app/admin/wallet/add`
- [ ] ✅ Enter amount (e.g., 500)
- [ ] ✅ Select payment type (UPI or Card)
- [ ] ✅ Click "Proceed To Payment"
- [ ] ✅ Check browser console for logs:
  - "Creating payment order: {amount, paymentMethod}"
  - "Payment order response: {...}"
- [ ] ✅ Should redirect to Cashfree payment page
- [ ] ✅ Complete test payment (use Cashfree sandbox)
- [ ] ✅ Verify payment and check balance update

## Debug Checklist

If issues persist:

1. **Check Browser Console**:
   - Open DevTools → Console
   - Look for error messages
   - Check network tab for failed requests

2. **Check Vercel Logs**:
   - Go to Vercel Dashboard
   - Select your project
   - Click "Logs" tab
   - Look for console.log output from serverless functions

3. **Verify Token**:
   - Open DevTools → Application → Session Storage
   - Check if `authToken` exists
   - Try logging out and logging back in

4. **Test Backend Directly**:
   ```bash
   curl --location 'https://freightrekapi.vercel.app/api/wallet/create-payment-order' \
   --header 'Content-Type: application/json' \
   --header 'Authorization: Bearer YOUR_TOKEN' \
   --data '{
     "amount": 500,
     "paymentMethod": "upi"
   }'
   ```

## Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `vercel.json` | Modified | Remove conflicting rewrite rule |
| `api/wallet/create-payment-order.ts` | Modified | Add validation & logging |
| `api/wallet/verify-payment.ts` | Modified | Add paymentId parameter |
| `api/wallet/transactions.ts` | Created | New transaction history endpoint |
| `src/store/walletStore.ts` | Modified | Add validation & logging |

## Expected Behavior After Fix

### Before (Error):
```json
{
  "success": false,
  "message": "Failed to create payment order"
}
```

### After (Success):
```json
{
  "success": true,
  "orderId": "ORDER_USER123_1738568400000",
  "sessionId": "session_abc123xyz",
  "amount": 500,
  "currency": "INR"
}
```

## Next Steps

1. ✅ **Deploy to Vercel** (push to GitHub)
2. ✅ **Test wallet flow** end-to-end
3. ✅ **Monitor logs** for any new errors
4. ✅ **Update backend team** if issues persist

---

**Fixed by**: GitHub Copilot  
**Date**: February 6, 2026  
**Status**: Ready for deployment ✅
