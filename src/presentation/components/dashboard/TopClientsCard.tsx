import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {PieChart} from 'react-native-gifted-charts';
import {TopCliente} from '../../../domain/entities/dashboard';
import {
  cardStyles,
  categorical,
  colors,
  formatMoney,
  formatPercent,
} from './dashboardTheme';

export const TopClientsCard = ({clientes}: {clientes: TopCliente[]}) => {
  const concentracion = clientes.reduce((sum, c) => sum + c.porcentajeTotal, 0);
  const otros = Math.max(100 - concentracion, 0);

  const slices = [
    ...clientes.map((c, index) => ({
      value: c.porcentajeTotal,
      color: categorical[index % categorical.length],
    })),
    {value: otros, color: colors.otros},
  ];

  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.title}>Top {clientes.length} clientes</Text>
      <Text style={cardStyles.subtitle}>Participación en ventas del período</Text>

      <View style={styles.chart}>
        <PieChart
          data={slices}
          donut
          radius={84}
          innerRadius={60}
          innerCircleColor={colors.card}
          strokeColor={colors.card}
          strokeWidth={2}
          centerLabelComponent={() => (
            <View style={styles.center}>
              <Text style={styles.centerValue}>
                {formatPercent(concentracion)}
              </Text>
              <Text style={styles.centerLabel}>
                del total en {clientes.length}
              </Text>
            </View>
          )}
        />
      </View>

      {clientes.map((c, index) => (
        <View key={c.cliente} style={styles.row}>
          <View
            style={[
              styles.swatch,
              {backgroundColor: categorical[index % categorical.length]},
            ]}
          />
          <Text style={styles.name} numberOfLines={1}>
            {c.cliente}
          </Text>
          <Text style={styles.amount}>{formatMoney(c.ventas)}</Text>
          <Text style={styles.share}>{formatPercent(c.porcentajeTotal)}</Text>
        </View>
      ))}
      <View style={styles.row}>
        <View style={[styles.swatch, {backgroundColor: colors.otros}]} />
        <Text style={styles.name}>Otros clientes</Text>
        <Text style={styles.share}>{formatPercent(otros)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chart: {alignItems: 'center', marginVertical: 16},
  center: {alignItems: 'center'},
  centerValue: {fontSize: 24, fontWeight: '800', color: colors.ink},
  centerLabel: {fontSize: 11, color: colors.inkSecondary, marginTop: 1},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.grid,
  },
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
    marginLeft: 'auto',
  },
});
