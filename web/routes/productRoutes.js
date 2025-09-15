import express from 'express'
const router = express.Router()
router.get('/', async(req, res) => {
   try {
    const SHOP = "test-store0077.myshopify.com";
    const ACCESS_TOKEN = "shpua_3dd4b2efdaa1171d2872cb393089d457"; 
    
    const time =  Date.now()
    //will convert miliseconds to iso time string after omitting miliseconds
    const finalTimeIso = new Date(time - 15*60*1000).toISOString().split('.')[0] + 'Z'

    const query = `
        query {
            orders(first: 250, query:"created_at:>='${finalTimeIso}'") {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    `
    const response = await fetch(`https://${SHOP}/admin/api/2025-07/graphql.json`, {
    method: 'POST',
    headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    });

    const data = await response.json();
    if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return res.status(500).send({ error: 'GraphQL errors', details: data.errors });
    }
    return res.status(200).json(
        {
            success:true,
            message:"Last 15 minutes orders",
            data:data?.data?.orders?.edges?.length || 0 
        }
    )
   } catch (error) {
        console.error("GraphQL error:", error?.message);
        return res.status(500).send({ error: error?.message });
    }

});

export default router;