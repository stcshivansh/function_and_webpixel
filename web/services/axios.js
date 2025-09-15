import axios from 'axios'

import dotenv from 'dotenv'
import { getATfromDB } from '../utils/getAtfromDb.js';
dotenv.config(({ path: "../.env" }));

let axiosInstance;
let AT;
export const initInstance = async()=>{
  AT = await getATfromDB(process.env.SHOP)
  console.log(process.env.SHOP)
  console.log("access token is ",AT)
  axiosInstance = axios.create({
    baseURL: `https://${process.env.SHOP}/admin/api/${process.env.GRAPHQL_API_VERSION}/graphql.json`,
    headers: {
        "X-Shopify-Access-Token": AT,
        "Content-Type": "application/json",
      
    },
  });
}
await initInstance()
export const axiosInstance2 = axios.create({
  baseURL: `https://${process.env.SHOP}/admin/oauth/access_scopes.json`,
  headers: {
      "X-Shopify-Access-Token": AT,
  },
});

export const apiConnector = async (method, bodyData = null, headers = {}, params = {}) => {
  try {
    const response = await axiosInstance({
      method,
      data: bodyData,
      headers,
      params,
    });
    return response.data;
  } catch (error) {
    // console.error("API Error:", error);
    throw error?.response?.data || error;
  }
};