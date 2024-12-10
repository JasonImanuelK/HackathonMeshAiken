import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

function createTokenAndSetCookie(res: NextApiResponse, wallet: { address: string; status: number }) {
  const token = jwt.sign(wallet, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  // Set token in HTTP-only cookie
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; SameSite=Strict; Secure`);
}

function verifyTokenFromCookie(req: NextApiRequest) {
  const token = req.cookies.token;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return null;
  }
}

export default async function authHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Handle login logic
    const { address, status } = req.body;

    const wallet = { address: address, status: status };
    createTokenAndSetCookie(res, wallet);
    return res.status(200).json({ message: 'Login successful' });

  } else if (req.method === 'GET') {
    // Handle session verification logic
    const wallet = verifyTokenFromCookie(req);

    if (wallet) {
      return res.status(200).json({ message: 'Access granted', wallet });
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else if (req.method === 'DELETE') {
    // Clear the cookie by setting its expiry to a past date
    res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; SameSite=Strict; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    return res.status(200).json({ message: 'Logged out successfully' });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
