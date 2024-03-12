import client from "./redis-client.js";

export async function redis() {
  await client.set("user:1", "avi");
  const value = await client.get("name");
  console.log("check redis for value", value);
}
