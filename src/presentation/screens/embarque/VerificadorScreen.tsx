import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Text, Card, Button, Icon } from '@ui-kitten/components';
import { MainLayout } from '../../layouts/MainLayout';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  CameraDevice,
  useCodeScanner,
  useCameraDevice,
} from 'react-native-vision-camera';
import CodeScanner from '../../components/ui/CodeScanner';
import { QrRecibo } from '../../../domain/entities/almacen/ingresos/QrRecibo';
import { enviarConfirmacionReciboQR, getQrRecibo } from '../../../actions/almacen/ingresos/get-qrrecibo';
import { LoadingScreen } from '../loading/LoadingScreen';
import { useAuthStore } from '../../store/modules/useModulesStore';
import { ScrollView } from 'react-native-gesture-handler';

export const VerificadorScreen = () => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [qrRecibo, setQrRecibo] = useState<QrRecibo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { usuid } = useAuthStore();

  const handleCodeScanned = async (code: string) => {
    const cleaned = (code || '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .trim();

    console.log('[Verificador] código crudo:', JSON.stringify(code));
    console.log('[Verificador] código limpio:', JSON.stringify(cleaned));
    console.log('[Verificador] longitud cruda:', code?.length ?? 0, '/ limpia:', cleaned.length);

    setScannedCode(cleaned);
    setIsCameraActive(false);
    setQrRecibo([]);
    setIsLoading(true);

    try {
      const data = await getQrRecibo(cleaned);

      console.log('[Verificador] data recibida (items):', data?.length ?? 0);
      console.log('[Verificador] data recibida (contenido):', JSON.stringify(data, null, 2));

      setQrRecibo(
        data.map((item) => ({
          ...item,
        })),
      );
    } catch (error) {
      console.error('[Verificador] error al buscar QR:', error);
      setQrRecibo([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedCode(null);
    setIsCameraActive(true);
    setQrRecibo([]);
  };

  const handleConfirm = async () => {
    if (qrRecibo.length === 0) {
      console.log('No hay datos para confirmar');
      return;
    }

    const { prrempid, prralmid, prrid, prrestatus } = qrRecibo[0];

    Alert.alert(
      'Confirmar recibo',
      `¿Estás seguro que deseas confirmar el recibo #${prrid}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            const jsonData = {
              empresa: prrempid,
              almacen: prralmid,
              clave: prrid,
              estatus: prrestatus,
              idUsuario: usuid,
            };

            console.log('Enviando datos:', jsonData);

            try {
              const response = await enviarConfirmacionReciboQR(jsonData);
              console.log('Movimientos realizados con éxito:', response);
              Alert.alert('Info', response.message || 'Recibo confirmado.', [
                {
                  text: 'OK',
                  onPress: () => resetScanner(),
                },
              ]);
            } catch (error) {
              console.error('Error al realizar los movimientos:', error);
              Alert.alert(
                'Error',
                'No se pudieron realizar los movimientos.',
              );
            }
          },
        },
      ],
    );
  };

  // Colores del pill de estatus según el estado devuelto por Oracle.
  const statusColor = (estatus?: string) => {
    const e = (estatus || '').toUpperCase();
    if (e === 'A' || e === 'ACTIVO') {
      return { bg: '#DCFCE7', border: '#86EFAC', text: '#166534', dot: '#16A34A' };
    }
    if (e === 'C' || e === 'CANCELADO') {
      return { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B', dot: '#DC2626' };
    }
    if (e === 'S' || e === 'SURTIDO' || e === 'CONFIRMADO') {
      return { bg: '#DBEAFE', border: '#93C5FD', text: '#1E3A8A', dot: '#2563EB' };
    }
    return { bg: '#F1F5F9', border: '#CBD5E1', text: '#334155', dot: '#64748B' };
  };

  return (
    <MainLayout title="Verificador QR (Recibo)" subTitle="Almacén">
      <Layout style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Zona de escaneo / estado leído */}
          <View style={styles.scanArea}>
            {isCameraActive ? (
              <View style={styles.scanFrame}>
                <CodeScanner
                  onCodeScanned={handleCodeScanned}
                  isCameraActive={isCameraActive}
                  style={{ flex: 1 }}
                />
                {/* Esquinas decorativas del recuadro de escaneo */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
            ) : (
              <View style={styles.scannedState}>
                <View style={styles.scannedIconWrap}>
                  <Icon
                    name="checkmark-circle-2-outline"
                    fill="#FFFFFF"
                    style={{ width: 44, height: 44 }}
                  />
                </View>
                <Text style={styles.scannedTitle}>Código leído</Text>
                <Text style={styles.scannedHint}>
                  Presiona "Escanear nuevo" para leer otro código.
                </Text>
              </View>
            )}
          </View>

          {/* Contenido bajo la zona de escaneo */}
          <View style={styles.container}>
            {isLoading ? (
              <View style={styles.loaderCard}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loaderTitle}>Buscando información…</Text>
                <Text style={styles.loaderHint}>
                  Consultando el recibo en el servidor.
                </Text>
                {/* Skeleton visual de la card mientras carga */}
                <View style={styles.skeletonWrap}>
                  <View style={[styles.skeletonBar, {width: '60%'}]} />
                  <View style={[styles.skeletonBar, {width: '90%'}]} />
                  <View style={[styles.skeletonBar, {width: '75%'}]} />
                </View>
              </View>
            ) : qrRecibo.length > 0 ? (
              qrRecibo.map((item, index) => {
                const st = statusColor(item.eprnombre || item.prrestatus);
                return (
                  <View key={index} style={styles.card}>
                    {/* Encabezado con clave + estatus */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={styles.cardIconWrap}>
                          <Icon
                            name="cube-outline"
                            fill="#FFFFFF"
                            style={{ width: 20, height: 20 }}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardKicker}>RECIBO</Text>
                          <Text style={styles.cardTitle}>#{item.prrid}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: st.bg, borderColor: st.border },
                        ]}
                      >
                        <View
                          style={[styles.statusDot, { backgroundColor: st.dot }]}
                        />
                        <Text style={[styles.statusText, { color: st.text }]}>
                          {item.eprnombre}
                        </Text>
                      </View>
                    </View>

                    {/* Chips de empresa / almacén / puerta */}
                    <View style={styles.metaChipsRow}>
                      <View style={styles.metaChip}>
                        <Icon
                          name="briefcase-outline"
                          fill="#475569"
                          style={styles.chipIcon}
                        />
                        <Text style={styles.chipText}>Emp. {item.prrempid}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Icon
                          name="home-outline"
                          fill="#475569"
                          style={styles.chipIcon}
                        />
                        <Text style={styles.chipText}>{item.prralmid}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Icon
                          name="hash-outline"
                          fill="#475569"
                          style={styles.chipIcon}
                        />
                        <Text style={styles.chipText}>Puerta {item.prrdocid}</Text>
                      </View>
                    </View>

                    {/* Cita destacada */}
                    <View style={styles.highlightBox}>
                      <Icon
                        name="calendar-outline"
                        fill="#2563EB"
                        style={styles.highlightIcon}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.highlightLabel}>Fecha de cita</Text>
                        <Text style={styles.highlightValue}>
                          {item.prrfeccita}
                          {item.prrhoracita ? `  ·  ${item.prrhoracita}` : ''}
                        </Text>
                      </View>
                    </View>

                    {/* Sección Transporte */}
                    <Text style={styles.sectionLabel}>TRANSPORTE</Text>
                    <View style={styles.gridBox}>
                      <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                          <Text style={styles.cellLabel}>Línea</Text>
                          <Text style={styles.cellValue}>{item.prrlineatr}</Text>
                        </View>
                        <View style={styles.cellDivider} />
                        <View style={styles.gridCell}>
                          <Text style={styles.cellLabel}>Placas</Text>
                          <Text style={styles.cellValue}>
                            {item.prrplacas || '—'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.rowDivider} />
                      <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                          <Text style={styles.cellLabel}>Chofer</Text>
                          <Text style={styles.cellValue}>
                            {item.prrchofer || 'Sin chofer'}
                          </Text>
                        </View>
                        <View style={styles.cellDivider} />
                        <View style={styles.gridCell}>
                          <Text style={styles.cellLabel}>Tipo vehículo</Text>
                          <Text style={styles.cellValue}>{item.prrtveid}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Sección Carga */}
                    <Text style={styles.sectionLabel}>CARGA</Text>
                    <View style={styles.gridBox}>
                      <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                          <Text style={styles.cellLabel}>Tipo carga</Text>
                          <Text style={styles.cellValue}>{item.prrtcaid}</Text>
                        </View>
                        <View style={styles.cellDivider} />
                        <View style={styles.gridCell}>
                          <Text style={styles.cellLabel}>Unidad</Text>
                          <Text style={styles.cellValue}>{item.prrualid}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Barra Cantidad destacada */}
                    <View style={styles.qtyBar}>
                      <View style={styles.qtyBarLeft}>
                        <Icon
                          name="cube-outline"
                          fill="#FFFFFF"
                          style={{ width: 18, height: 18 }}
                        />
                        <Text style={styles.qtyBarLabel}>Cantidad</Text>
                      </View>
                      <Text style={styles.qtyBarValue}>{item.prrcantidad}</Text>
                    </View>
                  </View>
                );
              })
            ) : scannedCode ? (
              <View style={styles.emptyState}>
                <Icon
                  name="alert-circle-outline"
                  fill="#94A3B8"
                  style={{ width: 40, height: 40 }}
                />
                <Text style={styles.emptyTitle}>Sin resultados</Text>
                <Text style={styles.emptyHint}>
                  El código escaneado no devolvió información.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon
                  name="camera-outline"
                  fill="#94A3B8"
                  style={{ width: 40, height: 40 }}
                />
                <Text style={styles.emptyTitle}>Escanea un QR</Text>
                <Text style={styles.emptyHint}>
                  Coloca el QR dentro del recuadro para leerlo.
                </Text>
              </View>
            )}

            {/* Botones de acción */}
            {(() => {
              const estatusActual = (
                qrRecibo[0]?.eprnombre ||
                qrRecibo[0]?.prrestatus ||
                ''
              )
                .toString()
                .toUpperCase()
                .trim();
              const bloqueado =
                estatusActual === 'RECIBIDO' || estatusActual === 'CANCELADO';
              return (
                <View style={styles.actionsRow}>
                  <Button
                    style={{ flex: 1, marginRight: 8 }}
                    onPress={handleConfirm}
                    disabled={
                      !scannedCode || qrRecibo.length === 0 || bloqueado
                    }
                  >
                    Confirmar
                  </Button>
                  <Button
                    appearance="outline"
                    style={{ flex: 1, marginLeft: 8 }}
                    onPress={resetScanner}
                    disabled={isCameraActive}
                  >
                    Escanear nuevo
                  </Button>
                </View>
              );
            })()}
          </View>
        </ScrollView>
      </Layout>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // === Zona de escaneo ===
  scanArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanFrame: {
    width: 280,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#22D3EE',
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },

  // === Estado "código ya leído" (reemplaza cámara) ===
  scannedState: {
    width: 280,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  scannedIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  scannedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: -0.2,
  },
  scannedHint: {
    fontSize: 12,
    color: '#15803D',
    textAlign: 'center',
    marginTop: 4,
  },

  container: {
    flex: 1,
  },

  // === Card principal ===
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  cardKicker: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginTop: 1,
  },

  // === Pill de estatus ===
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // === Chips meta ===
  metaChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipIcon: {
    width: 12,
    height: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.1,
  },

  // === Bloque destacado (fecha cita) ===
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 14,
  },
  highlightIcon: {
    width: 22,
    height: 22,
  },
  highlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.6,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    letterSpacing: -0.2,
  },

  // === Sección label ===
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 6,
  },

  // === Grid de datos ===
  gridBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  gridCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  cellDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  // === Barra Cantidad ===
  qtyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    marginTop: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  qtyBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBarLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  qtyBarValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  // === Estado vacío ===
  emptyState: {
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginTop: 10,
  },
  emptyHint: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },

  // === Botones ===
  actionsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },

  // === Loader compacto mientras se busca ===
  loaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  loaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    letterSpacing: -0.2,
  },
  loaderHint: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  skeletonWrap: {
    width: '100%',
    marginTop: 18,
    gap: 8,
  },
  skeletonBar: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
});
