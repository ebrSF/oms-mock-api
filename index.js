const express = require("express");
const app = express();

app.use(express.json());

// --- 1. IN-MEMORY STORAGE ---
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
 * Helper: Generates fresh random data with Logic based on Order ID
 */
function generateOrderDetails(orderId) {
  const lineItems = [];
  let orderTotal = 0;
  
  // --- NEW: Determine Delivery Status based on ID Range ---
  const orderIdNum = parseInt(orderId, 10);
  let deliveryStatus = "preparation in progress"; // Default

  if (orderIdNum <= 333333) {
    deliveryStatus = "preparation in progress";
  } else if (orderIdNum >= 333334 && orderIdNum <= 666666) {
    deliveryStatus = "in delivery";
  } else if (orderIdNum >= 666667) {
    deliveryStatus = "delivered";
  }

  // Generate Lines
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
      status: deliveryStatus // Sync line status with order status for consistency
    });
  }

  const randomAddress = CITIES[Math.floor(Math.random() * CITIES.length)];
  const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];

  return {
    orderId: orderId,
    orderDate: new Date().toISOString(),
    total: parseFloat(orderTotal.toFixed(2)),
    orderCurrency: "EUR",
    status: "Completed", // Payment status
    deliveryStatus: deliveryStatus, // <--- NEW LOGIC APPLIED HERE
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

// 📌 GET Order Details
app.get("/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  if (!/^\d{6}$/.test(orderId)) {
    return res.status(400).json({ error: "Invalid Order ID", message: "Order ID must be exactly 6 digits." });
  }

  // Check memory or generate new
  if (!ordersStore[orderId]) {
    console.log(`Generating new data for Order ${orderId}.`);
    ordersStore[orderId] = generateOrderDetails(orderId);
  } else {
    console.log(`Serving Order ${orderId} from memory.`);
  }
  
  res.json(ordersStore[orderId]);
});

// 📌 PUT Update Order Address (With Business Logic)
app.put("/orders/:orderId/address", (req, res) => {
  const orderId = req.params.orderId;
  const newAddressData = req.body;

  if (!/^\d{6}$/.test(orderId)) {
    return res.status(400).json({ error: "Invalid Order ID" });
  }

  // 1. Ensure order exists in memory
  if (!ordersStore[orderId]) {
    ordersStore[orderId] = generateOrderDetails(orderId);
  }

  const currentOrder = ordersStore[orderId];

  // 2. CHECK BUSINESS RULE: Can we update?
  // Only allow update if status is "preparation in progress"
  if (currentOrder.deliveryStatus !== "preparation in progress") {
    return res.status(400).json({
      error: "Update Not Allowed",
      message: `Cannot update address. Order status is '${currentOrder.deliveryStatus}'. Address modification is only allowed during 'preparation in progress'.`
    });
  }

  // 3. Perform Update
  ordersStore[orderId].deliveryAddress = {
    ...ordersStore[orderId].deliveryAddress,
    ...newAddressData
  };

  console.log(`Address updated for Order ${orderId}`);

  // 4. Return Specific Success Message
  res.json({
    message: "shipping address has been updated",
    order: ordersStore[orderId]
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur Salesforce Mock API démarré sur le port ${PORT}`);
});
