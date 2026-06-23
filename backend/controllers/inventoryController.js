// backend/controllers/inventoryController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get Stock Aging Report for a Branch
 * Aggregates current branch stock levels and groups them into age buckets
 * based on their purchaseDate to help identify slow-moving stock.
 */
exports.getStockAgingReport = async (req, res) => {
  try {
    const { branchId } = req.params;

    if (!branchId) {
      return res.status(400).json({ error: 'Branch ID is required.' });
    }

    // Fetch all inventory for the branch that is currently in stock
    const inventory = await prisma.inventory.findMany({
      where: {
        branchId: branchId,
        quantity: { gt: 0 } // Only items currently in stock
      }
    });

    const now = new Date();

    // Initialize aging buckets
    const report = {
      '0_30_days': { count: 0, totalValue: 0, items: [] },
      '31_60_days': { count: 0, totalValue: 0, items: [] },
      '61_90_days': { count: 0, totalValue: 0, items: [] },
      '90_plus_days': { count: 0, totalValue: 0, items: [] } // Slow moving
    };

    // Process each item into the correct bucket
    inventory.forEach(item => {
      // Calculate age in days
      const purchaseDate = new Date(item.purchaseDate);
      const diffTime = Math.abs(now - purchaseDate);
      const ageInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const stockValue = item.quantity * item.costPrice;

      let bucketKey = '';
      if (ageInDays <= 30) {
        bucketKey = '0_30_days';
      } else if (ageInDays <= 60) {
        bucketKey = '31_60_days';
      } else if (ageInDays <= 90) {
        bucketKey = '61_90_days';
      } else {
        bucketKey = '90_plus_days';
      }

      report[bucketKey].count += item.quantity;
      report[bucketKey].totalValue += stockValue;

      // Optionally attach item summary to bucket (limit in production for large datasets)
      report[bucketKey].items.push({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        ageInDays,
        stockValue
      });
    });

    res.status(200).json({
      branchId,
      generatedAt: now,
      summary: {
        totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)
      },
      agingBuckets: report
    });

  } catch (error) {
    console.error('Error generating stock aging report:', error);
    res.status(500).json({ error: 'Internal server error generating report.' });
  }
};
