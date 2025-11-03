const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

// Vercel Serverless Function entry point
module.exports = async (req, res) => {
  const targetUrl = "https://repetify.lorenzboss.com/users/sign_in";
  const proxyUrl = process.env.WEBSHARE_PROXY_URL; // Set in Vercel Env Variables

  if (!proxyUrl) {
    console.error("Error: WEBSHARE_PROXY_URL is not set.");
    return res.status(500).send("Proxy configuration missing.");
  }

  try {
    // 1. Configure the proxy agent
    const httpsAgent = new HttpsProxyAgent(proxyUrl);

    console.log(`Pinging ${targetUrl} via proxy...`);

    // 2. Make the GET request
    const response = await axios.get(targetUrl, {
      httpsAgent: httpsAgent,
      proxy: false, // Use only the agent
      maxRedirects: 5, // Follow redirects
      validateStatus: (status) => status >= 200 && status < 503,
    });

    // 3. Log the result
    const status = response.status;
    console.log(`PING SUCCESS: Status ${status} from ${targetUrl}`);

    // 4. Send success response to Vercel
    res.status(200).send(`Ping successful: Status ${status}`);
  } catch (error) {
    let status = "ERROR";
    if (error.response) {
      status = error.response.status;
      console.error(`PING FAILED: Status ${status} from ${targetUrl}`);
    } else {
      console.error("PING FAILED: Network or general error", error.message);
    }

    // 5. Send error response to Vercel
    res.status(500).send(`Ping failed: Status ${status}`);
  }
};
