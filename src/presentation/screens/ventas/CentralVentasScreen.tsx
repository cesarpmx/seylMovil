import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Layout } from '@ui-kitten/components';
import DatePicker from 'react-native-date-picker';

import { MainLayout } from '../../layouts/MainLayout';
import { useAuthStore } from '../../store/modules/useModulesStore';
import { MyIcon } from '../../components/ui/MyIcon';
import { SelectEmpresa } from '../../components/ui/SelectEmpresa';
import { SelectAlmacen } from '../../components/ui/SelectAlmacen';
import { KpiHeader } from '../../components/dashboard/KpiHeader';
import { SalesTrendCard } from '../../components/dashboard/SalesTrendCard';
import { TopClientsCard } from '../../components/dashboard/TopClientsCard';
import { ServiceMixCard } from '../../components/dashboard/ServiceMixCard';
import { getDashboardVentas } from '../../../actions/ventas/get-DashboardVentas';
import { Dashboard } from '../../../domain/entities/dashboard';

const DIAS_ATRAS_DEFAULT = '365';

// El backend espera dd-MM-yyyy (mismo formato que tareaswms).
const toApiDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}-` +
  `${String(d.getMonth() + 1).padStart(2, '0')}-` +
  `${d.getFullYear()}`;

const toLabelDate = (d: Date) => toApiDate(d).replace(/-/g, '/');

export const CentralVentasScreen = () => {
  const { empresas, almacenes } = useAuthStore();

  // Filtros
  const [empresa, setEmpresa] = useState<number | null>(null);
  const [almacen, setAlmacen] = useState<string | null>(null);
  const [fechaFin, setFechaFin] = useState(new Date());
  const [openFecha, setOpenFecha] = useState(false);
  const [diasAtras, setDiasAtras] = useState(DIAS_ATRAS_DEFAULT);
  const [errores, setErrores] = useState({ empresa: false, almacen: false, dias: false });

  // Resultado
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [busquedaId, setBusquedaId] = useState(0);
  const [empresaConsultada, setEmpresaConsultada] = useState('');

  const buscar = async () => {
    const dias = Number(diasAtras);
    const nuevosErrores = {
      empresa: empresa === null,
      almacen: !almacen,
      dias: !Number.isInteger(dias) || dias <= 0,
    };
    setErrores(nuevosErrores);
    if (nuevosErrores.empresa || nuevosErrores.almacen || nuevosErrores.dias) return;

    setLoading(true);
    setError(false);
    try {
      const data = await getDashboardVentas({
        empresa: empresa!,
        almacen: almacen!,
        fechafin: toApiDate(fechaFin),
        diasAtras: dias,
      });
      setDashboard(data);
      setEmpresaConsultada(
        empresas?.find(e => e.empid === empresa)?.empnomcorto ?? '',
      );
      setBusquedaId(id => id + 1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Solo es "vacío" si no hay nada que graficar: ni ventas, ni meta, ni año
  // anterior, ni clientes, ni mezcla. Con meta/forecast sí se muestra la gráfica.
  const sinDatos =
    dashboard &&
    dashboard.tendenciaVentas.every(
      t => !t.ventas && !t.meta && !t.ventasAnterior,
    ) &&
    dashboard.topClientes.length === 0 &&
    dashboard.ventasPorLineaNegocio.length === 0 &&
    dashboard.ventasPorProductoServicio.length === 0;

  return (
    <MainLayout title="Central de Ventas" subTitle="Ventas">
      <Layout style={styles.screen}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled>
          {/* Filtros */}
          <View style={[styles.card, styles.filtersCard]}>
            <View style={styles.sectionHeader}>
              <MyIcon name="funnel-outline" size={16} />
              <Text style={styles.sectionTitle}>Filtros</Text>
            </View>

            <View style={[styles.fieldGroup, { zIndex: 4000 }]}>
              <Text style={styles.fieldLabel}>Empresa *</Text>
              <SelectEmpresa
                empresas={empresas}
                editableEmpresa
                hasError={errores.empresa}
                onSelect={v => {
                  setEmpresa(v);
                  if (v !== null) setErrores(e => ({ ...e, empresa: false }));
                }}
              />
            </View>

            <View style={[styles.fieldGroup, { zIndex: 3000 }]}>
              <Text style={styles.fieldLabel}>Almacén *</Text>
              <SelectAlmacen
                almacenes={almacenes}
                editable
                hasError={errores.almacen}
                onSelect={v => {
                  setAlmacen(v);
                  if (v) setErrores(e => ({ ...e, almacen: false }));
                }}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.flex]}>
                <Text style={styles.fieldLabel}>Fecha fin *</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.formInput, styles.dateInput]}
                  onPress={() => setOpenFecha(true)}>
                  <Text style={styles.dateText}>{toLabelDate(fechaFin)}</Text>
                  <MyIcon name="calendar-outline" size={16} />
                </TouchableOpacity>
              </View>

              <View style={[styles.fieldGroup, styles.diasField]}>
                <Text style={styles.fieldLabel}>Días atrás *</Text>
                <TextInput
                  style={[styles.formInput, errores.dias && styles.inputError]}
                  value={diasAtras}
                  onChangeText={t => {
                    setDiasAtras(t.replace(/[^0-9]/g, ''));
                    setErrores(e => ({ ...e, dias: false }));
                  }}
                  keyboardType="number-pad"
                  returnKeyType="search"
                  onSubmitEditing={buscar}
                  maxLength={4}
                />
              </View>
            </View>

            {(errores.empresa || errores.almacen || errores.dias) && (
              <Text style={styles.errorText}>
                {errores.dias && !errores.empresa && !errores.almacen
                  ? 'Días atrás debe ser un número mayor a 0.'
                  : 'Completa los campos marcados para buscar.'}
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={loading}
              onPress={buscar}
              style={[styles.searchBtn, loading && styles.searchBtnDisabled]}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <MyIcon name="search-outline" size={18} white />
              )}
              <Text style={styles.searchBtnText}>
                {loading ? 'Buscando…' : 'Buscar'}
              </Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={openFecha}
              date={fechaFin}
              mode="date"
              locale="es"
              maximumDate={new Date()}
              onConfirm={d => {
                setOpenFecha(false);
                setFechaFin(d);
              }}
              onCancel={() => setOpenFecha(false)}
            />
          </View>

          {/* Resultado */}
          {error ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateTitle}>No se pudo cargar el dashboard</Text>
              <Text style={styles.stateText}>
                Revisa tu conexión e inténtalo de nuevo.
              </Text>
              <TouchableOpacity onPress={buscar} style={styles.retryBtn}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : !dashboard ? (
            !loading && (
              <View style={styles.stateBox}>
                <Text style={styles.stateText}>
                  Selecciona empresa y almacén, y presiona Buscar para ver las ventas.
                </Text>
              </View>
            )
          ) : (
            <View key={busquedaId} style={loading && styles.stale}>
              <KpiHeader
                periodo={dashboard.periodo}
                kpis={dashboard.kpis}
                etiqueta={empresaConsultada}
              />
              {sinDatos ? (
                <View style={styles.stateBox}>
                  <Text style={styles.stateText}>
                    Sin ventas registradas para estos filtros.
                  </Text>
                </View>
              ) : (
                <>
                  {dashboard.tendenciaVentas.length > 0 && (
                    <SalesTrendCard data={dashboard.tendenciaVentas} />
                  )}
                  {dashboard.topClientes.length > 0 && (
                    <TopClientsCard clientes={dashboard.topClientes} />
                  )}
                  {(dashboard.ventasPorLineaNegocio.length > 0 ||
                    dashboard.ventasPorProductoServicio.length > 0) && (
                    <ServiceMixCard
                      lineas={dashboard.ventasPorLineaNegocio}
                      productos={dashboard.ventasPorProductoServicio}
                    />
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </Layout>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  filtersCard: { zIndex: 5000 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: '#0F172A' },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', gap: 10 },
  diasField: { width: 110 },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 44,
  },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontSize: 14, color: '#0F172A' },
  inputError: { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#FEF2F2' },
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 10 },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  searchBtnDisabled: { opacity: 0.7 },
  searchBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  stateBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  stateTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  stateText: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  retryText: { color: '#2563EB', fontWeight: '700' },
  stale: { opacity: 0.5 },
});
