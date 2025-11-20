const express = require("express");
const app = express();

app.use(express.json());

// --- MOCK DATA CONSTANTS ---

const LONGCHAMP_PRODUCTS = [
  "Le Pliage Original Shoulder Bag", 
  "Le Pliage Green Tote Bag",
  "Roseau Bucket Bag", 
  "Cavalcade Crossbody Bag",
  "Le Pliage Energy Backpack", 
  "Longchamp 3D Belt Bag"
];

const NAMES = ["Sophie Martin", "Jean Dupont", "Marie Claire", "Luc Dubois"];
const CITIES = [
  { city: "Paris", zip: "75001", country: "France", street: "12 Rue de Rivoli" },
  { city: "Lyon", zip: "69002", country: "France", street: "5 Place Bellecour" },
  { city: "Geneva", zip: "1201", country: "Switzerland", street: "10 Quai des Bergues" },
  { city: "New York", zip: "10001", country: "USA", street: "5th Avenue" }
];

/**
 * Generates a Mock Order Response matching the 'OrderApiResponse' Apex Class.
 */
function generateOrderDetails(orderId) {
  const statuses = ["Processing", "Shipped", "Delivered"];
  const lineItems = [];
  let orderTotal = 0;
  
  // 1. Generate Line Items
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

  // 2. Select Random Address & Customer
  const randomAddress = CITIES[Math.floor(Math.random() * CITIES.length)];
  const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];

  // 3. Construct Final Object
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

app.get("/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  if (!/^\d{6}$/.test(orderId)) {
    return res.status(400).json({ 
      error: "Invalid Order ID", 
      message: "Order ID must be exactly 6 digits." 
    });
  }

  const responseData = generateOrderDetails(orderId);
  res.json(responseData);
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur Salesforce Mock API démarré sur le port ${PORT}`);
});
