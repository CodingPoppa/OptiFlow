// backend/controllers/billingController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new Sale (POS)
 * Handles tax calculation (CGST/SGST vs IGST), decrements inventory, and saves the invoice.
 */
exports.createSale = async (req, res) => {
  try {
    const {
      branchId,
      patientId, // optional
      salesPersonId,
      paymentMode,
      paymentRef,
      items // Array of { sku/inventoryId, quantity, unitPrice, discount }
    } = req.body;

    // 1. Fetch branch to determine its state (for IGST vs CGST/SGST logic)
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    const branchState = branch.state; // e.g., "Maharashtra"

    let subTotal = 0;
    let totalDiscount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const processedItems = [];

    // 2. Process each item in the cart
    for (const item of items) {
      // Find the inventory item to get cost, tax rate, and verify quantity
      const inventoryItem = await prisma.inventory.findUnique({ where: { id: item.inventoryId } });

      if (!inventoryItem) {
        return res.status(404).json({ error: \`Item \${item.inventoryId} not found\` });
      }
      if (inventoryItem.quantity < item.quantity) {
        return res.status(400).json({ error: \`Insufficient stock for \${inventoryItem.name}\` });
      }

      // Calculate base amounts
      const itemSubTotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      const taxableAmount = itemSubTotal - itemDiscount;

      subTotal += itemSubTotal;
      totalDiscount += itemDiscount;

      // Tax Calculation based on Indian GST rules
      let itemCgst = 0;
      let itemSgst = 0;
      let itemIgst = 0;

      // Simplification: In a real app, customer's state might determine IGST.
      // Here we assume intra-state (CGST + SGST) for general retail, unless specified otherwise.
      // E.g., if we had a customerState, we would compare it. For now, assume intra-state.
      const isInterState = false; // Replace with logic comparing patient.state vs branch.state if needed

      if (isInterState) {
        itemIgst = taxableAmount * (inventoryItem.taxRate / 100);
        igstTotal += itemIgst;
      } else {
        // Split GST equally into CGST and SGST
        const halfTaxRate = inventoryItem.taxRate / 2;
        itemCgst = taxableAmount * (halfTaxRate / 100);
        itemSgst = taxableAmount * (halfTaxRate / 100);
        cgstTotal += itemCgst;
        sgstTotal += itemSgst;
      }

      const itemTotal = taxableAmount + itemCgst + itemSgst + itemIgst;

      processedItems.push({
        inventoryId: inventoryItem.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        cgstAmount: itemCgst,
        sgstAmount: itemSgst,
        igstAmount: itemIgst,
        total: itemTotal
      });
    }

    const grandTotal = subTotal - totalDiscount + cgstTotal + sgstTotal + igstTotal;

    // 3. Perform a Transaction: Create Invoice, Create Invoice Items, Decrement Inventory
    const result = await prisma.$transaction(async (tx) => {
      // Create the main Invoice
      const invoiceNumber = \`INV-\${branchId.slice(-4).toUpperCase()}-\${Date.now()}\`; // Simple generator

      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          branchId,
          patientId,
          salesPersonId,
          subTotal,
          totalDiscount,
          cgstTotal,
          sgstTotal,
          igstTotal,
          grandTotal,
          paymentMode,
          paymentRef,
          items: {
            create: processedItems
          }
        },
        include: { items: true }
      });

      // Decrement Inventory
      for (const pItem of processedItems) {
        await tx.inventory.update({
          where: { id: pItem.inventoryId },
          data: {
            quantity: {
              decrement: pItem.quantity
            }
          }
        });
      }

      return newInvoice;
    });

    res.status(201).json({ message: 'Sale completed successfully', invoice: result });

  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Internal server error processing sale.' });
  }
};
