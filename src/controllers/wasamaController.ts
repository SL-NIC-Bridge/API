import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { WasamaRepository } from '../repositories/wasamaRepository';
import { 
  CreateWasamaDto,
  UpdateWasamaDto,
  WasamaResponseDto
} from '../types/dto/wasama.dto';
import { NotFoundError, ConflictError } from '../utils/errors';

export class WasamaController extends BaseController {
  private static wasamaRepository = new WasamaRepository();

  // Get all wasamas
  static getWasamas = async (_req: Request, res: Response): Promise<Response> => {
    const wasamas = await WasamaController.wasamaRepository.findWithUserCount();

    const wasamaResponses: (WasamaResponseDto & { userCount: number })[] = wasamas.map(wasama => ({
      id: wasama.id,
      code: wasama.code,
      name: wasama.name,
      createdAt: wasama.createdAt,
      updatedAt: wasama.updatedAt,
      userCount: wasama._count.users,
    }));

    WasamaController.logSuccess('Get all wasamas', { count: wasamaResponses.length });
    return WasamaController.sendSuccess(res, wasamaResponses);
  }

  // Get wasama by ID
  static getWasama = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'];
    WasamaController.validateRequiredParams(req.params, ['id']);

    if (!id) throw new NotFoundError('Wasama ID is required');

    const wasama = await WasamaController.wasamaRepository.findById(id);

    if (!wasama) throw new NotFoundError('Wasama not found');

    const wasamaResponse: WasamaResponseDto = {
      id: wasama.id,
      code: wasama.code,
      name: wasama.name,
      createdAt: wasama.createdAt,
      updatedAt: wasama.updatedAt,
    };

    WasamaController.logSuccess('Get wasama by ID', { wasamaId: id });
    return WasamaController.sendSuccess(res, wasamaResponse);
  }

  // Create wasama
  static createWasama = async (req: Request, res: Response): Promise<Response> => {
    const wasamaData: CreateWasamaDto = req.body;
    WasamaController.validateRequiredFields(req.body, ['code', 'name']);

    const existingWasama = await WasamaController.wasamaRepository.findByCode(wasamaData.code);
    if (existingWasama) throw new ConflictError('Wasama with this code already exists');

    const wasama = await WasamaController.wasamaRepository.create(wasamaData);

    const wasamaResponse: WasamaResponseDto = {
      id: wasama.id,
      code: wasama.code,
      name: wasama.name,
      createdAt: wasama.createdAt,
      updatedAt: wasama.updatedAt,
    };

    WasamaController.logSuccess('Create wasama', { wasamaId: wasama.id, code: wasamaData.code });
    return WasamaController.sendSuccess(res, wasamaResponse, 201);
  }

  // Update wasama
  static updateWasama = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'];
    WasamaController.validateRequiredParams(req.params, ['id']);
    if (!id) throw new NotFoundError('Wasama ID is required');

    const updateData: UpdateWasamaDto = req.body;

    const wasama = await WasamaController.wasamaRepository.updateById(id, updateData);

    const wasamaResponse: WasamaResponseDto = {
      id: wasama.id,
      code: wasama.code,
      name: wasama.name,
      createdAt: wasama.createdAt,
      updatedAt: wasama.updatedAt,
    };

    WasamaController.logSuccess('Update wasama', { wasamaId: id });
    return WasamaController.sendSuccess(res, wasamaResponse);
  }

  // Delete wasama
  static deleteWasama = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'];
    WasamaController.validateRequiredParams(req.params, ['id']);
    if (!id) throw new NotFoundError('Wasama ID is required');

    await WasamaController.wasamaRepository.deleteById(id);

    WasamaController.logSuccess('Delete wasama', { wasamaId: id });
    return res.status(204).send();
  }
}
