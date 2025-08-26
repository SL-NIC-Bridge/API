import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { DivisionRepository } from '../repositories/divisionRepository';
import { 
  CreateDivisionDto,
  UpdateDivisionDto,
  DivisionResponseDto
} from '../types/dto/division.dto';
import { NotFoundError, ConflictError } from '../utils/errors';
import { EmailService } from '../services/EmailService';

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
    try {
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

      // Send email notification (now with detailed logging)
      console.log('🎉 Division created successfully, sending email notification...');
      const emailResult = await EmailService.sendDivisionCreated({
        id: division.id,
        code: division.code,
        name: division.name,
        createdAt: division.createdAt,
      });

      console.log('📧 Email result:', emailResult);

      DivisionController.logSuccess('Create division', { 
        divisionId: division.id, 
        code: divisionData.code,
        emailSent: emailResult.success,
        emailRecipients: emailResult.recipients
      });

      return DivisionController.sendSuccess(res, {
        ...divisionResponse,
        emailNotification: {
          sent: emailResult.success,
          recipients: emailResult.recipients,
          messageId: emailResult.messageId,
          error: emailResult.error
        }
      }, 201);

    } catch (error) {
      console.error('❌ Error creating division:', error);
      
      // Send error alert email for division creation failures
      EmailService.sendSystemAlert(
        'Division Creation Failed',
        `Failed to create division with code: ${req.body.code}`,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          requestBody: req.body
        }
      );

      throw error; // Re-throw the original error
    }
  }

  // Update division
  static updateDivision = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params['id'];
      DivisionController.validateRequiredParams(req.params, ['id']);
      if (!id) throw new NotFoundError('Division ID is required');

      const updateData: UpdateDivisionDto = req.body;

      // Get the existing division for email comparison
      const existingDivision = await DivisionController.divisionRepository.findById(id);
      if (!existingDivision) throw new NotFoundError('Division not found');

      // Store old data for email
      const oldData = {
        code: existingDivision.code,
        name: existingDivision.name,
      };

      const division = await DivisionController.divisionRepository.updateById(id, updateData);

      const divisionResponse: DivisionResponseDto = {
        id: division.id,
        code: division.code,
        name: division.name,
        createdAt: division.createdAt,
        updatedAt: division.updatedAt,
      };

      // Send email notification only if data actually changed (non-blocking)
      const hasChanges = (
        (updateData.code && oldData.code !== updateData.code) ||
        (updateData.name && oldData.name !== updateData.name)
      );

      if (hasChanges) {
        EmailService.sendDivisionUpdated(
          {
            id: division.id,
            code: division.code,
            name: division.name,
            createdAt: division.createdAt,
            updatedAt: division.updatedAt,
          },
          oldData
        ).catch(error => {
          console.error('Failed to send division updated email:', error);
        });
      }

      DivisionController.logSuccess('Update division', { divisionId: id });
      return DivisionController.sendSuccess(res, divisionResponse);

    } catch (error) {
      // Send error alert email for division update failures
      EmailService.sendSystemAlert(
        'Division Update Failed',
        `Failed to update division with ID: ${req.params['id']}`,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          divisionId: req.params['id'],
          requestBody: req.body
        }
      ).catch(emailError => {
        console.error('Failed to send error alert email:', emailError);
      });

      throw error; // Re-throw the original error
    }
  }

  // Delete division
  static deleteDivision = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params['id'];
      DivisionController.validateRequiredParams(req.params, ['id']);
      if (!id) throw new NotFoundError('Division ID is required');

      // Get division data before deletion for email
      const divisionToDelete = await DivisionController.divisionRepository.findById(id);
      if (!divisionToDelete) throw new NotFoundError('Division not found');

      await DivisionController.divisionRepository.deleteById(id);

      // Send email notification (non-blocking)
      EmailService.sendDivisionDeleted({
        id: divisionToDelete.id,
        code: divisionToDelete.code,
        name: divisionToDelete.name,
        createdAt: divisionToDelete.createdAt,
      }).catch(error => {
        console.error('Failed to send division deleted email:', error);
      });

      DivisionController.logSuccess('Delete division', { divisionId: id });
      return res.status(204).send();

    } catch (error) {
      // Send error alert email for division deletion failures
      EmailService.sendSystemAlert(
        'Division Deletion Failed',
        `Failed to delete division with ID: ${req.params['id']}`,
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          divisionId: req.params['id']
        }
      ).catch(emailError => {
        console.error('Failed to send error alert email:', emailError);
      });

      throw error; // Re-throw the original error
    }
  }

  // Test email endpoint (optional - for testing purposes)
  static testEmail = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const testDivision = {
        id: 'test-123',
        code: '999',
        name: 'Test Division',
        createdAt: new Date(),
      };

      await EmailService.sendDivisionCreated(testDivision);
      
      return DivisionController.sendSuccess(res, { message: 'Test email sent successfully' });

    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }

  // Email service health check
  static emailHealthCheck = async (_req: Request, res: Response): Promise<Response> => {
    try {
      console.log('🔍 Performing email health check...');
      const connectionResult = await EmailService.testConnection();
      
      console.log('📊 Health check result:', connectionResult);
      
      return DivisionController.sendSuccess(res, {
        emailServiceStatus: connectionResult.connected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        config: connectionResult.config,
        error: connectionResult.error
      });

    } catch (error) {
      console.error('❌ Email service health check failed:', error);
      throw error;
    }
  }
}