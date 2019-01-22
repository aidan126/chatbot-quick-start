const ex1 = function(sender_psid, received_message) {
  let response;

  console.log("call ex");

  if (received_message.attachments) {
    // console.log(typeof received_message.attachments);

    // traverse all attachments
    for (var i = 0; i < received_message.attachments.length; i++) {
      let attach = received_message.attachments[i];
      // console.log(received_message.attachments[i]);

      //  processing audio attachments
      if (attach.type == "audio") {
        // audio to text processing

        console.log("audio");
      } else if (attach.type == "image") {
        console.log("image");
      } else {
        console.log("else");
      }
    }
  }
  // console.log(received_message.attachments.length);
  // console.log(received_message.attachments[0]);

  /*
  // Checks if the message contains text
  if (received_message.text) {
    response = {
      text: `text`
    };
  } else if (received_message.attachments) {
    // traverse attatchments array , check types
    received_message.attachments.forEach(obj => {
      if (obj.type == "audio") console.log("audio");
      else console.log("else");
    });

    response = {
      text: `audio`
    };
  }

  // Send the response message
  callSendAPI(sender_psid, response);

  */
};

const noResponseIn10s = function(response_time) {
  setTimeout(function() {
    console.log("after 10s no response resend");
    return true;
  }, 10000);

  return false;
};

module.exports = {
  ex1: ex1
};
