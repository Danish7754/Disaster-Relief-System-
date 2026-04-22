const axios = require("axios");

async function geocodeAddress(address) {
    const apiKey = process.env.GEOCODE_API_KEY; // .env file se API key le raha hai
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

  const response = await axios.get(url, { timeout: 5000 });
  const data = response.data;

  if (data.results.length === 0) {
    throw new Error("Location not found");
  }

  const { lat, lng } = data.results[0].geometry;
  return { lat, lng };
}

module.exports =  geocodeAddress;