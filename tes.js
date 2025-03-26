const axios = require("axios");
const AWS = require("aws-sdk");
const crypto = require("crypto");

AWS.config.update({ region: "us-east-1" });

async function generateSignature(credentials, requestDate, canonicalRequest) {
  function hmac(key, data) {
    return crypto.createHmac("sha256", key).update(data).digest();
  }
  
  function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = hmac("AWS4" + key, dateStamp);
    const kRegion = hmac(kDate, regionName);
    const kService = hmac(kRegion, serviceName);
    return hmac(kService, "aws4_request");
  }
  
  const stringToSign = `AWS4-HMAC-SHA256
${requestDate}T000000Z
${requestDate}/us-east-1/execute-api/aws4_request
${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;
  
  const signingKey = getSignatureKey(credentials.secretAccessKey, requestDate, "us-east-1", "execute-api");
  return crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
}

module.exports = async (req, res) => {
  try {
    const credentials = AWS.config.credentials;
    
    if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
      throw new Error("AWS credentials are not available.");
    }
    
    const requestDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const host = "moxu0s1jnk.execute-api.us-east-1.amazonaws.com";
    const endpoint = `https://${host}/prod-wpm/tts`;
    
    const queryParams = `e=user%40naturalreaders.com&l=0&r=161&s=0&v=ms&vn=10.4.14.3&sm=true&lo=id-ID`;
    const payload = JSON.stringify({ t: "Aku gak tau sumpah" });
    
    const canonicalRequest = `POST
/prod-wpm/tts
${queryParams}
content-type:application/json; charset=UTF-8
host:${host}
x-amz-date:${requestDate}T000000Z
x-amz-security-token:${credentials.sessionToken}

content-type;host;x-amz-date;x-amz-security-token
${crypto.createHash("sha256").update(payload).digest("hex")}`;
    
    const signature = await generateSignature(credentials, requestDate, canonicalRequest);
    
    const headers = {
      "Content-Type": "application/json; charset=UTF-8",
      "x-amz-date": `${requestDate}T000000Z`,
      "X-Amz-Security-Token": credentials.sessionToken,
      Authorization: `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${requestDate}/us-east-1/execute-api/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-security-token, Signature=${signature}`,
    };
    
    const response = await axios.post(endpoint, payload, {
      headers,
      params: {
        e: "user@naturalreaders.com",
        l: "0",
        r: "161",
        s: "0",
        v: "ms",
        vn: "10.4.14.3",
        sm: "true",
        lo: "id-ID",
      },
      responseType: "arraybuffer",
    });
    
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};