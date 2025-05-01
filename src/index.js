import express from 'express';
import apiRoutes from './routes/api.js';
import apiV2Routes from './routes/apiV2.js';
import { errorHandler } from './middleware/error.js';
import swaggerSpec  from './config/swagger.js';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import './utils/passport.js';
import { logger } from './utils/logger.js';
import rateLimit from 'express-rate-limit';

const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', apiRoutes);
app.use('/api/v2', apiV2Routes);

// Error handling
app.use(errorHandler);

let server = null;

const start = () => {
  if (!server) {
    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  }
  return server;
};

const stop = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { app, server, start, stop };
