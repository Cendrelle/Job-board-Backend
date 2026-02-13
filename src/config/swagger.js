const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.PORT || 3030;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job-board",
      version: "1.0.0",
      description: "Documentation application web avec Swagger",
      contact: {
        name: "Job-board Developer",
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Serveur local",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
