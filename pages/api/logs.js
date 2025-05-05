import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const logsDir = path.join(process.cwd(), 'logs');
const credentialsPath = path.join(process.cwd(), 'cred.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    
    // Check if credentials file exists
    if (!fs.existsSync(credentialsPath)) {
      // Create default credentials file if it doesn't exist
      const defaultCreds = { password: 'MHS' };
      fs.writeFileSync(credentialsPath, JSON.stringify(defaultCreds, null, 2));
    }
    
    // Read credentials
    const creds = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    // Validate password
    if (password !== creds.password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      return res.status(200).json({ message: 'No logs available yet' });
    }
    
    // Get all log files
    const logFiles = fs.readdirSync(logsDir);
    
    if (logFiles.length === 0) {
      return res.status(200).json({ message: 'No logs available yet' });
    }
    
    // Set headers for streaming zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=equipment_logs.zip');
    
    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    // Pipe archive to response
    archive.pipe(res);
    
    // Add files to the archive
    logFiles.forEach(file => {
      const filepath = path.join(logsDir, file);
      archive.file(filepath, { name: file });
    });
    
    // Finalize archive
    await archive.finalize();
    
  } catch (error) {
    console.error('Error in logs handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
