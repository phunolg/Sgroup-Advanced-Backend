import express, { Request, Response, Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPIDocument } from './openAPIDocumentGenerator';

export const openAPIRouter: Router = (() => {
  const router = express.Router();
  const doc = generateOpenAPIDocument();

  router.get('/swagger.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(doc);
  });

  router.use('/', swaggerUi.serve, swaggerUi.setup(doc));
  return router;
})();
