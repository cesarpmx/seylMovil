import {StyleSheet} from 'react-native';

export const colors = {
  page: '#f1f2f0',
  card: '#fcfcfb',
  ink: '#0b0b0b',
  inkSecondary: '#52514e',
  inkMuted: '#898781',
  grid: '#e1e0d9',
  baseline: '#c3c2b7',
  heroStart: '#0d366b',
  heroEnd: '#256abf',
  barSelected: '#2a78d6',
  bar: '#86b6ef',
  meta: '#eb6834',
  anterior: '#898781',
  otros: '#c3c2b7',
};

// Orden fijo de la paleta categórica: el color sigue a la posición de la serie.
export const categorical = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];

export const formatMoney = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1e6) {
    return `$${(value / 1e6).toFixed(1)} M`;
  }
  if (abs >= 1e3) {
    return `$${(value / 1e3).toFixed(0)} K`;
  }
  return `$${value.toFixed(0)}`;
};

export const formatPercent = (value: number): string =>
  `${value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0d366b',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  title: {fontSize: 16, fontWeight: '700', color: colors.ink},
  subtitle: {fontSize: 12, color: colors.inkSecondary, marginTop: 2},
});
