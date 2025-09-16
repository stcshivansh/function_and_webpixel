import {register} from "@shopify/web-pixels-extension";

register(({ analytics, browser, init, settings }) => {
    // Bootstrap and insert pixel script tag here
    let formData = {
      'items': [{
        'id': 48817123033372,
        'quantity': 2
      }]
    };
    console.log("first")
    const BACKEND =  "https://browser-priced-contains-tells.trycloudflare.com/api/getCart"
    
    analytics.subscribe('page_viewed',async (event) => {
      const cartId = await browser.cookie.get("cart")
       try {
        await fetch(BACKEND, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "cartid":cartId
        },
      });
      console.log("fetcjdone")
    } catch (err) {
      console.error("Error sending cart update:", err);
    }
  });

});
