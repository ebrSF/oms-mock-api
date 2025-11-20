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
  
  // 1. Generate Line Items (Matches Apex 'LineItem' class)
  const numberOfLines = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 1; i <= numberOfLines; i++) {
    const randomProduct = LONGCHAMP_PRODUCTS[Math.floor(Math.random() * LONGCHAMP_PRODUCTS.length)];
    const quantity = Math.floor(Math.random() * 2) + 1;
    const unitPrice = parseFloat((Math.random() * 400 + 100).toFixed(2)); // 100 - 500
    const lineTotal = parseFloat((unitPrice * quantity).toFixed(2));
    
    orderTotal += lineTotal;

    lineItems.push({
      id: `L-${i}`,                 // Matches Apex: String id
      description: randomProduct,   // Matches Apex: String description
      quantity: quantity,           // Matches Apex: Integer quantity
      unitPrice: unitPrice,         // Matches Apex: Double unitPrice
      total: lineTotal,             // Matches Apex: Double total
      status: "Shipped"             // Matches Apex: String status
    });
  }

  // 2. Select Random Address & Customer
  const randomAddress = CITIES[Math.floor(Math.random() * CITIES.length)];
  const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];

  // 3. Construct Final Object (Matches Apex 'OrderApiResponse' class)
  return {
    orderId: orderId,                       // Matches Apex: String orderId
    orderDate: new Date().toISOString(),    // Matches Apex: String orderDate
    total: parseFloat(orderTotal.toFixed(2)), // Matches Apex: Double total
    orderCurrency: "EUR",                   // Matches Apex: String orderCurrency
    status: "Completed",                    // Matches Apex: String status
    deliveryStatus: "Shipped",              // Matches Apex: String deliveryStatus
    
    // Matches Apex: DeliveryAddress deliveryAddress
    deliveryAddress: {
      street: randomAddress.street,         // Matches Apex: String street
      city: randomAddress.city,             // Matches Apex: String city
      postalCode: randomAddress.zip,        // Matches Apex: String postalCode (Crucial rename from zipCode)
      country: randomAddress.country        // Matches Apex: String country
    },
    
    // Matches Apex: Customer customer
    customer: {
      name: randomName,                     // Matches Apex: String name
      email: `${randomName.replace(' ', '.').toLowerCase()}@example.com` // Matches Apex: String email
    },
    
    lineItems: lineItems                    // Matches Apex: List<LineItem> lineItems
  };
}

// --- ENDPOINTS ---

// 📌 GET Order Details (Updated to match Apex Logic)
app.get("/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  // Validate ID Format (6 digits)
  if (!/^\d{6}$/.test(orderId)) {
    // Note
