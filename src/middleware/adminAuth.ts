import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AdminRequest extends Request {
  usuarioId?: string;
  tipo?: string;
}

export default function AdminAuth(
  req: AdminRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: "Token não fornecido!" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensagem: "Token mal formatado!" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ mensagem: "Token inválido!" });
    }

    if (!decoded || !decoded.usuarioId || !decoded.tipo) {
      return res.status(401).json({ mensagem: "Payload inválido!" });
    }

    if (decoded.tipo !== "ADMIN") {
      return res
        .status(403)
        .json({ mensagem: "Acesso negado! Apenas ADMIN pode acessar." });
    }

    req.usuarioId = decoded.usuarioId;
    req.tipo = decoded.tipo;

    next();
  });
}
