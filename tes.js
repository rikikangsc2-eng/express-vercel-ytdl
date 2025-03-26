const axios = require("axios");
const AWS = require("aws-sdk");

AWS.config.credentials = new AWS.EnvironmentCredentials("AWS");

async function getAWSCredentials() {
  const sts = new AWS.STS();
  const data = await sts.getSessionToken().promise();
  return {
    accessKeyId: data.Credentials.AccessKeyId,
    secretAccessKey: data.Credentials.SecretAccessKey,
    sessionToken: data.Credentials.SessionToken,
  };
}

async function generateSignature(credentials, requestDate) {
  const crypto = require("crypto");
  const region = "us-east-1";
  const service = "execute-api";
  const credentialScope = `${requestDate}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256
${requestDate}T000000Z
${credentialScope}
${crypto.createHash("sha256").update("").digest("hex")}`;
  
  function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = crypto.createHmac("sha256", "AWS4" + key).update(dateStamp).digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(regionName).digest();
    const kService = crypto.createHmac("sha256", kRegion).update(serviceName).digest();
    return crypto.createHmac("sha256", kService).update("aws4_request").digest();
  }
  
  const signingKey = getSignatureKey(credentials.secretAccessKey, requestDate, region, service);
  return crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
}

module.exports = async (req, res) => {
  try {
    const credentials = await getAWSCredentials();
    const requestDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const signature = await generateSignature(credentials, requestDate);
    
    const headers = {
      "Content-Type": "application/json; charset=UTF-8",
      "x-amz-date": `${requestDate}T000000Z`,
      "X-Amz-Security-Token": credentials.sessionToken,
      Authorization: `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${requestDate}/us-east-1/execute-api/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-security-token, Signature=${signature}`,
    };
    
    const payload = { t: "Aku gak tau sumpah" };
    const queryParams = {
      e: "user@naturalreaders.com",
      l: "0",
      r: "161",
      s: "0",
      v: "ms",
      vn: "10.4.14.3",
      sm: "true",
      lo: "id-ID",
    };
    
    const url = "https://moxu0s1jnk.execute-api.us-east-1.amazonaws.com/prod-wpm/tts";
    const response = await axios.post(url, payload, { headers, params: queryParams, responseType: "arraybuffer" });
    
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};