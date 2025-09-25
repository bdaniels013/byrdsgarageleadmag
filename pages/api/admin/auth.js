import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Get credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';

    // Check if credentials are configured
    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not configured in environment variables');
      return res.status(500).json({ error: 'Admin access not configured' });
    }

    // Validate credentials
    if (username === adminUsername && password === adminPassword) {
      // Create JWT token
      const token = jwt.sign(
        { 
          username: username,
          role: 'admin',
          iat: Math.floor(Date.now() / 1000)
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        token: token,
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
