import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  VentaLineaNegocio,
  VentaProductoServicio,
} from '../../../domain/entities/dashboard';
import {
  cardStyles,
  categorical,
  colors,
  formatMoney,
  formatPercent,
} from './dashboardTheme';

interface MixItem {
  nombre: string;
  ventas: number;
  porcentaje: number;
}

const MixBlock = ({title, items}: {title: string; items: MixItem[]}) => {
  const total = items.reduce((sum, item) => sum + item.ventas, 0);
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <Text style={styles.blockTitle}>{title}</Text>
        <Text style={styles.blockTotal}>Total {formatMoney(total)}</Text>
      </View>
      <View style={styles.bar}>
        {items.map((item, index) => (
          <View
            key={`${index}-${item.nombre}`}
            style={[
              styles.segment,
              {
                flexGrow: item.porcentaje,
                backgroundColor: categorical[index % categorical.length],
              },
            ]}
          />
        ))}
      </View>
      {items.map((item, index) => (
        <View key={`${index}-${item.nombre}`} style={styles.row}>
          <View
            style={[
              styles.swatch,
              {backgroundColor: categorical[index % categorical.length]},
            ]}
          />
          <Text style={styles.name} numberOfLines={1}>
            {item.nombre}
          </Text>
          <Text style={styles.amount}>{formatMoney(item.ventas)}</Text>
          <Text style={styles.share}>{formatPercent(item.porcentaje)}</Text>
        </View>
      ))}
    </View>
  );
};

interface Props {
  lineas: VentaLineaNegocio[];
  productos: VentaProductoServicio[];
}

export const ServiceMixCard = ({lineas, productos}: Props) => (
  <View style={cardStyles.card}>
    <Text style={cardStyles.title}>Mezcla de servicios</Text>
    <MixBlock
      title="Línea de negocio"
      items={lineas.map(l => ({
        nombre: l.servicio,
        ventas: l.ventas,
        porcentaje: l.porcentaje,
      }))}
    />
    <MixBlock
      title="Producto / servicio"
      items={productos.map(p => ({
        nombre: p.producto,
        ventas: p.ventas,
        porcentaje: p.porcentaje,
      }))}
    />
  </View>
);

const styles = StyleSheet.create({
  block: {marginTop: 14},
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  blockTitle: {fontSize: 13, fontWeight: '600', color: colors.ink},
  blockTotal: {fontSize: 12, color: colors.inkSecondary},
  bar: {flexDirection: 'row', height: 10, gap: 2, marginTop: 8, marginBottom: 4},
  segment: {flexBasis: 0, minWidth: 3, borderRadius: 3},
  row: {flexDirection: 'row', alignItems: 'center', paddingTop: 8},
  swatch: {width: 10, height: 10, borderRadius: 3, marginRight: 8},
  name: {flex: 1, fontSize: 13, color: colors.ink, marginRight: 8},
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  share: {
    width: 52,
    textAlign: 'right',
    fontSize: 12,
    color: colors.inkSecondary,
    fontVariant: ['tabular-nums'],
  },
});
