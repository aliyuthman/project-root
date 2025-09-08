import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import db from '../db/connection';
import { dataPlans } from '../db/schema';

const router = Router();

// GET /api/data-plans/:network
router.get('/:network', async (req, res) => {
  const { network } = req.params;
  
  // Validate network
  const validNetworks = ['mtn', 'airtel', 'glo', '9mobile'];
  if (!validNetworks.includes(network.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid network' });
  }

  try {
    console.log(`Fetching data plans for network: ${network.toLowerCase()}`);
    
    const plans = await db.select().from(dataPlans)
      .where(and(
        eq(dataPlans.network, network.toLowerCase()),
        eq(dataPlans.is_available, true)
      ));

    console.log(`Found ${plans.length} plans for ${network.toLowerCase()}`);

    res.json({
      network: network.toLowerCase(),
      plans: plans.map(plan => ({
        id: plan.id,
        plan_name: plan.plan_name,
        data_amount: plan.data_amount,
        price: plan.price,
        validity: plan.validity
      }))
    });
  } catch (error) {
    console.error('Error fetching data plans:', error);
    console.error('Error details:', error);
    res.status(500).json({ error: 'Failed to fetch data plans', details: error.message });
  }
});

export default router;