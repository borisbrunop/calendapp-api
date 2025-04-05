// server.js
require("dotenv").config(); // Load environment variables from .env file
const axios = require('axios');
const crypto = require('crypto');
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
var models = initModels(sequelize);

const binanceApiUrl = 'https://api.binance.com'; // Use https://testnet.binance.vision for testnet
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;

// --- Helper function to create signed Binance API requests ---
const createSignedRequest = async (endpoint, params = {}) => {
    const timestamp = Date.now();
    const queryString = new URLSearchParams({ ...params, timestamp }).toString();
  
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
  
    const url = `${binanceApiUrl}${endpoint}?${queryString}&signature=${signature}`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Binance API Error:", error.response?.data || error.message);
      // Throw a more specific error to be caught by the route handler
      throw new Error(error.response?.data?.msg || 'Failed to fetch from Binance API');
    }
  };

const check_binance_donation = async (params) => {
    try{
        const endTime = Date.now();
        const startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    
        // const depositHistory = await createSignedRequest('/sapi/v1/capital/deposit/hisrec', {
        const depositHistory = await createSignedRequest('/sapi/v1/pay/transactions', {
          asset: params.asset.toUpperCase(), // Ensure asset is uppercase
        //   status: 1, // 0:pending, 6: credited but cannot withdraw, 1:success
          startTime: startTime,
          endTime: endTime,
          // limit: 500 // You can adjust the limit
        });


        if(depositHistory?.data){
            const find_donation = depositHistory?.data.find((d) => d.orderId === params.orderId && d.amount === params.amount.toString() )   
            if(find_donation) return find_donation
            return false
        }
        return {error: true}
    }catch(err){
        console.log("ERROR check_binance_donation", err)
        return ({error: true, message: err})
    }
}



module.exports = { check_binance_donation };
