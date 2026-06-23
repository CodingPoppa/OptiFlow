// backend/controllers/labController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Update Lab Order Status
 * Triggers an internal audit log tracking when a pair of lenses moved from workshop to store.
 */
exports.updateLabOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // Lab Order ID
    const { newStatus, notes, updatedById } = req.body;

    if (!newStatus || !updatedById) {
      return res.status(400).json({ error: 'newStatus and updatedById are required.' });
    }

    // Use a transaction to ensure both the order is updated and the audit log is created
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update the Lab Order status
      const order = await tx.labOrder.update({
        where: { id: id },
        data: {
          status: newStatus
        }
      });

      // 2. Create the Audit Log entry
      await tx.labAudit.create({
        data: {
          labOrderId: order.id,
          status: newStatus,
          notes: notes || '',
          updatedById: updatedById
        }
      });

      return order;
    });

    res.status(200).json({ message: 'Lab order status updated successfully', order: updatedOrder });

  } catch (error) {
    console.error('Error updating lab order status:', error);

    // Handle Prisma specific errors (e.g., record not found)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Lab order not found.' });
    }

    res.status(500).json({ error: 'Internal server error updating lab order.' });
  }
};
