import crypto from"crypto";

// Function to verify Monnify's webhook signature
function verifyMonnifySignature(req) {
  const monnifySignature = req.headers['monnify-signature']; // Signature from Monnify's request headers
  const requestBody = JSON.stringify(req.body); // Request body as string
  
  // Monnify secret key (replace with your actual secret key)
  const secretKey = 'LSGV28Q2ND84GGCZHDV2W7N03ZEERZ09';

  // Create HMAC SHA512 hash using the request body and secret key 
  const hash = crypto.createHmac('sha512', secretKey).update(requestBody).digest('hex');
 
  // Compare the generated hash with Monnify's signature
  return hash === monnifySignature;
}
export default  verifyMonnifySignature ;
