const axios = require('axios');
const AWS = require('aws-sdk');

const getAWSCredentials = async () => {
    const sts = new AWS.STS();
    const data = await sts.getSessionToken().promise();
    return {
        accessKeyId: data.Credentials.AccessKeyId,
        secretAccessKey: data.Credentials.SecretAccessKey,
        sessionToken: data.Credentials.SessionToken
    };
};

module.exports = async (req, res) => {
    try {
        const credentials = await getAWSCredentials();
        const response = await axios.post(
            'https://moxu0s1jnk.execute-api.us-east-1.amazonaws.com/prod-wpm/tts',
            { t: "Aku gak tau sumpah" },
            {
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    "x-amz-date": new Date().toISOString(),
                    "X-Amz-Security-Token": credentials.sessionToken,
                    "Authorization": `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/20250326/us-east-1/execute-api/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-security-token`
                },
                params: {
                    e: "user@naturalreaders.com",
                    l: "0",
                    r: "161",
                    s: "0",
                    v: "ms",
                    vn: "10.4.14.3",
                    sm: "true",
                    lo: "id-ID"
                },
                responseType: 'arraybuffer'
            }
        );

        res.setHeader("Content-Type", "audio/mpeg");
        res.send(Buffer.from(response.data));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};