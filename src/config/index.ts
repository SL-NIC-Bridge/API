interface Config {
  port: number;
  jwtSecret: string;
  jwtRefreshSecret: string;
  mongoUri: string;
  storageType: 'local' | 's3';
  storageConfig: {
    bucket?: string;
    region?: string;
    baseUrl: string;
  };
  smtp: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    };
  };
}
