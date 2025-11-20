const express = require("express");
const app = express();

// Enable express to parse JSON bodies for PUT requests
app.use(express.json());

// 📦 In-Memory Data Store for Mock Customer Addresses
// In a real application, this would be a database. 
// Since this is a mock API, we use an object to store data temporarily.
const customerAddresses = {
  // Example customer data:
  "CUST1001": {
    street: "1 Rue de Rivoli",
    city: "Paris",
    zipCode: "75001",
    country: "France"
  },
  "CUST1002": {
    street: "24 Quai des Bergues",
    city: "Geneva",
    zipCode: "1201",
    country: "Switzerland"
  }
};


// --- ORDER MOCK LOGIC (from previous example) ---

const LONGCHAMP_PRODUCTS = [
  "Le Pliage Original Shoulder Bag", "Le Pliage Green Tote Bag",
  "Roseau Bucket Bag", "Cavalcade Crossbody Bag",
  "Le Pliage Energy Backpack", "Longchamp 3D Belt Bag",
  "Pénélope Fantaisie Clutch"
];

function generateOrderDetails(orderId) {
  const statuses = ["delivered", "pending", "shipped", "cancelled"];
  const lines = [];
  const numberOfLines = Math.floor(Math.random() * 4) + 1;
  
  for (let i = 1; i <= numberOfLines; i++) {
    const randomProductIndex = Math.floor(Math.random() * LONGCHAMP_PRODUCTS.length);
    const description = LONGCHAMP_PRODUCTS[randomProductIndex];
    const basePrice = Math.floor(Math.random() * 500) + 100;
    const amount = parseFloat((basePrice + Math.random()).toFixed(2));

    lines.push({
      line: i,
      description: description,
      amount: amount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

  return {
    orderId,
    date: new Date().toISOString(),
    store: "Paris Saint-Honoré",
    customerTier: Math.random() > 0.7 ? "VIP" : "Standard",
    lines,
  };
}

// 📌 GET Order Details Endpoint
app.get("/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  if (!/^\d{6}$/.test(orderId)) {
    return res.status(400).json({ 
      error: "Invalid Order ID", 
      message: "Le numéro de commande doit comporter exactement 6 chiffres numériques (e.g., 123456)." 
    });
  }
  const orderDetails = generateOrderDetails(orderId);
  res.json(orderDetails);
});


// --- NEW CUSTOMER ADDRESS ENDPOINTS ---

// 📌 GET Customer Delivery Address
// Retrieves the current delivery address for a given customer ID.
app.get("/customers/:customerId/address", (req, res) => {
  const customerId = req.params.customerId.toUpperCase(); // Normalize ID

  if (customerAddresses[customerId]) {
    res.json({
      customerId: customerId,
      address: customerAddresses[customerId]
    });
  } else {
    res.status(404).json({
      error: "Customer Not Found",
      message: `Aucune adresse trouvée pour le client ID : ${customerId}.`
    });
  }
});

// 📌 PUT Update Customer Delivery Address
// Updates the delivery address for a given customer ID.
app.put("/customers/:customerId/address", (req, res) => {
  const customerId = req.params.customerId.toUpperCase(); // Normalize ID
  const newAddress = req.body;

  // Simple validation check for required fields
  if (!newAddress || !newAddress.street || !newAddress.city || !newAddress.zipCode) {
    return res.status(400).json({
      error: "Invalid Data",
      message: "Les champs 'street', 'city', et 'zipCode' sont requis pour la mise à jour de l'adresse."
    });
  }

  // Update or Create the address in the mock store
  customerAddresses[customerId] = {
    ...customerAddresses[customerId], // Preserve existing fields if any
    ...newAddress // Overwrite/add new fields
  };

  res.status(200).json({
    message: `Adresse mise à jour avec succès pour le client ID : ${customerId}.`,
    newAddress: customerAddresses[customerId]
  });
});


// --- SERVER START ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur Longchamp Mock API démarré sur le port ${PORT}`);
});
