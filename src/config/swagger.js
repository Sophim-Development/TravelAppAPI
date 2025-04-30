import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel App API',
      version: '1.0.0',
      description: 'API documentation for the Travel App',
    },
    servers: [
      {
        url: 'http://localhost:5003/api',
        description: 'API v1',
      },
      {
        url: 'http://localhost:5003/api/v2',
        description: 'API v2',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
export default swaggerDocs;