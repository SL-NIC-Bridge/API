// Health check response DTO
export interface HealthCheckResponseDto {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
  environment: string;
  database: 'connected' | 'disconnected';
  error?: string;
}

// Health check success response
export interface HealthCheckSuccessDto extends HealthCheckResponseDto {
  status: 'OK';
  database: 'connected';
}

// Health check error response
export interface HealthCheckErrorDto extends HealthCheckResponseDto {
  status: 'ERROR';
  database: 'disconnected';
  error: string;
} 