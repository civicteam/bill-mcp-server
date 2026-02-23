/**
 * Live test script for Bill.com API
 * Tests the actual API calls with real credentials
 */

import { BillClient } from "./bill-client.js";
import { listVendors } from "./tools/vendors.js";
import { getOrganizationInfo } from "./tools/account.js";

async function testBillApi() {
  console.log("=== Testing Bill.com API ===\n");

  const config = {
    devKey: process.env.BILL_DEV_KEY || "",
    username: process.env.BILL_USERNAME || "",
    password: process.env.BILL_PASSWORD || "",
    organizationId: process.env.BILL_ORGANIZATION_ID || "",
    environment: (process.env.BILL_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    authType: (process.env.BILL_AUTH_TYPE as "sync_token" | "full_access") || "sync_token",
  };

  console.log("Config:", {
    devKey: config.devKey,
    username: config.username,
    organizationId: config.organizationId,
    environment: config.environment,
    authType: config.authType,
    password: "***" + config.password.slice(-4),
  });
  console.log();

  const client = new BillClient(config);

  try {
    console.log("1. Testing get_organization_info...");
    const orgResult = await getOrganizationInfo.handler({}, client);
    console.log("Result:", JSON.stringify(orgResult, null, 2));
    console.log();
  } catch (error) {
    console.error("Error in get_organization_info:", error);
    console.log();
  }

  try {
    console.log("2. Testing list_vendors with no params...");
    const vendorsResult = await listVendors.handler({}, client);
    console.log("Result:", JSON.stringify(vendorsResult, null, 2));
    console.log();
  } catch (error) {
    console.error("Error in list_vendors:", error);
    console.log();
  }

  try {
    console.log("3. Testing direct GET /vendors with no params...");
    const directResult = await client.get("/vendors");
    console.log("Result:", JSON.stringify(directResult, null, 2));
    console.log();
  } catch (error) {
    console.error("Error in direct GET:", error);
    console.log();
  }

  try {
    console.log("4. Testing GET /vendors with max param...");
    const maxResult = await client.get("/vendors", { max: 10 });
    console.log("Result:", JSON.stringify(maxResult, null, 2));
    console.log();
  } catch (error) {
    console.error("Error with max param:", error);
    console.log();
  }

  try {
    console.log("5. Testing GET /vendors with page param...");
    const pageResult = await client.get("/vendors", { page: 1 });
    console.log("Result:", JSON.stringify(pageResult, null, 2));
    console.log();
  } catch (error) {
    console.error("Error with page param:", error);
    console.log();
  }

  try {
    console.log("6. Testing GET /vendors with pageSize param...");
    const pageSizeResult = await client.get("/vendors", { pageSize: 10 });
    console.log("Result:", JSON.stringify(pageSizeResult, null, 2));
    console.log();
  } catch (error) {
    console.error("Error with pageSize param:", error);
    console.log();
  }
}

testBillApi().catch(console.error);
