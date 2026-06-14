'use client'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: '2px solid #2563eb', paddingBottom: 10 },
  title: { fontSize: 24, color: '#2563eb', fontWeight: 'bold' },
  subtitle: { fontSize: 10, color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 10, color: '#6b7280' },
  value: { fontSize: 10, color: '#111827', fontWeight: 'bold' },
  section: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  table: { borderTop: '1px solid #e5e7eb' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb', paddingVertical: 8 },
  tableCell: { flex: 1, fontSize: 10, color: '#374151' },
  total: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' },
  totalBox: { backgroundColor: '#2563eb', padding: 12, borderRadius: 4, minWidth: 160 },
  totalLabel: { fontSize: 10, color: '#bfdbfe' },
  totalValue: { fontSize: 16, color: '#ffffff', fontWeight: 'bold', marginTop: 2 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#9ca3af' },
})

export function FacturePDF({ facture }: { facture: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>PrestaConnect</Text>
          <Text style={styles.subtitle}>Facture #{facture.numero}</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{facture.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{facture.client_nom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Artisan</Text>
            <Text style={styles.value}>{facture.artisan_nom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Statut</Text>
            <Text style={styles.value}>{facture.statut}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { color: '#6b7280' }]}>Description</Text>
              <Text style={[styles.tableCell, { color: '#6b7280', textAlign: 'right' }]}>Montant</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{facture.description}</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>{facture.montant} FCFA</Text>
            </View>
          </View>
        </View>
        <View style={styles.total}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total TTC</Text>
            <Text style={styles.totalValue}>{facture.montant} FCFA</Text>
          </View>
        </View>
        <Text style={styles.footer}>PrestaConnect — Plateforme de mise en relation artisans/clients — www.prestaconnect.bj</Text>
      </Page>
    </Document>
  )
}