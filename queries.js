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
      "https://test-nbm.mtf.gateway.mastercard.com/api/rest/version/72/merchant/MALAWISUN01/session",
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

module.exports = {
  makePayment,
};
