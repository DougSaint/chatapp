import * as jwt from 'jsonwebtoken';

const SECRET_KEY = 'secret-key'; // Substitua por uma chave secreta de sua escolha
const TOKEN_EXPIRATION = '1h'; // Substitua pelo tempo de expiração desejado

export interface JwtPayload {
  id: number;
  username: string;
}

export function createToken(payload: JwtPayload): string {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
  return token;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    return decoded;
  } catch (err) {
    return null;
  }
}
