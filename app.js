/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

"use strict";
require("dotenv").config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const pin = require("./process_in.js");
// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  app = express().use(body_parser.json()); // creates express http server

var fs = require("fs");
var path = require("path");

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

app.use(function(req, res, next) {
  req.start = new Date().getTime();
  console.log(req.start);
  next();
});

// route  here

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  // Return a '200 OK' response to all events
  res.status(200).send("EVENT_RECEIVED");

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    body.entry.forEach(function(entry) {
      // Gets the body of the webhook event
      console.log(entry);
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      //   console.log("Sender ID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        pin.ex1(sender_psid, webhook_event.message);
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get("/webhook", (req, res) => {
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;
  let formData;
  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API

    if (received_message.text == "audio") {
      var filepath = path.join(__dirname, "output.mp3");
      console.log(filepath);
      // fs.readFile(filepath, function(err, data) {
      //   if (err) throw err;
      //   console.log("ok");
      // });
      let type = "audio";
      formData = sendAttachment(sender_psid, filepath, type);
    } else {
      response = {
        text: `You sent the message: "${
          received_message.text
        }". Now send me an attachment!`
      };
    }
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this the right picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachment_url,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes"
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no"
                }
              ]
            }
          ]
        }
      }
    };
  }

  // Send the response message
  callSendAPI(sender_psid, response, formData);
}

function handlePostback(sender_psid, received_postback) {
  console.log("enter handle postback function");
  let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  if (payload === "get_started") {
    response = {
      text: "Hello!"
    };
    callSendAPI(sender_psid, response);
  }
  if (payload === "yes") {
    // Set the response based on the postback payload
    response = { text: "Thanks!" };
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response, attatchment) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  };

  if (attatchment) request_body = true;

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
      formData: attatchment
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!\n");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

function callSendAPIAttachment(messageData, formData) {
  // // Construct the message body
  // let request_body = {
  //   recipient: {
  //     id: sender_psid
  //   },
  //   message: response
  // };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageData,
      formData: formData
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!\n");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

function sendAttachment(sender_psid, fileName, type) {
  var fileReaderStream = fs.createReadStream(fileName);
  var formData = {
    recipient: JSON.stringify({
      id: sender_psid
    }),
    message: JSON.stringify({
      attachment: {
        type: type,
        payload: {
          is_reusable: false
        }
      }
    }),
    filedata: fileReaderStream
  };
  return formData;
}
