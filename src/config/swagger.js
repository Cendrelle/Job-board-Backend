const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job-board',
      version: '1.0.0',
      description: 'Documentation application web avec Swagger',
      contact: {
        name: 'Job-board Developer',
      },
      'x-api-credentials': {
        'Default Admin Email': 'admin@jobbooster.com',
        'Default Admin Password': 'AdminPassword123!',
        'Note': 'Changez obligatoirement ces identifiants en production',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur local',
      },
    ],
  },
  apis: ['./src/routes/*.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = specs;
