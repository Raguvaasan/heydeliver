// ============================================
// CASHFREE PAYMENT GATEWAY - BACKEND EXAMPLE
// ============================================
// This is a reference implementation for your backend
// Implement these endpoints in your Node.js/Express backend

import axios from 'axios';
import crypto from 'crypto';

// Configuration
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg';

// ============================================
// 1. CREATE PAYMENT ORDER
// ============================================
app.post('/wallet/create-payment-order', authenticateUser, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is ₹100'
      });
    }

    // Generate unique order ID
    const orderId = `ORDER_${userId}_${Date.now()}`;
    
    // Get user details from database
    const user = await User.findById(userId);
    
    // Create order in your database
    const order = await Order.create({
      orderId,
      userId,
      amount,
      status: 'pending',
      paymentMethod,
      type: 'wallet_recharge'
    });

    // Create Cashfree payment session
    const cashfreeResponse = await axios.post(
      `${CASHFREE_API_URL}/orders`,
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: userId,
          customer_email: user.email,
          customer_phone: user.phone,
          customer_name: user.name
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/admin/wallet/payment-callback?order_id={order_id}`,
          notify_url: `${process.env.BACKEND_URL}/webhook/cashfree`
        }
      },
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        }
      }
    );

    // Save payment session ID
    order.sessionId = cashfreeResponse.data.payment_session_id;
    await order.save();

    res.json({
      success: true,
      orderId: orderId,
      sessionId: cashfreeResponse.data.payment_session_id,
      amount: amount,
      currency: 'INR'
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// ============================================
// 2. VERIFY PAYMENT
// ============================================
app.post('/wallet/verify-payment', authenticateUser, async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    const userId = req.user.id;

    // Find order in database
    const order = await Order.findOne({ orderId, userId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if already processed
    if (order.status === 'completed') {
      return res.json({
        success: true,
        status: 'SUCCESS',
        amount: order.amount
      });
    }

    // Verify payment with Cashfree
    const verifyResponse = await axios.get(
      `${CASHFREE_API_URL}/orders/${orderId}/payments`,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': '2023-08-01'
        }
      }
    );

    const payments = verifyResponse.data;
    const payment = payments.find(p => p.cf_payment_id === paymentId);

    if (payment && payment.payment_status === 'SUCCESS') {
      // Update order status
      order.status = 'completed';
      order.paymentId = paymentId;
      order.completedAt = new Date();
      await order.save();

      // Credit wallet
      await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: order.amount } },
        { upsert: true }
      );

      // Create transaction record
      await Transaction.create({
        userId,
        orderId,
        amount: order.amount,
        type: 'credit',
        status: 'completed',
        description: 'Wallet Recharge',
        paymentMethod: order.paymentMethod,
        paymentId
      });

      res.json({
        success: true,
        status: 'SUCCESS',
        amount: order.amount
      });
    } else {
      // Payment failed
      order.status = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        status: 'FAILED',
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// ============================================
// 3. GET WALLET BALANCE
// ============================================
app.get('/wallet/balance', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wallet = await Wallet.findOne({ userId });
    
    res.json({
      success: true,
      balance: wallet?.balance || 0
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balance'
    });
  }
});

// ============================================
// 4. GET TRANSACTIONS
// ============================================
app.get('/wallet/transactions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments({ userId });

    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// ============================================
// 5. WEBHOOK HANDLER (IMPORTANT!)
// ============================================
app.post('/webhook/cashfree', async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = JSON.stringify(req.body);
    
    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', CASHFREE_CLIENT_SECRET)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).send('Unauthorized');
    }

    const { data } = req.body;
    const { order } = data;
    
    if (order.order_status === 'PAID') {
      const orderId = order.order_id;
      const paymentId = data.payment.cf_payment_id;

      // Find order
      const dbOrder = await Order.findOne({ orderId });
      
      if (!dbOrder) {
        console.error('Order not found:', orderId);
        return res.status(404).send('Order not found');
      }

      // Check if already processed
      if (dbOrder.status === 'completed') {
        return res.status(200).send('Already processed');
      }

      // Update order
      dbOrder.status = 'completed';
      dbOrder.paymentId = paymentId;
      dbOrder.completedAt = new Date();
      await dbOrder.save();

      // Credit wallet
      await Wallet.findOneAndUpdate(
        { userId: dbOrder.userId },
        { $inc: { balance: dbOrder.amount } },
        { upsert: true }
      );

      // Create transaction
      await Transaction.create({
        userId: dbOrder.userId,
        orderId,
        amount: dbOrder.amount,
        type: 'credit',
        status: 'completed',
        description: 'Wallet Recharge',
        paymentMethod: dbOrder.paymentMethod,
        paymentId
      });

    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ============================================
// DATABASE MODELS (MongoDB/Mongoose)
// ============================================

// Order Model
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentMethod: { type: String },
  type: { type: String, default: 'wallet_recharge' },
  sessionId: { type: String },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

const Order = mongoose.model('Order', orderSchema);

// Wallet Model
const walletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const Wallet = mongoose.model('Wallet', walletSchema);

// Transaction Model
const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderId: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'completed' 
  },
  description: { type: String },
  paymentMethod: { type: String },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// ============================================
// MIDDLEWARE
// ============================================
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export { Order, Wallet, Transaction };
