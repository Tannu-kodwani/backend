const express = require("express");
const paymentRouter = express.Router();
const { createOrder, verifyPayment, getRazorpayKey } = require("../Controller/payment.controller");

// Route to create order
paymentRouter.post("/create-order", createOrder);

// Route to verify payment
paymentRouter.post("/verify-payment", verifyPayment);

// Route to get Razorpay key for frontend
paymentRouter.get("/get-key", getRazorpayKey);

module.exports = paymentRouter;

// Frontend code to integrate the razorpay:

// // Step 1: Create order
// async function initiatePayment(amount) {
//     const response = await fetch('/api/payment/create-order', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount: amount })
//     });
    
//     const data = await response.json();
    
//     if (data.success) {
//         // Step 2: Get Razorpay key
//         const keyResponse = await fetch('/api/payment/get-key');
//         const keyData = await keyResponse.json();
        
//         // Step 3: Open Razorpay checkout
//         const options = {
//             key: keyData.key,
//             amount: data.order.amount,
//             currency: data.order.currency,
//             name: "Your Business Name",
//             description: "Payment for order",
//             order_id: data.order.id,
//             handler: async function (response) {
//                 // Step 4: Verify payment
//                 const verifyResponse = await fetch('/api/payment/verify-payment', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                         razorpay_order_id: response.razorpay_order_id,
//                         razorpay_payment_id: response.razorpay_payment_id,
//                         razorpay_signature: response.razorpay_signature
//                     })
//                 });
                
//                 const verifyData = await verifyResponse.json();
                
//                 if (verifyData.success) {
//                     alert("Payment successful!");
//                 } else {
//                     alert("Payment verification failed!");
//                 }
//             }
//         };
        
//         const razorpay = new Razorpay(options);
//         razorpay.open();
//     }
// }
