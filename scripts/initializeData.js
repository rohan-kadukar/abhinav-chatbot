// This script should be run once to initialize your Pinecone database with your data
const { initPinecone } = require('../lib/dataProcessing');

async function main() {
  console.log('Starting Pinecone initialization...');
  
  try {
    const success = await initPinecone();
    
    if (success) {
      console.log('✅ Successfully initialized Pinecone with Abhinav Academy data');
    } else {
      console.error('❌ Failed to initialize Pinecone');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

main();