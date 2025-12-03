import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Interface para estender a Request do Express e incluir 'user' (payload do JWT)
interface AuthenticatedRequest extends Request {
    user?: { 
        id?: string;
        role?: 'ADMIN' | 'USER';
        [key: string]: any; // Permite outras propriedades no payload
    };
}

const JWT_SECRET = process.env.JWT_SECRET || 'troco_pra_producao';

// Middleware para verificar se o token é válido
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    // Garante que authHeader é uma string e começa com 'Bearer '
    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token ausente ou formato incorreto' });
    }

    const token = authHeader.split(' ')[1];

    // ✅ CORREÇÃO: Garante que o token foi extraído antes de verificar (resolve o erro 'string | undefined')
    if (!token) {
        return res.status(401).json({ message: 'Token malformado após Bearer' });
    }

    // Verifica o token JWT
    jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, payload: any) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        req.user = payload; 
        next();
    });
}

// Middleware para verificar o papel (role) do usuário
export function requireRole(role: 'ADMIN' | 'USER' | string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Permissão negada' });
        }

        next();
    };
}

// O seu projeto usa module.exports no JS original, então mantemos:
module.exports = { authenticateToken, requireRole };