import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 12,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
    padding: 5,
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
  },
});

const InvoicePDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>INVOICE</Text>
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>#{order.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date(order.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Customer Information:</Text>
        <Text style={styles.value}>Name: {order.guest_name || order.user?.name || 'N/A'}</Text>
        <Text style={styles.value}>Email: {order.guest_email || order.user?.email || 'N/A'}</Text>
        {order.guest_phone && <Text style={styles.value}>Phone: {order.guest_phone}</Text>}
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Service</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Category</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Quantity</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Unit Price</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Total</Text>
          </View>
        </View>
        
        {order.order_items?.length > 0 ? (
          order.order_items.map((item, index) => {
            const unitPrice = parseFloat(item.service?.price || 0);
            const quantity = parseFloat(item.quantity || 0);
            const itemTotal = unitPrice * quantity;
            
            return (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.service?.name || 'N/A'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.service?.category || 'N/A'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{quantity.toFixed(2)}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{unitPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{itemTotal.toFixed(2)}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{order.service?.name || 'N/A'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{order.service?.category || 'N/A'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{parseFloat(order.quantity || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{parseFloat(order.service?.price || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{parseFloat(order.total_price || 0).toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.total}>Total: {parseFloat(order.total_price || 0).toFixed(2)}</Text>
    </Page>
  </Document>
);

const PDFGenerator = ({ order, fileName = "invoice.pdf" }) => (
  <PDFDownloadLink
    document={<InvoicePDF order={order} />}
    fileName={fileName}
    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-xs font-medium flex items-center space-x-1"
  >
    {({ blob, url, loading, error }) => (
      <>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
        <span>{loading ? 'Generating...' : 'PDF'}</span>
      </>
    )}
  </PDFDownloadLink>
);

export default PDFGenerator;