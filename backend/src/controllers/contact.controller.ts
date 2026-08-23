import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createTicket } from '../services/contact.service';

export const contactController = {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await createTicket(req.body, req.userId);
      res.status(201).json({
        success: true,
        message: 'Chamado de suporte registrado com sucesso.',
        ticket,
      });
    } catch (err) {
      next(err);
    }
  },
};
