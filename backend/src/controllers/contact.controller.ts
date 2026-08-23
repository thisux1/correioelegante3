import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import {
  createTicket,
  listTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
} from '../services/contact.service';

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

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search, limit, offset } = req.query;
      const data = await listTickets({
        status: typeof status === 'string' ? status : undefined,
        search: typeof search === 'string' ? search : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });
      res.json({
        success: true,
        total: data.total,
        tickets: data.tickets,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const ticket = await getTicketById(id);
      res.json({
        success: true,
        ticket,
      });
    } catch (err) {
      next(err);
    }
  },

  async reply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await replyToTicket(id, {
        replyMessage: req.body.replyMessage,
        status: req.body.status,
        sentBy: 'support',
      });
      res.json({
        success: true,
        message: 'Resposta enviada com sucesso.',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const ticket = await updateTicketStatus(id, req.body.status);
      res.json({
        success: true,
        message: 'Status atualizado com sucesso.',
        ticket,
      });
    } catch (err) {
      next(err);
    }
  },
};
