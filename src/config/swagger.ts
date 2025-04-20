import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Documentation',
      version,
      description: 'API documentation for the Express.js + TypeScript boilerplate',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
            },
            isEmailVerified: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Token: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
            expires: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            tokens: {
              type: 'object',
              properties: {
                access: {
                  $ref: '#/components/schemas/Token',
                },
                refresh: {
                  $ref: '#/components/schemas/Token',
                },
              },
            },
          },
        },
        HomeResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/home': {
        get: {
          tags: ['Home'],
          summary: 'Get current user details',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'User details retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HomeResponse',
                  },
                },
              },
            },
            '401': {
              description: 'Please authenticate',
            },
            '404': {
              description: 'User not found',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/v1/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
