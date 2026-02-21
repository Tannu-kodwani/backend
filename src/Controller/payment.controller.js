const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config({
    path:"./.env"
});

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order
const createOrder = async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;

        // Validate required fields
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required"
            });
        }

        // Create order options
        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: currency || 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {}
        };

        // Create order using Razorpay API
        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            order: order
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Verify Payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            });
        }

        // Create signature for verification
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // Compare signatures
        if (razorpay_signature === expectedSign) {
            // Payment is verified - You can save to database here
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid signature - Payment verification failed"
            });
        }

    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Get Razorpay Key (for frontend)
const getRazorpayKey = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Error fetching key:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = { createOrder, verifyPayment, getRazorpayKey };
