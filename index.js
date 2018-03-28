/*
 * Note: I wrote this in an hour when I was cold and didn't want to get out of bed.
 * Opened the app, was curious how it worked and came up with this.
 * Specific to my setup but required changes should be minimal!
 */

// Setup
const request = require('request-promise').defaults({ method:'POST', jar: true, json: true });
const express = require('express');
const app = express();
const climote_user = process.env.CLIMOTE_UNIT;
const climote_pass = process.env.CLIMOTE_CODE;
const climote_apikey = process.env.CLIMOTE_API_KEY;
const climote_email = process.env.CLIMOTE_EMAIL;
const socket = process.env.socket;

const BASE_URL = 'https://climote.climote.ie'
const LOGIN_URL = `${BASE_URL}/api/login`
const BOOST_URL = `${BASE_URL}/api/boost`
const STATUS_URL = `${BASE_URL}/api/get-status`
const TRANSACTION_STATUS_URL = `${BASE_URL}/api/status`


// Application Logic
let login = async() => {
  let req_body = {
    pincode: climote_pass,
    unitnumber: climote_user,
    apikey: climote_apikey,
    email: climote_email
  }

  let resp = await request({
    url: LOGIN_URL,
    form: req_body
  });

  let { token } = resp;
  token = Buffer.from(":" + token).toString("base64");
  let Authorization = `Basic ${token}`
  Authorization = { Authorization }
  return Authorization;
}

let boost = (headers, form) => request({ url: BOOST_URL, headers, form })
let transaction_status = (headers, form) => request({ url: TRANSACTION_STATUS_URL, headers, form });
let status = (headers, form) => request({ url: STATUS_URL, headers, form})

let task_transaction_status = async(transactionid) => {
  let Authorization = await login();
  return transaction_status(Authorization, transactionid);
}

let task_boost = async(time) => {
  let Authorization = await login();
  let data = `[[1, ${time}]]`;
}

let task_status = async() => {
  let Authorization = await login();
  console.log(Authorization)
  return status(Authorization);
}

// API Endpoints
app.use(express.static(`${__dirname}/static`));

app.get('/status', async(req, res) => {
  res.send(await task_status());
})

app.get('/boost', async(req, res) => {
  res.send(await task_boost(req.query.boost));
})

// Listen to socket
app.listen(socket)
