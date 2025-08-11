import React from 'react';
import PDFGenerator from './PDFGenerator';

const InvoiceWithPDF = () => {
  const sampleInvoiceData = {
    id: '001',
    date: new Date().toLocaleDateString(),
    customer: 'John Doe',
    items: [
      { name: 'Laundry Service', quantity: 2, price: 15.00, total: 30.00 },
      { name: 'Dry Cleaning', quantity: 1, price: 25.00, total: 25.00 },
    ],
    total: 55.00
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Invoice</h2>
      
      {/* Your existing invoice content */}
      <div id="invoice-content">
        <p>Invoice #{sampleInvoiceData.id}</p>
        <p>Date: {sampleInvoiceData.date}</p>
        <p>Customer: {sampleInvoiceData.customer}</p>
        
        <table className="w-full mt-4">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sampleInvoiceData.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${item.price}</td>
                <td>${item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <p className="mt-4 font-bold">Total: ${sampleInvoiceData.total}</p>
      </div>
      
      {/* PDF Download Button */}
      <div className="mt-4">
        <PDFGenerator 
          invoiceData={sampleInvoiceData} 
          fileName="invoice.pdf"
        />
      </div>
    </div>
  );
};

export default InvoiceWithPDF;