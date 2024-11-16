const APP_ID = "b1437354-be81-45e9-8cb4-b8570f2e455a"; // TODO: Make this a proper secret
const API_BASE = "https://nillion-storage-apis-v0.onrender.com";

export async function storeSecret(userSeed, secretName, secretValue) {
  console.log(`\nStoring secret: ${secretName}...`);
  try {
    const storeResult = await fetch(`${API_BASE}/api/apps/${APP_ID}/secrets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: {
          nillion_seed: userSeed,
          secret_value: secretValue,
          secret_name: secretName,
        },
        permissions: {
          retrieve: [],
          update: [],
          delete: [],
          compute: {},
        },
      }),
    }).then((res) => res.json());

    console.log(`Secret "${secretName}" stored at:`, storeResult);
    return storeResult;
  } catch (error) {
    console.error("TEST", "error", error);
  }
}

export async function getStoreIds() {
  const storeIds = await fetch(`${API_BASE}/api/apps/${APP_ID}/store_ids`)
    .then((res) => res.json())
    .then((data) => data.store_ids);
  return storeIds;
}

export async function retrieveSecret(storeId, userSeed, secretName) {
  console.log(`\nRetrieving secret: ${secretName}...`);
  const secret = await fetch(
    `${API_BASE}/api/secret/retrieve/${storeId}?retrieve_as_nillion_user_seed=${userSeed}&secret_name=${secretName}`,
  ).then((res) => res.json());

  console.log(`Secret "${secretName}" retrieved:`, secret);
  return secret;
}

export async function updateSecret(
  storeId,
  userSeed,
  secretName,
  newSecretValue,
) {
  console.log(`\nUpdating secret: ${secretName}...`);
  const updateResponse = await fetch(
    `${API_BASE}/api/apps/${APP_ID}/secrets/${storeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nillion_seed: userSeed,
        secret_value: newSecretValue,
        secret_name: secretName,
      }),
    },
  ).then((res) => res.json());

  console.log(`Secret "${secretName}" updated:`, updateResponse);
  return updateResponse;
}
