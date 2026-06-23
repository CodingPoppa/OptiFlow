// frontend/src/components/BillingPOS.jsx
import React, { useState, useEffect } from 'react';

/**
 * BillingPOS Component
 * Handles the Point of Sale interface: barcode search, itemized cart, GST auto-calc, and checkout.
 * Built with Tailwind CSS for simplicity and responsiveness, catering to basic technical literacy.
 */
const BillingPOS = () => {
  const [skuSearch, setSkuSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [totals, setTotals] = useState({ subTotal: 0, taxTotal: 0, grandTotal: 0 });

  // Mock Database of Inventory Items
  const inventoryMock = [
    { id: '1', name: 'Ray-Ban Aviator 3025', sku: 'RB-001', price: 5500, taxRate: 18 },
    { id: '2', name: 'Crizal Prevencia Lens', sku: 'CR-002', price: 2200, taxRate: 12 },
    { id: '3', name: 'Contact Lens Solution', sku: 'SL-003', price: 450, taxRate: 12 },
  ];

  // Function to simulate scanning a barcode or searching by SKU
  const handleAddToCart = (e) => {
    e.preventDefault();
    const item = inventoryMock.find(i => i.sku === skuSearch.toUpperCase());

    if (item) {
      // Check if already in cart
      const existing = cart.find(c => c.id === item.id);
      if (existing) {
        setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      } else {
        setCart([...cart, { ...item, qty: 1, discount: 0 }]);
      }
      setSkuSearch(''); // Reset search
    } else {
      alert("Product not found! Please check the code.");
    }
  };

  // Recalculate totals whenever the cart changes
  useEffect(() => {
    let sub = 0;
    let tax = 0;

    cart.forEach(item => {
      const taxableAmount = (item.price * item.qty) - item.discount;
      const itemTax = taxableAmount * (item.taxRate / 100);

      sub += taxableAmount;
      tax += itemTax;
    });

    setTotals({
      subTotal: sub,
      taxTotal: tax,
      grandTotal: sub + tax
    });
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Cart is empty!");
    alert(\`Sale completed successfully! Total collected: ₹\${totals.grandTotal.toFixed(2)}\`);
    setCart([]); // Clear cart after checkout
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-800 font-sans">

      {/* Left Pane: Cart & Search */}
      <div className="w-full md:w-2/3 p-6 flex flex-col bg-white shadow-md z-10">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">New Sale (POS)</h1>

        {/* Search Bar */}
        <form onSubmit={handleAddToCart} className="flex mb-6">
          <input
            type="text"
            value={skuSearch}
            onChange={(e) => setSkuSearch(e.target.value)}
            placeholder="Scan Barcode or Enter Product Code (e.g., RB-001)"
            className="flex-grow p-4 text-lg border-2 border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button type="submit" className="bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-r-lg hover:bg-blue-700 transition">
            Add
          </button>
        </form>

        {/* Cart Table */}
        <div className="flex-grow overflow-auto border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-4 border-b font-semibold">Item Name</th>
                <th className="p-4 border-b font-semibold text-center">Qty</th>
                <th className="p-4 border-b font-semibold text-right">Price (₹)</th>
                <th className="p-4 border-b font-semibold text-right">GST %</th>
                <th className="p-4 border-b font-semibold text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Cart is empty. Scan an item to begin.</td></tr>
              )}
              {cart.map(item => {
                const itemTotal = (item.price * item.qty) + ((item.price * item.qty) * (item.taxRate / 100));
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition border-b">
                    <td className="p-4 font-medium text-lg">{item.name}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => setCart(cart.map(c => c.id===item.id ? {...c, qty: Math.max(1, c.qty-1)} : c))} className="bg-gray-200 px-3 py-1 rounded-md text-xl">-</button>
                        <span className="text-xl w-8">{item.qty}</span>
                        <button onClick={() => setCart(cart.map(c => c.id===item.id ? {...c, qty: c.qty+1} : c))} className="bg-gray-200 px-3 py-1 rounded-md text-xl">+</button>
                      </div>
                    </td>
                    <td className="p-4 text-right text-lg">{item.price.toFixed(2)}</td>
                    <td className="p-4 text-right text-lg text-gray-500">{item.taxRate}%</td>
                    <td className="p-4 text-right font-bold text-lg">{itemTotal.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Pane: Summary & Checkout */}
      <div className="w-full md:w-1/3 bg-gray-100 p-8 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8 text-gray-700 border-b-2 pb-4">Bill Summary</h2>

          <div className="flex justify-between mb-4 text-xl">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">₹{totals.subTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mb-4 text-xl">
            <span className="text-gray-600">GST (CGST/SGST):</span>
            <span className="font-semibold text-red-500">+ ₹{totals.taxTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t-2 border-dashed border-gray-300 text-3xl font-bold">
            <span className="text-gray-800">Grand Total:</span>
            <span className="text-green-600">₹{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <button
            onClick={handleCheckout}
            className="w-full py-5 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-xl shadow-lg transition transform hover:scale-105"
          >
            Print Bill & Collect Payment
          </button>
          <button
            onClick={() => setCart([])}
            className="w-full py-4 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 text-xl font-bold rounded-xl transition"
          >
            Clear Cart
          </button>
        </div>
      </div>

    </div>
  );
};

export default BillingPOS;
