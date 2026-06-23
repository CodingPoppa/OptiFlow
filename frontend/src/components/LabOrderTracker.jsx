// frontend/src/components/LabOrderTracker.jsx
import React, { useState } from 'react';

/**
 * LabOrderTracker Component
 * Displays a simple, easy-to-read table for staff to track the status of eyeglasses
 * being fitted with lenses. Includes visual status badges.
 */
const LabOrderTracker = () => {
  // Mock State for Lab Orders
  const [orders, setOrders] = useState([
    { id: '1', orderNo: 'ORD-101', patientName: 'Rahul Sharma', lens: 'KODAK SV BlueCut', status: 'SENT_TO_LAB', date: 'Oct 24, 2023' },
    { id: '2', orderNo: 'ORD-102', patientName: 'Priya Singh', lens: 'Crizal Bifocal', status: 'RECEIVED_FROM_LAB', date: 'Oct 22, 2023' },
    { id: '3', orderNo: 'ORD-103', patientName: 'Amit Patel', lens: 'Standard Single Vision', status: 'READY_FOR_DELIVERY', date: 'Oct 20, 2023' },
  ]);

  // Status mapping for colors and readable text
  const statusConfig = {
    'ORDER_PLACED': { text: 'Order Placed', color: 'bg-gray-200 text-gray-800' },
    'SENT_TO_LAB': { text: 'Sent to Lab', color: 'bg-blue-100 text-blue-800 border border-blue-300' },
    'IN_PROGRESS': { text: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
    'RECEIVED_FROM_LAB': { text: 'Received (In Store)', color: 'bg-purple-100 text-purple-800 border border-purple-300' },
    'READY_FOR_DELIVERY': { text: 'Ready for Patient', color: 'bg-green-100 text-green-800 border border-green-300 font-bold' },
    'DELIVERED': { text: 'Delivered', color: 'bg-gray-800 text-white' }
  };

  // Handler to progress status
  const updateStatus = (id, currentStatus) => {
    let nextStatus = '';

    // Simple state machine progression
    if (currentStatus === 'SENT_TO_LAB') nextStatus = 'RECEIVED_FROM_LAB';
    else if (currentStatus === 'RECEIVED_FROM_LAB') nextStatus = 'READY_FOR_DELIVERY';
    else if (currentStatus === 'READY_FOR_DELIVERY') nextStatus = 'DELIVERED';

    if (nextStatus) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: nextStatus } : o));
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Lab Order Tracker</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage prescription glasses being fitted.</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-sm text-lg">
            + New External Order
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="p-5 font-semibold text-gray-700 text-lg">Order #</th>
                <th className="p-5 font-semibold text-gray-700 text-lg">Date</th>
                <th className="p-5 font-semibold text-gray-700 text-lg">Patient Name</th>
                <th className="p-5 font-semibold text-gray-700 text-lg">Lens Details</th>
                <th className="p-5 font-semibold text-gray-700 text-lg">Current Status</th>
                <th className="p-5 font-semibold text-gray-700 text-lg text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-blue-50 transition">
                  <td className="p-5 font-bold text-gray-900">{order.orderNo}</td>
                  <td className="p-5 text-gray-600 text-lg">{order.date}</td>
                  <td className="p-5 font-medium text-lg">{order.patientName}</td>
                  <td className="p-5 text-gray-600 text-lg">{order.lens}</td>
                  <td className="p-5">
                    <span className={\`px-4 py-2 rounded-full text-sm \${statusConfig[order.status].color}\`}>
                      {statusConfig[order.status].text}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    {order.status !== 'DELIVERED' ? (
                      <button
                        onClick={() => updateStatus(order.id, order.status)}
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                      >
                        Update Status
                      </button>
                    ) : (
                      <span className="text-gray-400 italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-lg">No active lab orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default LabOrderTracker;
