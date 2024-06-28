require("dotenv").config({ path: "./.env" });
const { v4: uuid } = require("uuid");

const axios = require("axios");

const makePayment = async (request, response) => {
  const { amount, currency, description, name, bookingType, phone, email } =
    request.body;
  var uname = process.env.NBM_PAYMENT_USERNAME;
  var pass = process.env.NBM_PAYMENT_PASS;
  let base64 = require("base-64");
  await axios
    .post(
      "https://nbm.gateway.mastercard.com/api/rest/version/72/merchant/MALAWISUN01/session",
      {
        apiOperation: "INITIATE_CHECKOUT",
        interaction: {
          operation: "PURCHASE",
          cancelUrl: "https://www.malawisunhotel.com",
          merchant: {
            name: "Malawi Sun Hotel",
          },
          displayControl: {
            billingAddress: "HIDE",
            customerEmail: "HIDE",
          },
        },
        order: {
          amount: amount,
          currency: currency,
          id: uuid(),
          description: description,
        },
      },
      {
        headers: {
          Authorization: "Basic " + base64.encode(uname + ":" + pass),
        },
      }
    )
    .then(async (res) => {
      // Handle the response as needed
      console.log("Response:", response.data);

      res.status(200).json({ message: "POST request successful" });

      console.log(res.data);
    });
};

const SendBookingSMS = async (request, response) => {
  const {
    phone,
    name,
    email,
    bookingType,
    bookingDetail,
    adults = false,
    children = false,
    participants = false,
    quotedAmount,
  } = request.body;



  await axios
    .post(
      "https://nbm.gateway.mastercard.com/api/rest/version/72/merchant/MALAWISUN01/session",
      Object.entries({
        username: "mwsun",
        to: "+265998681991",
        message: `New Booking alert! Name: ${name}, Phone: ${phone}, Email: ${email}, Booking Type: ${bookingType} - ${bookingDetail}, ${
          adults ? "Adults: " + adults : ""
        }, ${children ? "Children: " + children : ""}, ${
          participants ? "Participants: " + participants : ""
        }, Quoted: ${quotedAmount}`,
        enqueue: 1,
      })
        .map(
          ([key, value]) =>
            encodeURIComponent(key) + "=" + encodeURIComponent(value)
        )
        .join("&"),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          apiKey:
            "atsk_65683cfb065f61c6427f03c11d72a67b1a62ca3d6673aef9f0f72d7fa0d1bf77adaf55eb",
          Accept: "application/json",
        },
      }
    )
    .then(async (res) => {
      // Handle the response as needed

      console.log(res.data);
    });

  await axios
    .post(
      "https://nbm.gateway.mastercard.com/api/rest/version/72/merchant/MALAWISUN01/session",
      Object.entries({
        username: "mwsun",
        to: phone,
        message: `Dear ${name} Thank you for making a booking with Malawi Sun Hotel. Our team will be in contact shortly`,
        enqueue: 1,
      })
        .map(
          ([key, value]) =>
            encodeURIComponent(key) + "=" + encodeURIComponent(value)
        )
        .join("&"),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          apiKey:
            "atsk_65683cfb065f61c6427f03c11d72a67b1a62ca3d6673aef9f0f72d7fa0d1bf77adaf55eb",
          Accept: "application/json",
        },
      }
    )
    .then(async (res) => {
      // Handle the response as needed
      console.log("Response:", response.data);

      res.status(200).json({ message: "POST request successful" });

      console.log(res.data);
    });

  await fetch(
    "https://api.africastalking.com/version1/messaging",
    customerSmsOptions
  ).then((response) => console.log(response));
  await fetch(
    "https://api.africastalking.com/version1/messaging",
    hotelSmsOptions
  ).then((response) => console.log(response));
};

module.exports = {
  makePayment,
  SendBookingSMS,
};
