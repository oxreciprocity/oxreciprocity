// Import dependencies and set up http server
import { Router } from 'express';
import bodyParser from 'body-parser';
const { json, urlencoded } = bodyParser;
import crypto from 'crypto';
import MessengerApi from '../services/TEST_messengerService.js';

const router = Router();

// Utility function for verifying the request signature
function verifyRequestSignature(req, res, buf) {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
  } else {
    const elements = signature.split('=');
    const signatureHash = elements[1];
    const expectedHash = crypto
      .createHmac('sha256', process.env.MESSENGER_APP_SECRET)
      .update(buf, 'utf8')
      .digest('hex');

    if (signatureHash !== expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

// Parse application/x-www-form-urlencoded
router.use(
  urlencoded({
    extended: true
  })
);

// Parse application/json. Verify that callback came from Facebook
router.use(json({ verify: verifyRequestSignature }));

// Add support for GET requests to our webhook
router.get("/", (req, res) => {
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Create the endpoint for your webhook
router.post('/', (req, res) => {
  const body = req.body;
  console.log(`\u{1F7EA} Received webhook:`);
  console.dir(body, { depth: null });

  if (body.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // If the event is a message and contains "hi", then respond with a "hello" message
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else if (body.object === "match"){
    console.log("MATCH_UPDATE");
    const other_match = body.pair;
    const matched_psid = 7712104875516853; // PSID for the matched user
    let response = {
      text: `You have been matched with ${other_match}. Say hi!`
    };
    let requestBody = {
      recipient: {
        id: matched_psid // or possibly user_ref: matched_ref, if getting opt-ins by the Checkbox plugin
      },
      message: response,
      messaging_type: "MESSAGE_TAG",
      tag: "ACCOUNT_UPDATE",
      
    };
    MessengerApi.callSendApi(requestBody);
    res.status(200).send("MATCH_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

export default router;
// Do the following once to set up the webhook
// MessengerApi.callSubscriptionsAPI();
// MessengerApi.callSubscribedApps();


// static async callSubscriptionsAPI(customFields) {
//   // Send the HTTP request to the Subscriptions Edge to configure your webhook
//   // You can use the Graph API's /{app-id}/subscriptions edge to configure and
//   // manage your app's Webhooks product
//   // https://developers.facebook.com/docs/graph-api/webhooks/subscriptions-edge
//   console.log(
//     `Setting app ${config.appId} callback url to ${config.webhookUrl}`
//   );

//   let fields =
//     "messages, messaging_postbacks, messaging_optins, " +
//     "message_deliveries, messaging_referrals";

//   if (customFields !== undefined) {
//     fields = fields + ", " + customFields;
//   }

//   console.log({ fields });

//   let url = new URL(`${config.apiUrl}/${config.appId}/subscriptions`);
//   url.search = new URLSearchParams({
//     access_token: `${config.appId}|${config.appSecret}`,
//     object: "page",
//     callback_url: config.webhookUrl,
//     verify_token: config.verifyToken,
//     fields: fields,
//     include_values: "true"
//   });
//   let response = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" }
//   });
//   if (response.ok) {
//     console.log(`Request sent.`);
//   } else {
//     console.error(
//       `Unable to callSubscriptionsAPI: ${response.statusText}`,
//       await response.json()
//     );
//   }
// }

// static async callSubscribedApps(customFields) {
//   // Send the HTTP request to subscribe an app for Webhooks for Pages
//   // You can use the Graph API's /{page-id}/subscribed_apps edge to configure
//   // and manage your pages subscriptions
//   // https://developers.facebook.com/docs/graph-api/reference/page/subscribed_apps
//   console.log(`Subscribing app ${config.appId} to page ${config.pageId}`);

//   let fields =
//     "messages, messaging_postbacks, messaging_optins, " +
//     "message_deliveries, messaging_referrals";

//   if (customFields !== undefined) {
//     fields = fields + ", " + customFields;
//   }

//   console.log({ fields });

//   let url = new URL(`${config.apiUrl}/${config.pageId}/subscribed_apps`);
//   url.search = new URLSearchParams({
//     access_token: config.pageAccesToken,
//     subscribed_fields: fields
//   });
//   let response = await fetch(url, {
//     method: "POST"
//   });
//   if (response.ok) {
//     console.log(`Request sent.`);
//   } else {
//     console.error(
//       `Unable to callSubscribedApps: ${response.statusText}`,
//       await response.json()
//     );
//   }
// }
