import { Router } from 'express';
import { checkHealth } from './health.controller';
import { registry } from '../../config/swagger';

const router = Router();

registry.registerPath({
  method: 'get',
  path: '/api/health-check',
  tags: ['System'],
  summary: 'Health Check',
  responses: {
    200: { description: 'All services are working' },
    503: { description: 'One of service dont work (DB or Redis)' },
  },
});

router.get('/', checkHealth);

export default router;
