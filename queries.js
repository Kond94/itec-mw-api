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

  try {
    const res = await axios.post(
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
            "atsk_bbc4f90139bf84a72e5a3c06277cefb39c1da21aa774baa42315e235bdf01300a3df9b70",
          Accept: "application/json",
        },
      }
    );

    console.log(res.data);

    // Check the response status and return appropriate response
    if (res.data.SMSMessageData.Recipients[0].status === "Success") {
      response.status(200).json({
        success: true,
        message: "SMS sent successfully",
        data: res.data,
      });
    } else {
      response.status(400).json({
        success: false,
        message:
          "Failed to send SMS" + res.data.SMSMessageData.Recipients[0].status,
        error: res.data.SMSMessageData.Recipients[0].status,
      });
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    response.status(500).json({
      success: false,
      message: "An error occurred while sending the SMS",
      error: error.message,
    });
  }
};

const getStatusMessage = (statusCode) => {
  const statusMessages = {
    100: "Message processed successfully",
    101: "Message sent successfully",
    102: "Message queued for delivery",
    401: "Message held due to risk assessment",
    402: "Invalid sender ID provided",
    403: "Invalid phone number format",
    404: "Unsupported number type",
    405: "Insufficient balance to send message",
    406: "Recipient is in blacklist",
    407: "Could not route message to recipient",
    409: "Message rejected due to Do Not Disturb settings",
    500: "Internal server error occurred",
    501: "Gateway error occurred",
    502: "Message rejected by gateway",
  };
  return statusMessages[statusCode] || "Unknown status";
};

const sendSingleSMS = async (request, response) => {
  const { phoneNumber, message, from } = request.body;

    const res = await axios.post(
      "https://api.africastalking.com/version1/messaging",
      Object.entries({
        username: process.env.AT_USERNAME,
        to: phoneNumber,
        message: message,
        from: from || undefined,
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
          apiKey: process.env.AT_API_KEY,
          Accept: "application/json",
        },
      }
    );

    const recipient = res.data.SMSMessageData.Recipients[0];
    const statusCode = recipient.statusCode;

    return response.status(200).json({
      success: statusCode < 400 ? true : false,
      message: getStatusMessage(statusCode),
      data: {
        phoneNumber: recipient.number,
        status: recipient.status,
        cost: recipient.cost,
        statusCode: statusCode,
        statusMessage: getStatusMessage(statusCode),
      },
    });

};

const sendBulkSMS = async (request, response) => {
  const { phoneNumbers, message, from } = request.body;

  if (!Array.isArray(phoneNumbers)) {
    return response.status(200).json({
      success: false,
      message: "Invalid request format",
      data: {
        error: "phoneNumbers must be an array",
        statusCode: 400,
        statusMessage: "Bad Request",
      },
    });
  }

  try {
    const res = await axios.post(
      "https://api.africastalking.com/version1/messaging/bulk",
      Object.entries({
        username: process.env.AT_USERNAME,
        to: phoneNumbers.join(","),
        message: message,
        from: from || undefined,
        bulkSMSMode: 1,
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
          apiKey: process.env.AT_API_KEY,
          Accept: "application/json",
        },
      }
    );

    const results = res.data.SMSMessageData.Recipients.map((recipient) => ({
      phoneNumber: recipient.number,
      status: recipient.status,
      messageId: recipient.messageId,
      cost: recipient.cost,
      statusCode: recipient.statusCode,
      statusMessage: getStatusMessage(recipient.statusCode),
    }));

    const hasErrors = results.some((result) => result.statusCode >= 400);

    return response.status(200).json({
      success: !hasErrors,
      message: res.data.SMSMessageData.Message,
      data: {
        summary: {
          total: results.length,
          successful: results.filter((r) => r.statusCode < 400).length,
          failed: results.filter((r) => r.statusCode >= 400).length,
        },
        messages: results,
      },
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      message: "Bulk SMS processing failed",
      data: {
        error: error.response?.data || error.message,
        statusCode: error.response?.status || 500,
        statusMessage: getStatusMessage(error.response?.status || 500),
      },
    });
  }
};


module.exports = {
  makePayment,
  SendBookingSMS,
  SendFarmerRegistrationMessage,
  sendSingleSMS,
  sendBulkSMS,
};