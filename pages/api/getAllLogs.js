import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      return res.status(200).json({ logs: [] });
    }
    
    // Get all log files
    const logFiles = fs.readdirSync(logsDir);
    
    if (logFiles.length === 0) {
      return res.status(200).json({ logs: [] });
    }
    
    // Read and parse each log file
    const logs = [];
    
    for (const file of logFiles) {
      const filepath = path.join(logsDir, file);
      const fileContent = fs.readFileSync(filepath, 'utf8');
      try {
        const logEntry = JSON.parse(fileContent);
        logs.push(logEntry);
      } catch (e) {
        console.error(`Error parsing log file ${file}:`, e);
      }
    }
    
    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return res.status(200).json({ logs });
  } catch (error) {
    console.error('Error in getAllLogs handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
