import express, { json } from "express";
import Razorpay from "razorpay";
import cors from "cors";
import { createHmac } from "crypto";

const app = express();

app.use(cors());
app.use(json());

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: "rzp_test_SYbzrhN8I7J6mg",
    key_secret: "lMdmL93Or91AWwVEgIA8rE5N"
});

// ✅ Route to create an order
app.post("/create-order", async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100, // Amount in paisa (INR)
            currency: currency,
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Route to verify payment signature
app.post("/verify-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated_signature = createHmac("sha256", "lMdmL93Or91AWwVEgIA8rE5N")
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
        
    if (generated_signature === razorpay_signature) {
        res.json({ success: true, message: "Payment verified successfully" });
    } else {
        res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
});

// Start the server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
