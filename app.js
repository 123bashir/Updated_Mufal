import express from "express";
import cors from "cors";
import mysql2 from"mysql2"
import cookieParser from "cookie-parser"; 
import authRoute from "./routes/auth.route.js";
import axios from"axios"
import testRoute from "./routes/test.route.js";  
import userRoute from "./routes/user.route.js";
  
const app = express();
import dotenv from "dotenv" 

dotenv.config();

// Update CORS configuration to allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8082',
  'http://localhost:8083',
  // Add any other origins you need
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); 
const db=mysql2.createConnection({
  host: process.env.Database_host,
  user:  process.env.Database_user,
  password:  process.env.Database_password,
  database:  process.env.Database
})
const apiKey = process.env.MonnifyApi; 
const secretKey = process.env.MonnifySecret;   
const authToken = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

app.post('/api/initiate-payment', async (req, res) => {
  const paymentData = req.body;

  // Validate and format URLs
  try {
    // Ensure URLs are properly formatted
    const baseUrl = 'http://localhost:5173'; // Your frontend URL
    
    const formattedPaymentData = {
      ...paymentData,
      redirectUrl: new URL(paymentData.redirectUrl, baseUrl).toString(),
      incomingPageUrl: new URL(paymentData.incomingPageUrl, baseUrl).toString()
    };

    console.log('Formatted payment data:', formattedPaymentData);

    const response = await axios.post(
      'https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction',
      formattedPaymentData,
      {
        headers: {
          Authorization: `Basic ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Log successful response
    console.log('Monnify response:', response.data);
    res.json(response.data);

  } catch (error) {
    console.error('Error initiating payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ 
      message: 'Payment initiation failed', 
      error: error.response?.data || error.message,
      details: 'Please ensure all URLs are properly formatted'
    });
  }
});

// // Function to verify Monnify signature
// function verifyMonnifySignature(req) {
//   const monnifySignature = req.headers['monnify-signature'];
//   const calculatedSignature = crypto.createHmac('sha512', process.env.Secret_Key)
//     .update(JSON.stringify(req.body))
//     .digest('hex');

//   return monnifySignature === calculatedSignature; 
// }

app.post('/api/fund/webhook', (req, res) => {
  const transactionInfo = req.body;

  // const { paymentReference, amountPaid, customer: { email }, paymentStatus } = transactionInfo;
   const amountPaid=transactionInfo.responseBody.amountPaid  
  const email=transactionInfo.responseBody.customer.email 
    const paymentStatus=transactionInfo.responseBody.paymentStatus  
 
  if (paymentStatus === 'PAID') {

    db.query(`SELECT * FROM customer WHERE email = ?`, [email], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Database error'); 
      }

 
      if (result.length > 0) {
        const user = result[0];

        const newBalance = parseFloat(user.Price) + parseFloat(amountPaid); 
        db.query(`UPDATE customer SET Price = ? WHERE email = ?`, [newBalance, email], (err) => {
          if (err) {
            console.error('Error updating balance:', err);
            return res.status(500).send('Failed to update balance');
          }

          return res.status(200).json(newBalance);
        });
      } else {
        console.error('User not found'); 
        return res.status(404).send('User not found');
      }
    });
  } else { 
    console.error('Payment failed or not completed');
    return res.status(400).send('Payment not successful');
  }  
});      

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);    

app.use("/api/test", testRoute); 

// Add this new endpoint for verification
app.post('/api/verify-payment', async (req, res) => {
  const { transactionReference } = req.body;

  try {
    // First get an access token from Monnify
    const authResponse = await axios.post(
      'https://sandbox.monnify.com/api/v1/auth/login',
      {},
      {
        headers: {
          Authorization: `Basic ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const accessToken = authResponse.data.responseBody.accessToken;

    // Use the access token to verify the transaction
    const verifyResponse = await axios.get(
      `https://sandbox.monnify.com/api/v2/transactions/${transactionReference}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const transactionStatus = verifyResponse.data.responseBody.paymentStatus;
    const amountPaid = verifyResponse.data.responseBody.amountPaid;
    const customerEmail = verifyResponse.data.responseBody.customer.email;

    // If payment is successful, update user's wallet
    if (transactionStatus === 'PAID') {
      db.query(`SELECT * FROM customer WHERE email = ?`, [customerEmail], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
          });
        }

        if (result.length > 0) {
          const user = result[0];
          const newBalance = parseFloat(user.Price) + parseFloat(amountPaid);

          db.query(
            `UPDATE customer SET Price = ? WHERE email = ?`, 
            [newBalance, customerEmail], 
            (updateErr) => {
              if (updateErr) {
                console.error('Error updating balance:', updateErr);
                return res.status(500).json({
                  success: false,
                  message: 'Failed to update balance'
                });
              }

              return res.status(200).json({
                success: true,
                message: 'Payment verified and balance updated',
                data: {
                  newBalance,
                  transactionReference,
                  amountPaid
                }
              });
            }
          );
        } else {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: transactionStatus
      });
    }

  } catch (error) {
    console.error('Verification Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data || error.message
    });
  }
});

app.listen(8800, () => {
  console.log("Server is running at port 8800!");
});
