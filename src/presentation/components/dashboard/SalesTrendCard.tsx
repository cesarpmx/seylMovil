import React, {useMemo, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {TendenciaVentas} from '../../../domain/entities/dashboard';
import {cardStyles, colors, formatMoney, formatPercent} from './dashboardTheme';

const Y_AXIS_WIDTH = 40;
const CHART_HEIGHT = 190;
const STEP = 10_000_000;
// Márgenes horizontales de la pantalla y de la tarjeta (16 + 16 por lado).
const HORIZONTAL_INSETS = 64;

// El backend manda 0 cuando no hay meta o año anterior; no debe dibujarse como caída.
const firstWithValue = (values: number[]) =>
  Math.max(values.findIndex(value => value > 0), 0);

export const SalesTrendCard = ({data}: {data: TendenciaVentas[]}) => {
  const {width} = useWindowDimensions();
  const [selected, setSelected] = useState(() =>
    data.reduce((last, item, index) => (item.ventas > 0 ? index : last), 0),
  );

  const columnWidth = (width - HORIZONTAL_INSETS - Y_AXIS_WIDTH) / data.length;
  const barWidth = Math.round(columnWidth * 0.62);
  const spacing = columnWidth - barWidth;

  const bars = useMemo(
    () =>
      data.map((item, index) => ({
        value: item.ventas,
        label: item.mes,
        frontColor: index === selected ? colors.barSelected : colors.bar,
      })),
    [data, selected],
  );
  const metaLine = useMemo(() => data.map(d => ({value: d.meta})), [data]);
  const anteriorLine = useMemo(
    () => data.map(d => ({value: d.ventasAnterior})),
    [data],
  );

  const maxValue = useMemo(() => {
    const max = Math.max(
      ...data.flatMap(d => [d.ventas, d.meta, d.ventasAnterior]),
    );
    return Math.max(Math.ceil(max / STEP), 1) * STEP;
  }, [data]);

  const current = data[selected];
  const cumplimiento =
    current.meta > 0 ? (current.ventas / current.meta) * 100 : null;

  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.title}>Ventas vs. meta</Text>
      <Text style={cardStyles.subtitle}>Últimos 12 meses · toca un mes</Text>

      <View style={styles.readout}>
        <Text style={styles.readoutMonth}>{current.mes}</Text>
        <Text style={styles.readoutFulfillment}>
          {cumplimiento === null
            ? 'Sin meta'
            : `${formatPercent(cumplimiento)} de la meta`}
        </Text>
      </View>
      <View style={styles.legend}>
        <LegendValue
          label="Ventas"
          value={current.ventas}
          color={colors.barSelected}
        />
        <LegendValue label="Meta" value={current.meta} color={colors.meta} />
        <LegendValue
          label="Año anterior"
          value={current.ventasAnterior}
          color={colors.anterior}
        />
      </View>

      {/* endSpacing evita que se corte la última línea; el recorte contiene su sobrante. */}
      <View style={styles.chartClip}>
        <BarChart
          data={bars}
          width={width - HORIZONTAL_INSETS - Y_AXIS_WIDTH}
          height={CHART_HEIGHT}
          barWidth={barWidth}
          spacing={spacing}
          initialSpacing={spacing / 2}
          endSpacing={columnWidth}
          disableScroll
          disablePress
          isAnimated
          animationDuration={500}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          maxValue={maxValue}
          stepValue={STEP}
          noOfSections={maxValue / STEP}
          yAxisLabelWidth={Y_AXIS_WIDTH}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={colors.baseline}
          rulesColor={colors.grid}
          rulesType="solid"
          formatYLabel={label => `$${Number(label) / 1e6}M`}
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          showLine
          lineData={metaLine}
          lineConfig={{
            color: colors.meta,
            thickness: 2,
            hideDataPoints: true,
            startIndex: firstWithValue(metaLine.map(p => p.value)),
          }}
          lineData2={anteriorLine}
          lineConfig2={{
            color: colors.anterior,
            thickness: 2,
            hideDataPoints: true,
            startIndex: firstWithValue(anteriorLine.map(p => p.value)),
          }}
        />
        {/* Columnas táctiles de alto completo: los meses en 0 no tienen barra que tocar. */}
        <View style={[styles.touchLayer, {left: Y_AXIS_WIDTH}]}>
          {data.map((item, index) => (
            <Pressable
              key={item.mes}
              style={{width: columnWidth}}
              onPress={() => setSelected(index)}
              accessibilityRole="button"
              accessibilityState={{selected: index === selected}}
              accessibilityLabel={`${item.mes}: ventas ${formatMoney(
                item.ventas,
              )}, meta ${formatMoney(item.meta)}, año anterior ${formatMoney(
                item.ventasAnterior,
              )}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

interface LegendValueProps {
  label: string;
  value: number;
  color: string;
}

const LegendValue = ({label, value, color}: LegendValueProps) => (
  <View style={styles.legendItem}>
    <View style={styles.legendLabelRow}>
      <View style={[styles.swatch, {backgroundColor: color}]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
    <Text style={styles.legendValue}>
      {value > 0 ? formatMoney(value) : '—'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  readout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 14,
  },
  readoutMonth: {fontSize: 20, fontWeight: '700', color: colors.ink},
  readoutFulfillment: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkSecondary,
  },
  legend: {flexDirection: 'row', marginTop: 8, marginBottom: 16},
  legendItem: {flex: 1},
  legendLabelRow: {flexDirection: 'row', alignItems: 'center'},
  swatch: {width: 10, height: 10, borderRadius: 3, marginRight: 5},
  legendLabel: {fontSize: 12, color: colors.inkSecondary},
  legendValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 2,
  },
  chartClip: {overflow: 'hidden'},
  axisText: {fontSize: 10, color: colors.inkMuted},
  touchLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
});
