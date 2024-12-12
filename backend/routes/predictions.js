import express from 'express';
import { database } from '../config/firebase.js';
import { loadModel, predictStockLevels, predictSalesLevels } from '../model/stockPrediction.js';

const router = express.Router();

// Export the handler functions that index.js is trying to import
export async function handleSalesPredictions(req, res) {
  try {
    const salesData = await fetchSalesDataFromFirebase();

    if (salesData.length === 0) {
      return res.status(404).json({ error: 'No valid sales data found' });
    }

    console.log('Fetched sales data:', salesData);

    // Load the saved model
    const model = await loadModel();
    if (!model) {
      throw new Error('Failed to load prediction model');
    }
    
    // Get predictions
    const predictions = await predictSalesLevels(model, salesData);
    
    if (!predictions || predictions.length === 0) {
      throw new Error('Failed to generate sales predictions');
    }

    console.log('Generated sales predictions:', predictions);

    // Format predictions for frontend
    const formattedPredictions = predictions.map(item => ({
      product: item.product,
      currentSales: item.currentSales,
      predictedSales: Math.round(item.predictedSales),
      trend: item.predictedSales > item.currentSales ? 'Increasing' :
             item.predictedSales < item.currentSales ? 'Decreasing' : 'Stable'
    }));

    return res.json(formattedPredictions);
  } catch (error) {
    console.error('Error generating sales predictions:', error);
    return res.status(500).json({ error: 'Failed to generate sales predictions', details: error.message });
  }
}

export async function handleStockRecommendations(req, res) {
  try {
    const stockData = await fetchStockDataFromFirebase();

    if (stockData.length === 0) {
      return res.status(404).json({ error: 'No valid product data found' });
    }

    console.log('Fetched stock data:', stockData);

    // Load the saved model
    const model = await loadModel();
    if (!model) {
      throw new Error('Failed to load prediction model');
    }
    
    // Get predictions
    const predictions = await predictStockLevels(model, stockData);
    
    if (!predictions || predictions.length === 0) {
      throw new Error('Failed to generate predictions');
    }

    console.log('Generated predictions:', predictions);

    // Format predictions for frontend
    const formattedPredictions = predictions.map(item => ({
      product: item.product,
      currentStock: item.currentStock,
      predictedStock: Math.round(item.predictedStock),
      action: item.currentStock < item.predictedStock * 0.7 ? 'Restock' :
              item.currentStock < item.predictedStock * 0.9 ? 'Monitor' : 'Sufficient',
      price: item.price
    }));

    return res.json(formattedPredictions);
  } catch (error) {
    console.error('Error generating stock predictions:', error);
    return res.status(500).json({ error: 'Failed to generate stock predictions', details: error.message });
  }
}

// Helper function to fetch stock data from Firebase
async function fetchStockDataFromFirebase() {
  console.log('Fetching stock data from Firebase...');
  const productsRef = database.collection('products');
  const snapshot = await productsRef.get();

  if (snapshot.empty) {
    console.log('No products found in the database');
    return [];
  }

  const stockData = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.name && data.quantity !== undefined && data.category && data.price) {
      stockData.push({
        product: data.name,
        currentStock: data.quantity,
        category: data.category,
        price: data.price
      });
    } else {
      console.warn(`Skipping product ${doc.id} due to missing required fields`);
    }
  });

  console.log(`Fetched ${stockData.length} products from Firebase`);
  return stockData;
}

// Helper function to fetch sales data from Firebase
async function fetchSalesDataFromFirebase() {
  console.log('Fetching sales data from Firebase...');
  const salesRef = database.collection('sales');
  const snapshot = await salesRef.get();

  if (snapshot.empty) {
    console.log('No sales data found in the database');
    return [];
  }

  const salesData = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.product && data.quantity !== undefined && data.date) {
      salesData.push({
        product: data.product,
        quantity: data.quantity,
        date: data.date.toDate()
      });
    } else {
      console.warn(`Skipping sales record ${doc.id} due to missing required fields`);
    }
  });

  console.log(`Fetched ${salesData.length} sales records from Firebase`);
  return salesData;
}

// Setup routes
router.get('/stock', handleStockRecommendations);
router.get('/sales', handleSalesPredictions);

export default router;

