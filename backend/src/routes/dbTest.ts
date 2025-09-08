import { Router } from 'express';
import db from '../db/connection';
import { sql } from 'drizzle-orm';

const router = Router();

// Simple database connection test
router.get('/', async (req, res) => {
  try {
    // Test basic connection with raw SQL
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('Database connection test result:', result);
    
    // Test table exists
    const tableCheck = await db.execute(sql`SELECT COUNT(*) FROM data_plans`);
    console.log('Data plans count:', tableCheck);

    res.json({
      status: 'database_ok',
      connection: 'successful',
      data_plans_count: tableCheck,
      test_result: result
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'database_error', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;