import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { DivisionRepository } from '../repositories/divisionRepository';
import { 
  CreateDivisionDto,
  UpdateDivisionDto,
  DivisionResponseDto
} from '../types/dto/division.dto';
import { NotFoundError, ConflictError } from '../utils/errors';

export class DivisionController extends BaseController {
  private static divisionRepository = new DivisionRepository();

  // Get all divisions
  static getDivisions = async (_req: Request, res: Response): Promise<Response> => {
    const divisions = await DivisionController.divisionRepository.findWithUserCount();

    const divisionResponses: (DivisionResponseDto & { userCount: number })[] = divisions.map(division => ({
      id: division.id,
      code: division.code,
      name: division.name,
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
      userCount: division._count.users,
    }));

    DivisionController.logSuccess('Get all divisions', { count: divisionResponses.length });
    return DivisionController.sendSuccess(res, divisionResponses);
  }

  // Get division by ID
  static getDivision = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'];
    DivisionController.validateRequiredParams(req.params, ['id']);

    if (!id) throw new NotFoundError('Division ID is required');

    const division = await DivisionController.divisionRepository.findById(id);

    if (!division) throw new NotFoundError('Division not found');

    const divisionResponse: DivisionResponseDto = {
      id: division.id,
      code: division.code,
      name: division.name,
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
    };

    DivisionController.logSuccess('Get division by ID', { divisionId: id });
    return DivisionController.sendSuccess(res, divisionResponse);
  }

  // Create division
  static createDivision = async (req: Request, res: Response): Promise<Response> => {
    const divisionData: CreateDivisionDto = req.body;
    DivisionController.validateRequiredFields(req.body, ['code', 'name']);

    const existingDivision = await DivisionController.divisionRepository.findByCode(divisionData.code);
    if (existingDivision) throw new ConflictError('Division with this code already exists');

    const division = await DivisionController.divisionRepository.create(divisionData);

    const divisionResponse: DivisionResponseDto = {
      id: division.id,
      code: division.code,
      name: division.name,
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
    };

    DivisionController.logSuccess('Create division', { divisionId: division.id, code: divisionData.code });
    return DivisionController.sendSuccess(res, divisionResponse, 201);
  }

  // Update division
  static updateDivision = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'];
    DivisionController.validateRequiredParams(req.params, ['id']);
    if (!id) throw new NotFoundError('Division ID is required');

    const updateData: UpdateDivisionDto = req.body;

    const division = await DivisionController.divisionRepository.updateById(id, updateData);

    const divisionResponse: DivisionResponseDto = {
      id: division.id,
      code: division.code,
      name: division.name,
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
    };

    DivisionController.logSuccess('Update division', { divisionId: id });
    return DivisionController.sendSuccess(res, divisionResponse);
  }

  // Delete division
  static deleteDivision = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'];
    DivisionController.validateRequiredParams(req.params, ['id']);
    if (!id) throw new NotFoundError('Division ID is required');

    await DivisionController.divisionRepository.deleteById(id);

    DivisionController.logSuccess('Delete division', { divisionId: id });
    return res.status(204).send();
  }
}
