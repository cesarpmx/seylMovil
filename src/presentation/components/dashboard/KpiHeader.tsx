import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {DashboardKpis} from '../../../domain/entities/dashboard';
import {colors, formatMoney, formatPercent} from './dashboardTheme';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
  'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const formatPeriodo = (periodo: string) => {
  const [anio, mes] = periodo.split('-');
  return `${MESES[Number(mes) - 1]} ${anio}`;
};

interface Props {
  periodo: string;
  kpis: DashboardKpis;
  isMock?: boolean;
}

export const KpiHeader = ({periodo, kpis, isMock}: Props) => (
  <View style={styles.hero}>
    {/* Fondo absoluto: con padding/hijos dentro, el gradiente recorta el contenido en iOS. */}
    <LinearGradient
      colors={[colors.heroStart, colors.heroEnd]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.topRow}>
      <Text style={styles.periodo}>{formatPeriodo(periodo)}</Text>
      {isMock && <Text style={styles.badge}>Datos de prueba</Text>}
    </View>
    <Text style={styles.heroLabel}>Ventas del período</Text>
    <Text style={styles.heroValue} adjustsFontSizeToFit numberOfLines={1}>
      {formatMoney(kpis.ventasPeriodo)}
    </Text>
    <View style={styles.tiles}>
      <Tile label="Clientes activos" value={String(kpis.clientesActivos)} />
      <View style={styles.divider} />
      <Tile label="Forecast del mes" value={formatMoney(kpis.forecastMes)} />
      <View style={styles.divider} />
      <Tile label="Crecimiento YTD" value={formatPercent(kpis.crecimientoYtd)} />
    </View>
  </View>
);

const Tile = ({label, value}: {label: string; value: string}) => (
  <View style={styles.tile}>
    <Text style={styles.tileValue} adjustsFontSizeToFit numberOfLines={1}>
      {value}
    </Text>
    <Text style={styles.tileLabel} numberOfLines={2}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodo: {color: '#ffffff', fontSize: 13, fontWeight: '600'},
  badge: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  heroLabel: {color: '#cde2fb', fontSize: 14, marginTop: 16},
  heroValue: {color: '#ffffff', fontSize: 48, fontWeight: '800', marginTop: 2},
  tiles: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.35)',
  },
  tile: {flex: 1},
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 10,
  },
  tileValue: {color: '#ffffff', fontSize: 18, fontWeight: '700'},
  tileLabel: {color: '#cde2fb', fontSize: 11, marginTop: 2},
});
