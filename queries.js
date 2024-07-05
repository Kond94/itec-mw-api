require("dotenv").config({ path: "./.env" });
const { v4: uuid } = require("uuid");

const axios = require("axios");

const makePayment = async (request, response) => {
  const { amount, currency, description } = request.body;
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
    .then((res) => {
      response.status(200).json(res.data);

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
      "https://api.africastalking.com/version1/messaging",
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
      "https://api.africastalking.com/version1/messaging",
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

      console.log(res.data);
    });


};

const SendFarmerRegistrationMessage = async (request, response) => {
  const { phoneNumber, message } = request.body;

  await axios
    .post(
      "https://api.africastalking.com/version1/messaging",
      Object.entries({
        username: "ggem",
        to: phoneNumber,
        message: `${message}`,
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
            "atsk_bbc4f90139bf84a72e5a3c06277cefb39c1da21aa774baa42315e235bdf01300a3df9b70            ",
          Accept: "application/json",
        },
      }
    )
    .then(async (res) => {
      // Handle the response as needed
      response.status(200).json(res.data);

      console.log(res.data);
    });
};

module.exports = {
  makePayment,
  SendBookingSMS,
  SendFarmerRegistrationMessage,
};
