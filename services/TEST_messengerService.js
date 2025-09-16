import { URL, URLSearchParams } from 'url';

export default class MessengerApi {
  static async callSendApi(requestBody) {
    let url = new URL("https://graph.facebook.com/me/messages");
    url.search = new URLSearchParams({
      access_token: process.env.PAGE_ACCESS_TOKEN
    });
    console.log("Request body to POST to FB is\n" + JSON.stringify(requestBody));
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      console.warn(
        `Unable to call Send API: ${response.statusText}`,
        await response.json()
      );
    }
  }
}