import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const logsDir = path.join(process.cwd(), 'logs');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { equipmentType, equipmentNumber, staffApproval } = req.body;
    
    if (!equipmentType || !equipmentNumber || !staffApproval) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create a new log entry
    const logEntry = {
      id: uuidv4(),
      type: 'checkout',
      equipmentType,
      equipmentNumber,
      staffApproval,
      timestamp: new Date().toISOString()
    };

    // Save to a JSON file
    const filename = `checkout_${Date.now()}.json`;
    const filepath = path.join(logsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(logEntry, null, 2));
    
    return res.status(200).json({ message: 'Equipment checked out successfully', logEntry });
  } catch (error) {
    console.error('Error in checkout handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
