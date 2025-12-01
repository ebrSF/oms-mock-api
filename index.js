const express = require("express");
const app = express();

app.use(express.json());

// --- 1. IN-MEMORY STORAGE ---
// This object acts as our "Database" while the app is running.
const ordersStore = {};

// --- MOCK DATA CONSTANTS ---
const LONGCHAMP_PRODUCTS = [
  "Le Pliage Original Shoulder Bag", "Le Pliage Green Tote Bag",
  "Roseau Bucket Bag", "Cavalcade Crossbody Bag",
  "Le Pliage Energy Backpack", "Longchamp 3D Belt Bag"
];

const NAMES = ["Sophie Martin", "Jean Dupont", "Marie Claire", "Luc Dubois"];
const CITIES = [
  { city: "Paris", zip: "75001", country: "France", street: "12 Rue de Rivoli" },
  { city: "Lyon", zip: "69002", country: "France", street: "5 Place Bellecour" },
  { city: "Geneva", zip: "1201", country: "Switzerland", street: "10 Quai des Bergues" },
  { city: "New York", zip: "10001", country: "USA", street: "5th Avenue" }
];

/**
 * Helper: Generates fresh random data (only used if order doesn't exist yet)
 */
function generateOrderDetails(orderId) {
  const lineItems = [];
  let orderTotal = 0;
  
  const numberOfLines = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 1; i <= numberOfLines; i++) {
    const randomProduct = LONGCHAMP_PRODUCTS[Math.floor(Math.random() * LONGCHAMP_PRODUCTS.length)];
    const quantity = Math.floor(Math.random() * 2) + 1;
    const unitPrice = parseFloat((Math.random() * 400 + 100).toFixed(2)); 
    const lineTotal = parseFloat((unitPrice * quantity).toFixed(2));
    orderTotal += lineTotal;

    lineItems.push({
      id: `L-${i}`,
      description: randomProduct,
      quantity: quantity,
      unitPrice: unitPrice,
      total: lineTotal,
      status: "Shipped"
    });
  }

  const randomAddress = CITIES[Math.floor(Math.random() * CITIES.length)];
  const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];

  return {
    orderId: orderId,
    orderDate: new Date().toISOString(),
    total: parseFloat(orderTotal.toFixed(2)),
    orderCurrency: "EUR",
    status: "Completed",
    deliveryStatus: "Shipped",
    deliveryAddress: {
      street: randomAddress.street,
      city: randomAddress.city,
      postalCode: randomAddress.zip,
      country: randomAddress.country
    },
    customer: {
      name: randomName,
      email: `${randomName.replace(' ', '.').toLowerCase()}@example.com`
    },
    lineItems: lineItems
  };
}

// --- ENDPOINTS ---

// 📌 GET Order Details (With Persistence)
app.get("/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  if (!/^\d{6}$/.test(orderId)) {
    return res.status(400).json({ error: "Invalid Order ID", message: "Order ID must be exactly 6 digits." });
  }

  // 1. Check if we already have this order in memory
  if (ordersStore[orderId]) {
    console.log(`Serving Order ${orderId} from memory.`);
    return res.json(ordersStore[orderId]);
  }

  // 2. If not, generate it, SAVE IT, and return it
  console.log(`Generating new data for Order ${orderId}.`);
  const newOrder = generateOrderDetails(orderId);
  ordersStore[orderId] = newOrder; // <--- PERSISTENCE HAPPENS HERE
  
  res.json(newOrder);
});

// 📌 PUT Update Order Address
app.put("/orders/:orderId/address", (req, res) => {
  const orderId = req.params.orderId;
  const newAddressData = req.body; // Expects JSON { street, city, postalCode, country }

  if (!/^\d{6}$/.test(orderId)) {
    return res.status(400).json({ error: "Invalid Order ID" });
  }

  // 1. Ensure the order exists (Lazy Load)
  if (!ordersStore[orderId]) {
    ordersStore[orderId] = generateOrderDetails(orderId);
  }

  // 2. Update ONLY the address fields
  // We use spread syntax to keep existing fields if the user only sends a partial update
  ordersStore[orderId].deliveryAddress = {
    ...ordersStore[orderId].deliveryAddress,
    ...newAddressData
  };

  console.log(`Address updated for Order ${orderId}`);

  // 3. Return the fully updated order object
  res.json(ordersStore[orderId]);
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur Salesforce Mock API démarré sur le port ${PORT}`);
});
