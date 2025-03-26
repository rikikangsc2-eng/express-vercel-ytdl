const axios = require("axios");
const crypto = require("crypto");
module.exports = async (req, res) => {
  const task_id = crypto.randomUUID();
  const baseURL = "https://magichour.ai";
  try {
    await axios.post(
      `${baseURL}/api/free-tools/v1/ai-image-generator`,
      {
        prompt: "Girl sitting on bed",
        orientation: "square",
        tool: "ai-anime-generator",
        task_id: task_id
      },
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "x-timezone-offset": "-420",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36"
        }
      }
    );
    const poll = async () => {
      const statusResponse = await axios.get(
        `${baseURL}/api/free-tools/v1/ai-image-generator/${task_id}/status`,
        {
          headers: {
            Accept: "application/json, text/plain, */*",
            "x-timezone-offset": "-420",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36"
          }
        }
      );
      if (statusResponse.data.status === "SUCCESS") {
        return statusResponse.data;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await poll();
    };
    const result = await poll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};