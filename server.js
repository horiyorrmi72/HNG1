require("dotenv").config();
const express = require("express");
const geoip = require("geoip-lite");
const axios = require("axios");
const requestIp = require("request-ip");
const weatherKey = process.env.WEATHER_KEY;
const ipApiKey = process.env.IP_API_KEY;
const port = process.env.port || 4005;
const app = express();


app.use(requestIp.mw());

app.get("/", (req, res) => {
  return res.status(200).json({ msg: "Welcome HNG!" });
});
app.get("/api/hello", async (req, res) => {
  try {
    const visitorName = req.query.visitorName;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
    const geoLocationDetails = geoip.lookup(clientIp);
    let location;
    if (
      (geoLocationDetails && geoLocationDetails.city)
    ) {
      location = geoLocationDetails.city;
    } else {
      const locationPayload = await axios.get(
        `https://api.ipapi.com/${clientIp}?access_key=${ipApiKey}`
      );
        location = locationPayload.data.city || "could not get location details";
    }
    const weatherPayload = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${weatherKey}&q=${location}`
    );
    const temperature = weatherPayload.data.current.temp_c;

    const greeting = `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}`;
    console.log(req.headers);
    return res.status(200).json({
      client_ip: clientIp,
      location,
      greeting,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Internal Server Error!🐛",
      status: "Warning ⚠️",
      Error: err.message,
    });
  }
});

app.listen(port, '0.0.0.0',(err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log(`Server running .........🏃‍♂️  on port ${port}`);
  }
});
