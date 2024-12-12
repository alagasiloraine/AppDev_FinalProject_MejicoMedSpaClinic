import * as tf from '@tensorflow/tfjs';

// Normalize the data
const normalize = (data) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  return data.map(x => (x - min) / (max - min));
};

// Denormalize the data
const denormalize = (normalizedData, originalData) => {
  const min = Math.min(...originalData);
  const max = Math.max(...originalData);
  return normalizedData.map(x => x * (max - min) + min);
};

// Create sequences for training
const createSequences = (data, seqLength) => {
  const sequences = [];
  const targets = [];
  for (let i = seqLength; i < data.length; i++) {
    sequences.push(data.slice(i - seqLength, i));
    targets.push(data[i]);
  }
  return [sequences, targets];
};

// Train the model and make predictions
export const trainAndPredict = async (salesData, futurePredictions = 6) => {
  const sales = salesData.map(item => item.price);
  const normalizedSales = normalize(sales);

  const seqLength = 6; // Use 6 months of data to predict the next month
  const [sequences, targets] = createSequences(normalizedSales, seqLength);

  const model = tf.sequential();
  model.add(tf.layers.lstm({ units: 32, inputShape: [seqLength, 1] }));
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  const xs = tf.tensor3d(sequences, [sequences.length, seqLength, 1]);
  const ys = tf.tensor2d(targets, [targets.length, 1]);

  await model.fit(xs, ys, { epochs: 100, batchSize: 32 });

  // Make predictions
  let lastSequence = normalizedSales.slice(-seqLength);
  const predictions = [];

  for (let i = 0; i < futurePredictions; i++) {
    const input = tf.tensor3d([lastSequence], [1, seqLength, 1]);
    const prediction = model.predict(input);
    const predictedValue = prediction.dataSync()[0];
    predictions.push(predictedValue);
    lastSequence = [...lastSequence.slice(1), predictedValue];
  }

  const denormalizedPredictions = denormalize(predictions, sales);

  return denormalizedPredictions;
};

