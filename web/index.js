// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import productRoutes from "./routes/productRoutes.js";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import cors from 'cors'
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(cors({
  origin:"*"
}))
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// app.use("/api/*", shopify.validateAuthenticatedSession());


app.use(express.json());

// app.get("/api/products/count", async (_req, res) => {
//   const client = new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session,
//   });

//   const countData = await client.request(`
//     query shopifyProductCount {
//       productsCount {
//         count
//       }
//     }
//   `);
//   res.status(200).send({ count: countData.data.productsCount.count });
// });
app.use("/api/products",productRoutes)

app.get("/api/getCart", async (req, res) => {
  try {
    console.log("req. received")
    // Get cartId from headers
    let cartId = req.headers["cartid"];
    cartId = "gid://shopify/Cart/"+cartId
    console.log(typeof cartId)
    console.log(cartId)
    if (!cartId) {
      return res.status(400).json({ error: "Missing cartId in request headers" });
    }

    // GraphQL query
    const query = `
      mutation addAttribute($cartId: ID!) {
        cartAttributesUpdate(
          cartId: $cartId,
          attributes: [{ key: "success", value: "successfully updated" }]
        ) {
          cart {
            id
            attributes {
              key
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }

    `;
    const variables ={
      "cartId": cartId,
    }
    const response = await fetch("https://test-store0077.myshopify.com/api/2025-07/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":"e8e4bb8ca0a0519c41726c267c66b110" 
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();
    console.log("Cart result:", result);

    return res.json(result);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// getCart();
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});
console.log(process.env.HOST)
app.listen(PORT,()=>console.log("server is running at ",PORT));
