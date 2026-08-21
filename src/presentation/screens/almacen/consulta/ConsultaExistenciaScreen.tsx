import React, { useEffect, useRef, useState } from 'react';
import { MainLayout } from '../../../layouts/MainLayout';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Layout } from '@ui-kitten/components';
import { MyIcon } from '../../../components/ui/MyIcon';
import { getCambioUbicacion, enviarMovimiento } from '../../../../actions/almacen/movimientosInternos/get-CambioUbicacion';
import { useQuery } from '@tanstack/react-query';
import { CambioUbicacion } from '../../../../domain/entities/almacen/movimientosInternos/cambioUbicacion';
import { useAuthStore } from '../../../store/modules/useModulesStore';
import { SelectAlmacen } from '../../../components/ui/SelectAlmacen';
import { SelectEmpresa } from '../../../components/ui/SelectEmpresa';
import { LoadingScreen } from '../../loading/LoadingScreen';
import { getConsultaExistencia } from '../../../../actions/almacen/consulta/get-ConsultaExistencia';
import { ConsultaExistencia } from '../../../../domain/entities/almacen/consulta/consultaExistencia';
import { getUbicacion } from '../../../../actions/almacen/movimientosInternos/get-Ubicaciones';
import BottonTabBar from '../../../components/ui/BottonTabBar';
import CodeScanner from '../../../components/ui/CodeScanner';
import { SelectUbicacion } from '../../../components/ui/SelectUbicacion';

export const ConsultaExistenciaScreen = () => {

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);
  const [idPallet, setIdPallet] = useState('');
  const [idProducto, setIdProducto] = useState('');
  const [idUbicacion, setUbicacion] = useState('');
  const [consultaExistencia, setConsultaExistencia] = useState<ConsultaExistencia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [empresaError, setEmpresaError] = useState(false);
  const [almacen, setAlmacen] = useState('');
  const [editableAlmacen, setEditableAlmacen] = useState(true);
  const [almacenError, setAlmacenError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSearchByPallet, setIsSearchByPallet] = useState(true);

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true); // Controla si la cámara está activa
  const [ubicacionDropdownOpen, setUbicacionDropdownOpen] = useState(false);

  const { empresas, almacenes } = useAuthStore();

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [page]);

  const handleEmpresaSelect = (value: string | null) => {
    console.log('Empresa seleccionada:', value);
    setEmpresa(value || '');
    if (value) setEmpresaError(false);
  };

  const handleAlmacenSelect = (value: string | null) => {
    console.log('Almacén seleccionado:', value);
    setAlmacen(value || '');
    if (value) setAlmacenError(false);
  };


  const validateUbicacion = async (_idEmpresa: string, idUbicacion: string) => {
    try {
      const ubicaciones = await getUbicacion(almacen, idUbicacion);
      const target = idUbicacion.trim().toUpperCase();

      // Es válida si al menos un item de la respuesta hace match exacto
      // (case-insensitive) con la ubicación buscada.
      return ubicaciones.some(
        it => String(it.ubiid || '').trim().toUpperCase() === target,
      );
    } catch (error) {
      console.error('Error validating ubicacion:', error);
      return false;
    }
  };

  const handleSearch = async (overrides?: {
    pallet?: string;
    ubicacion?: string;
  }) => {
    try {
      setIsLoading(true);


      // Validamos ambos a la vez para que se vean los dos en rojo si faltan.
      const faltaEmpresa = !empresa;
      const faltaAlmacen = !almacen;
      setEmpresaError(faltaEmpresa);
      setAlmacenError(faltaAlmacen);

      if (faltaEmpresa && faltaAlmacen) {
        Alert.alert('Info', 'Por favor, seleccione empresa y almacén.');
        return;
      }
      if (faltaEmpresa) {
        Alert.alert('Info', 'Por favor, seleccione una empresa.');
        return;
      }
      if (faltaAlmacen) {
        Alert.alert('Info', 'Por favor, seleccione un almacén.');
        return;
      }

      // Si viene texto del scanner (evento nativo) lo usamos directo,
      // porque setState es async y aún no se refleja en el state.
      const palletBuscar =
        typeof overrides?.pallet === 'string' ? overrides.pallet : idPallet;
      const ubicacionBuscar =
        typeof overrides?.ubicacion === 'string'
          ? overrides.ubicacion
          : idUbicacion;

      // Sincronizo el state visible con lo escaneado
      if (typeof overrides?.pallet === 'string' && overrides.pallet !== idPallet) {
        setIdPallet(overrides.pallet);
      }
      if (
        typeof overrides?.ubicacion === 'string' &&
        overrides.ubicacion !== idUbicacion
      ) {
        setUbicacion(overrides.ubicacion);
      }

      // Validación: según el modo activo, exigir el campo correspondiente
      if (isSearchByPallet) {
        if (!palletBuscar.trim()) {
          Alert.alert(
            'Campo requerido',
            'Por favor, ingresa un ID de Pallet para continuar con la búsqueda.',
          );
          return;
        }
      } else {
        if (!ubicacionBuscar.trim() && !idProducto.trim()) {
          Alert.alert(
            'Campos requeridos',
            'Por favor, ingresa una Ubicación o un ID de Producto para continuar con la búsqueda.',
          );
          return;
        }
      }

      // Validar la ubicación si se proporcionó
      if (ubicacionBuscar.trim()) {
        const isValidUbicacion = await validateUbicacion(empresa, ubicacionBuscar.trim());
        if (!isValidUbicacion) {
          Alert.alert('Error', 'La ubicación no existe, ingrese una nueva');
          return; // Detener si la ubicación no es válida
        }
      }

      // Llamada a la API para obtener datos de cambio de ubicación
      const data = await getConsultaExistencia(empresa, palletBuscar.trim(), ubicacionBuscar.trim(), idProducto.trim());

      // Si buscamos por pallet y no vino nada, mostramos alerta explícita
      if (isSearchByPallet && (!data || data.length === 0)) {
        setConsultaExistencia([]);
        setPage(0);
        Alert.alert(
          'ID Pallet no encontrado',
          `No existe información para el pallet "${palletBuscar.trim()}". Verifica el código e intenta de nuevo.`,
        );
        return;
      }

      // Formatear los datos para agregar campos adicionales que serán usados en la UI
      setConsultaExistencia(
        data.map((item) => ({
          ...item
        }))
      );
      setPage(0);
    } catch (error) {
      console.error("Error fetching cambio ubicaciones:", error); // Manejo de errores
      if (isSearchByPallet) {
        Alert.alert(
          'ID Pallet no encontrado',
          `No existe información para el pallet ingresado. Verifica el código e intenta de nuevo.`,
        );
      } else {
        Alert.alert('Error', 'No se pudo realizar la búsqueda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const abrirCamara = () => {
    console.log(isSearchByPallet)
    resetScanner();
    setModalVisible(true); // Muestra el modal para ingresar la ubicación global
  };

  const handleCodeScanned = (code: string) => {

    setScannedCode(code); // Guardar el código escaneado
    setIsCameraActive(false); // Desactivar la cámara después del escaneo
    setModalVisible(false);

    isSearchByPallet ? setIdPallet(code) : setUbicacion(code);

    ;
    console.log(`Código escaneado: ${code}`);
  };

  const resetScanner = () => {
    setScannedCode(null); // Limpiar el código escaneado
    setIsCameraActive(true); // Reactivar la cámara
  };




  // Función para buscar datos basados en los inputs proporcionados
  // const handleSearch = async () => {
  //   try {
  //     setIsLoading(true);
  //     // Validación inicial: al menos un campo debe estar lleno
  //     if (!idPallet.trim() && !idProducto.trim() && !idUbicacion.trim()) {
  //       console.log("Por favor, ingresa un ID de pallet, producto o ubicación.");
  //       return;
  //     }

  //     // Validación redundante (aunque parece repetitiva)
  //     if (!idPallet.trim() && (!idProducto.trim() && !idUbicacion.trim())) {
  //       console.log("Por favor, ingresa un ID de pallet, o completa un producto o una ubicación.");
  //       return;
  //     }

  //     // Llamada a la API para obtener datos de cambio de ubicación
  //     const data = await getConsultaExistencia(empresa, idPallet.trim(), idUbicacion.trim(), idProducto.trim());

  //     // Formatear los datos para agregar campos adicionales que serán usados en la UI
  //     setConsultaExistencia(
  //       data.map((item) => ({
  //         ...item
  //       }))
  //     );
  //   } catch (error) {
  //     console.error("Error fetching cambio ubicaciones:", error); // Manejo de errores
  //   }
  //   finally {
  //     setIsLoading(false);
  //   }
  // };



  return (
    <MainLayout title="Consulta Existencia" subTitle="Almacén">
      <Layout style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={styles.container}>

            <Modal
              visible={modalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fondo oscuro semitransparente
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 15,
                }}
              >
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    width: '100%', // Ajusta el tamaño del cuadro contenedor
                    overflow: 'hidden', // Previene que la cámara sobresalga
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <View
                    style={{
                      height: 180, // Altura específica para el contenedor de la cámara
                      width: '100%', // Ocupa todo el ancho del cuadro
                      backgroundColor: '#000', // Fondo oscuro para la cámara
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden', // Asegura que nada sobresalga
                    }}
                  >
                    {isCameraActive ? (
                      <CodeScanner
                        onCodeScanned={handleCodeScanned}
                        isCameraActive={isCameraActive}
                        style={{
                          width: '100%',
                          height: '100%', // Ajusta el tamaño al contenedor
                        }}
                      />
                    ) : (
                      <Text
                        style={{
                          textAlign: 'center',
                          color: '#fff',
                          fontSize: 16,
                        }}
                      >
                        {scannedCode
                          ? `Código escaneado: ${scannedCode}`
                          : 'Cámara desactivada'}
                      </Text>
                    )}
                  </View>

                  <View
                    style={{
                      padding: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={{
                        backgroundColor: '#007BFF',
                        padding: 10,
                        borderRadius: 8,
                        width: '80%',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                        Cerrar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>








            {/* Header */}
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderIcon}>
                <MyIcon name="cube-outline" size={22} white />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Consulta de existencia</Text>
                <Text style={styles.pageSubtitle}>
                  Busca por ID Pallet o Ubicación 
                </Text>
              </View>
            </View>

            {/* Search card */}
            <View style={styles.searchCard}>
              <View style={{ marginBottom: 12, zIndex: 4000 }}>
                <Text style={styles.fieldLabel}>Empresa *</Text>
                <SelectEmpresa
                  empresas={empresas}
                  onSelect={handleEmpresaSelect}
                  editableEmpresa={editableEmpresa}
                  hasError={empresaError}
                />
              </View>

              <View style={{ marginBottom: 12, zIndex: 3000 }}>
                <Text style={styles.fieldLabel}>Almacén *</Text>
                <SelectAlmacen
                  almacenes={almacenes}
                  onSelect={handleAlmacenSelect}
                  editable={editableAlmacen}
                  hasError={almacenError}
                />
              </View>

              {/* Toggle segmentado */}
              <View style={styles.segmentedRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.segmentBtn,
                    isSearchByPallet && styles.segmentBtnActive,
                  ]}
                  onPress={() => {
                    setIsSearchByPallet(true);
                    setUbicacion('');
                  }}>
                  <Text
                    style={[
                      styles.segmentText,
                      isSearchByPallet && styles.segmentTextActive,
                    ]}>
                    ID Pallet
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.segmentBtn,
                    !isSearchByPallet && styles.segmentBtnActive,
                  ]}
                  onPress={() => {
                    setIsSearchByPallet(false);
                    setIdPallet('');
                  }}>
                  <Text
                    style={[
                      styles.segmentText,
                      !isSearchByPallet && styles.segmentTextActive,
                    ]}>
                    Ubicación
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.searchInputRow, !isSearchByPallet && { zIndex: 50 }]}>
                {isSearchByPallet ? (
                  <View style={styles.inputWrap}>
                    <MyIcon name="archive-outline" size={18} />
                    <TextInput
                      style={styles.input}
                      placeholder="Escanea o escribe ID Pallet"
                      placeholderTextColor="#94A3B8"
                      value={idPallet}
                      onChangeText={setIdPallet}
                      onSubmitEditing={e =>
                        handleSearch({
                          pallet: e?.nativeEvent?.text ?? idPallet,
                        })
                      }
                      returnKeyType="search"
                      blurOnSubmit={false}
                    />
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    <SelectUbicacion
                      almacen={almacen}
                      value={idUbicacion}
                      onChangeText={setUbicacion}
                      onSelect={ubiid => handleSearch({ ubicacion: ubiid })}
                      onSubmitEditing={text =>
                        handleSearch({ ubicacion: text ?? idUbicacion })
                      }
                      placeholder="Ubicación (3 letras para buscar)"
                      inputStyle="search"
                    />
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cameraButton}
                  onPress={abrirCamara}>
                  <MyIcon name="camera-outline" size={22} white />
                </TouchableOpacity>
              </View>

              <BottonTabBar
                onSearchPress={() => handleSearch()}
                onAddPress={() => console.log('Add Press Botton')}
                onDeletePress={() => console.log('Delete Press Botton')}
                buttonVisibility={{
                  search: true,
                  add: false,
                  delete: false,
                }}
              />
            </View>



            {/* Cards */}
            {isLoading ? (
              <LoadingScreen />
            ) : consultaExistencia.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {consultaExistencia.length}
                    </Text>
                  </View>
                  <Text style={styles.resultsText}>
                    Mostrando {page * PAGE_SIZE + 1}–
                    {Math.min((page + 1) * PAGE_SIZE, consultaExistencia.length)}
                  </Text>
                </View>

                {consultaExistencia
                  .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
                  .map((item, localIndex) => {
                    const index = page * PAGE_SIZE + localIndex;
                    return (
                      <View key={index} style={styles.card}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                          <View style={styles.cardIconWrap}>
                            <MyIcon name="archive-outline" size={20} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.cardIdLabel}>ID Pallet</Text>
                            <Text style={styles.cardIdValue}>
                              {item.racid || 'Sin id Pallet'}
                            </Text>
                          </View>
                          <View style={styles.statusChip}>
                            <Text style={styles.statusChipText}>
                              {item.racineid || 'Sin estatus'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardDivider} />

                        {/* Producto */}
                        <View style={styles.productBlock}>
                          <Text style={styles.productName} numberOfLines={2}>
                            {item.prdnombre}
                          </Text>
                          <View style={styles.keyChip}>
                            <Text style={styles.keyChipText}>
                              {item.prdclave}
                            </Text>
                          </View>
                        </View>

                        {/* Métricas destacadas */}
                        <View style={styles.metricsRow}>
                          <View
                            style={[
                              styles.metricBox,
                              { backgroundColor: '#ECFDF5' },
                            ]}>
                            <Text
                              style={[styles.metricValue, { color: '#047857' }]}>
                              {item.disponible}
                            </Text>
                            <Text style={styles.metricLabel}>DISPONIBLE</Text>
                          </View>
                          <View
                            style={[
                              styles.metricBox,
                              { backgroundColor: '#FEF3C7' },
                            ]}>
                            <Text
                              style={[styles.metricValue, { color: '#B45309' }]}>
                              {item.racreservado}
                            </Text>
                            <Text style={styles.metricLabel}>RESERVADO</Text>
                          </View>
                          <View
                            style={[
                              styles.metricBox,
                              { backgroundColor: '#EFF6FF' },
                            ]}>
                            <Text
                              style={[styles.metricValue, { color: '#1D4ED8' }]}>
                              {item.racreal}
                            </Text>
                            <Text style={styles.metricLabel}>REAL</Text>
                          </View>
                        </View>

                        {/* Detalles */}
                        <View style={styles.detailsGrid}>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>UNIDAD</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>
                              {item.prdualid || '—'}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>INNER</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>
                              {item.prdinner || '—'}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>UBICACIÓN</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>
                              {item.racubiid || '—'}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>LOTE</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>
                              {item.raclote || 'Sin lote'}
                            </Text>
                          </View>
                          <View style={[styles.detailItem, { width: '100%' }]}>
                            <Text style={styles.detailLabel}>
                              FECHA DE CADUCIDAD
                            </Text>
                            <Text style={styles.detailValue}>
                              {item.racfeccaducidad
                                ? new Date(
                                    item.racfeccaducidad,
                                  ).toLocaleDateString()
                                : 'Sin fecha'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.pageButton,
                      page <= 0 && styles.pageButtonDisabled,
                    ]}
                    disabled={page <= 0}
                    onPress={() => setPage(page - 1)}>
                    <Text style={styles.pageButtonText}>‹ Anterior</Text>
                  </TouchableOpacity>
                  <View style={styles.pageInfoWrap}>
                    <Text style={styles.pageInfoNumber}>{page + 1}</Text>
                    <Text style={styles.pageInfoTotal}>
                      de{' '}
                      {Math.max(
                        1,
                        Math.ceil(consultaExistencia.length / PAGE_SIZE),
                      )}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.pageButton,
                      (page + 1) * PAGE_SIZE >= consultaExistencia.length &&
                        styles.pageButtonDisabled,
                    ]}
                    disabled={
                      (page + 1) * PAGE_SIZE >= consultaExistencia.length
                    }
                    onPress={() => setPage(page + 1)}>
                    <Text style={styles.pageButtonText}>Siguiente ›</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <MyIcon name="cube-outline" size={32} />
                </View>
                <Text style={styles.emptyTitle}>Sin resultados</Text>
                <Text style={styles.emptySubtitle}>
                  Selecciona empresa y busca por pallet o ubicación.
                </Text>
              </View>
            )}



          </View>
        </ScrollView>
      </Layout>
    </MainLayout>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pageHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    // Elevation alto (mayor que las result cards de abajo con elevation:3)
    // para que en Android el dropdown de ubicación se pinte por encima
    // de esas cards.
    elevation: 10,
    zIndex: 10,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 6,
    padding: 0,
  },
  cameraButton: {
    width: 46,
    height: 46,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  countBadge: {
    minWidth: 32,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  resultsText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIdLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  cardIdValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  statusChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  productBlock: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 19,
  },
  keyChip: {
    alignSelf: 'flex-start',
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
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 2,
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
  // Paginación
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  pageButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },
  pageButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  pageInfoWrap: {
    alignItems: 'center',
  },
  pageInfoNumber: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '800',
  },
  pageInfoTotal: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: -2,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
});
