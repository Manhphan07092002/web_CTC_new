import { Router } from 'express';
import usersRouter from '../users';
import permissionsRouter from '../permissions';
import securityRouter from '../security';
import securityMonitoringRouter from '../security-monitoring';
import analyticsRouter from '../analytics';
import goalsRouter from '../goals';
import funnelMetricsRouter from '../funnel-metrics';
import adminSecurityRouter from '../admin-security';

const router = Router();

router.use('/users', usersRouter);
router.use('/permissions', permissionsRouter);
router.use('/security', securityRouter);
router.use('/security-monitoring', securityMonitoringRouter);
router.use('/analytics', analyticsRouter);
router.use('/goals', goalsRouter);
router.use('/funnel-metrics', funnelMetricsRouter);
router.use('/admin-security', adminSecurityRouter);

export default router;
