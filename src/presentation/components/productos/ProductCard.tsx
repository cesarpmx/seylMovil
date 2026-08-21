import React from 'react';
import {Icon, Text} from '@ui-kitten/components';
import {TouchableOpacity, View, StyleSheet} from 'react-native';

interface Product {
  prdid: string;
  prdclave: string;
  prdnombre: string;
  prdcosto: string;
  prdualid: string;
  prdinner: string;
}

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const DetailItem = ({label, value}: {label: string; value: string}) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1}>
      {value ?? '—'}
    </Text>
  </View>
);

const ProductCard: React.FC<ProductCardProps> = ({product, onPress}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(product)}
      style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon
            name="cube-outline"
            fill="#2563EB"
            style={{width: 22, height: 22}}
          />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.prdnombre}
          </Text>
          <View style={styles.keyRow}>
            <View style={styles.keyChip}>
              <Text style={styles.keyChipText}>{product.prdclave}</Text>
            </View>
            <Text style={styles.idText}>ID: {product.prdid}</Text>
          </View>
        </View>
        <Icon
          name="chevron-right-outline"
          fill="#94A3B8"
          style={{width: 22, height: 22}}
        />
      </View>

      <View style={styles.divider} />

      {/* Details grid */}
      <View style={styles.detailsGrid}>
        <DetailItem label="LÍNEA" value={product.prdcosto} />
        <DetailItem label="UNIDAD" value={product.prdualid} />
        <DetailItem label="INNER" value={product.prdinner} />
        <DetailItem label="ESTATUS" value={product.prdualid} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  keyChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  keyChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    letterSpacing: 0.3,
  },
  idText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    paddingVertical: 4,
    paddingRight: 8,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
});

export default ProductCard;
