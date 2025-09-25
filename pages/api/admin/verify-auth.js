import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);
    
    if (decoded.role === 'admin') {
      return res.status(200).json({
        success: true,
        user: decoded,
        message: 'Token valid'
      });
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
