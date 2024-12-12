import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to the saved models
const STOCK_MODEL_PATH = path.join(__dirname, 'stock_recommendation_model.joblib');
const MATRIX_PATH = path.join(__dirname, 'time_item_matrix.joblib');

export async function predictSales() {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'json',
      pythonPath: 'python3', // or 'python' depending on your system
      scriptPath: path.join(__dirname, '..', 'scripts'),
    };

    PythonShell.run('predict_sales.py', options).then(results => {
      resolve(results[0]); // Get the first message which contains our JSON
    }).catch(err => {
      reject(err);
    });
  });
}

export async function loadModel() {
  try {
    console.log('Loading stock prediction model and time-item matrix...');
    const modelBuffer = await fs.readFile(STOCK_MODEL_PATH);
    const matrixBuffer = await fs.readFile(MATRIX_PATH);
    const model = JSON.parse(modelBuffer.toString());
    const timeItemMatrix = JSON.parse(matrixBuffer.toString());
    console.log('Model and matrix loaded successfully');
    return { model, timeItemMatrix };
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Failed to load stock prediction model');
  }
}

export async function predictStockLevels(modelData, stockData) {
  try {
    console.log('Preparing data for prediction...');
    const { model, timeItemMatrix } = modelData;
    
    // Get the latest date from the time-item matrix
    const latestDate = new Date(Math.max(...timeItemMatrix.index.map(d => new Date(d))));
    
    // Create a feature vector for the current stock levels
    const currentStockVector = new Array(timeItemMatrix.columns.length).fill(0);
    const productNameToIndex = {};
    timeItemMatrix.columns.forEach((name, index) => {
      productNameToIndex[name] = index;
    });

    // Fill in the current stock levels
    stockData.forEach(item => {
      const index = productNameToIndex[item.product];
      if (index !== undefined) {
        currentStockVector[index] = item.currentStock;
      }
    });

    // Transform the current stock vector using the model
    const transformed = model.transform([currentStockVector]);
    const reconstructed = model.inverse_transform(transformed);

    // Format predictions
    const predictions = stockData.map(item => {
      const index = productNameToIndex[item.product];
      let predictedStock = item.currentStock; // Default to current stock

      if (index !== undefined) {
        // Calculate predicted stock based on the reconstructed values
        // and add a small random variation to avoid identical predictions
        const basePredict = reconstructed[0][index];
        const variation = Math.random() * 0.1 + 0.95; // Random factor between 0.95 and 1.05
        predictedStock = Math.max(0, Math.round(basePredict * variation));
      }

      return {
        product: item.product,
        currentStock: item.currentStock,
        predictedStock,
        price: item.price,
        category: item.category
      };
    });

    console.log('Predictions generated successfully');
    return predictions;
  } catch (error) {
    console.error('Error in stock level prediction:', error);
    throw new Error('Failed to generate stock predictions');
  }
}

// Utility function to validate model output
export function validatePredictions(predictions) {
  if (!Array.isArray(predictions)) {
    throw new Error('Predictions must be an array');
  }

  predictions.forEach((prediction, index) => {
    if (typeof prediction.predictedStock !== 'number') {
      throw new Error(`Invalid prediction at index ${index}: predictedStock must be a number`);
    }
    if (prediction.predictedStock < 0) {
      console.warn(`Warning: Negative prediction at index ${index}, setting to 0`);
      prediction.predictedStock = 0;
    }
  });

  return predictions;
}

// Add a new function to predict sales levels
export async function predictSalesLevels(modelData, salesData) {
  try {
    console.log('Preparing data for sales prediction...');
    const { model, timeItemMatrix } = modelData;
    
    // Create a feature vector for the current sales levels
    const currentSalesVector = new Array(timeItemMatrix.columns.length).fill(0);
    const productNameToIndex = {};
    timeItemMatrix.columns.forEach((name, index) => {
      productNameToIndex[name] = index;
    });

    // Fill in the current sales levels
    salesData.forEach(item => {
      const index = productNameToIndex[item.product];
      if (index !== undefined) {
        currentSalesVector[index] = item.quantity;
      }
    });

    // Transform the current sales vector using the model
    const transformed = model.transform([currentSalesVector]);
    const reconstructed = model.inverse_transform(transformed);

    // Format predictions
    const predictions = salesData.map(item => {
      const index = productNameToIndex[item.product];
      let predictedSales = item.quantity; // Default to current sales

      if (index !== undefined) {
        // Calculate predicted sales based on the reconstructed values
        // and add a small random variation to avoid identical predictions
        const basePredict = reconstructed[0][index];
        const variation = Math.random() * 0.1 + 0.95; // Random factor between 0.95 and 1.05
        predictedSales = Math.max(0, Math.round(basePredict * variation));
      }

      return {
        product: item.product,
        currentSales: item.quantity,
        predictedSales,
        date: item.date
      };
    });

    console.log('Sales predictions generated successfully');
    return predictions;
  } catch (error) {
    console.error('Error in sales level prediction:', error);
    throw new Error('Failed to generate sales predictions');
  }
}

