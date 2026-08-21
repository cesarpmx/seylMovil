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
import { getUbicacion } from '../../../../actions/almacen/movimientosInternos/get-Ubicaciones';
import BottonTabBar from '../../../components/ui/BottonTabBar';
import CodeScanner from '../../../components/ui/CodeScanner';
import ModalCodeScanner from '../../../components/ui/ModalCodeScanner';
import { fixEncoding } from '../../../../helpers/fixEncoding';
import { SelectUbicacion } from '../../../components/ui/SelectUbicacion';

export const CambioUbicacionScreen = () => {

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);
  const [idPallet, setIdPallet] = useState('');
  const [idProducto, setIdProducto] = useState('');
  const [idUbicacion, setUbicacion] = useState('');
  const [cambioUbicaciones, setCambioUbicaciones] = useState<CambioUbicacion[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [ubicacionDestinoGlobal, setUbicacionDestinoGlobal] = useState('');
  const [ubicacionDestinoGlobalValid, setUbicacionDestinoGlobalValid] = useState(false);
  // Validez por item (índice → bool): destino escogido de la lista o validado por API
  const [destinoValidos, setDestinoValidos] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [empresaError, setEmpresaError] = useState(false);
  const [almacenError, setAlmacenError] = useState(false);
  const [editable, setEditable] = useState(true);
  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true); // Controla si la cámara está activa
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [modalVisibleCamera, setModalVisibleCamera] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);


  const { empresas, almacenes, usuid } = useAuthStore();

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
    console.log('Almacen seleccionado:', value);
    setAlmacen(value || '');
    if (value) setAlmacenError(false);
  };



  const validateUbicacion = async (_idEmpresa: string, idUbicacion: string) => {
    try {
      const ubicaciones = await getUbicacion(almacen, idUbicacion);
      const target = idUbicacion.trim().toUpperCase();

      // Válida si al menos un item hace match exacto (case-insensitive)
      // con la ubicación buscada.
      return ubicaciones.some(
        it => String(it.ubiid || '').trim().toUpperCase() === target,
      );
    } catch (error) {
      console.error('Error validating ubicacion:', error);
      return false;
    }
  };



  // Función para buscar datos basados en los inputs proporcionados
  const handleSearch = async (
    arg?: boolean | {pallet?: string; ubicacion?: string; producto?: string; silent?: boolean},
  ) => {
    const silent = typeof arg === 'boolean' ? arg : !!arg?.silent;
    const overrides =
      typeof arg === 'object' && arg !== null && !('silent' in arg && Object.keys(arg).length === 1)
        ? arg
        : typeof arg === 'object' && arg !== null
        ? arg
        : undefined;

    try {
      setIsLoading(true);

      const faltaEmpresa = !empresa;
      const faltaAlmacen = !almacen;
      setEmpresaError(faltaEmpresa);
      setAlmacenError(faltaAlmacen);

      if (faltaEmpresa || faltaAlmacen) {
        if (!silent) {
          const msg =
            faltaEmpresa && faltaAlmacen
              ? 'Por favor, seleccione una empresa y un almacén.'
              : faltaEmpresa
              ? 'Por favor, seleccione una empresa.'
              : 'Por favor, seleccione un almacén.';
          Alert.alert('Info', msg);
        }
        return;
      }

      // Si viene texto de un scanner (nativeEvent), lo usamos directo,
      // porque setState es async y aún no está en el state.
      const palletBuscar =
        typeof overrides?.pallet === 'string' ? overrides.pallet : idPallet;
      const ubicacionBuscar =
        typeof overrides?.ubicacion === 'string' ? overrides.ubicacion : idUbicacion;
      const productoBuscar =
        typeof overrides?.producto === 'string' ? overrides.producto : idProducto;

      // Sincronizo el state visible
      if (typeof overrides?.pallet === 'string' && overrides.pallet !== idPallet) {
        setIdPallet(overrides.pallet);
      }
      if (typeof overrides?.ubicacion === 'string' && overrides.ubicacion !== idUbicacion) {
        setUbicacion(overrides.ubicacion);
      }
      if (typeof overrides?.producto === 'string' && overrides.producto !== idProducto) {
        setIdProducto(overrides.producto);
      }

      // Validación: según el modo activo, exigir el campo correspondiente
      if (isSearchByPallet) {
        if (!palletBuscar.trim()) {
          if (!silent)
            Alert.alert(
              'Campo requerido',
              'Por favor, ingresa un ID de Pallet para continuar con la búsqueda.',
            );
          return;
        }
      } else {
        if (!ubicacionBuscar.trim() && !productoBuscar.trim()) {
          if (!silent)
            Alert.alert(
              'Campos requeridos',
              'Por favor, ingresa una Ubicación o un ID de Producto para continuar con la búsqueda.',
            );
          return;
        }
      }


      if (ubicacionBuscar.trim()) {
        const isValidUbicacion = await validateUbicacion(empresa, ubicacionBuscar.trim());
        if (!isValidUbicacion) {
          if (!silent) Alert.alert('Error', 'La ubicación no existe, ingrese una nueva');
          return; // Detener si la ubicación no es válida
        }
      }

      // Llamada a la API para obtener datos de cambio de ubicación
      const data = await getCambioUbicacion(empresa, almacen, palletBuscar.trim(), ubicacionBuscar.trim(), productoBuscar.trim());

      // Si buscamos por pallet y no vino nada, alerta explícita
      if (isSearchByPallet && (!data || data.length === 0)) {
        setCambioUbicaciones([]);
        setPage(0);
        if (!silent) {
          Alert.alert(
            'ID Pallet no encontrado',
            `No existe información para el pallet "${palletBuscar.trim()}". Verifica el código e intenta de nuevo.`,
          );
        }
        return;
      }

      // Si buscamos por producto y no vino nada, alerta explícita
      if (!isSearchByPallet && productoBuscar.trim() && (!data || data.length === 0)) {
        setCambioUbicaciones([]);
        setPage(0);
        if (!silent) {
          Alert.alert(
            'ID Producto no encontrado',
            `No existe información para el ID "${productoBuscar.trim()}". Verifica el código e intenta de nuevo.`,
          );
        }
        return;
      }

      // Formatear los datos para agregar campos adicionales que serán usados en la UI
      setCambioUbicaciones(
        data.map((item) => ({
          ...item,
          cantidadMover: '', // Campo para la cantidad a mover
          ubicacionDestino: '', // Campo para la nueva ubicación
        }))
      );
      // Resetear validez de destinos (viene lista nueva)
      setDestinoValidos({});
      setUbicacionDestinoGlobal('');
      setUbicacionDestinoGlobalValid(false);
      setPage(0);
    } catch (error) {
      console.error("Error fetching cambio ubicaciones:", error); // Manejo de errores
      if (!silent) {
        if (isSearchByPallet) {
          Alert.alert(
            'ID Pallet no encontrado',
            'No existe información para el pallet ingresado. Verifica el código e intenta de nuevo.',
          );
        } else {
          Alert.alert('Error', 'No se pudo realizar la búsqueda.');
        }
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  // Función para manejar cambios en los inputs dinámicos
  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedData = [...cambioUbicaciones];
    updatedData[index][field] = value; // Actualiza el campo especificado
    setCambioUbicaciones(updatedData); // Actualiza el estado con los datos modificados
  };

  const handleCantidadMoverChange = (index: number, value: string) => {
    // Solo dígitos y punto decimal
    const sanitized = value.replace(/[^0-9.]/g, '');
    const disponible = parseFloat(cambioUbicaciones[index]?.disponible ?? '0');
    const num = parseFloat(sanitized);

    if (!isNaN(num) && !isNaN(disponible) && num > disponible) {
      Alert.alert(
        'Cantidad no válida',
        `La cantidad a mover no puede ser mayor a la disponible (${disponible}).`,
      );
      handleInputChange(index, 'cantidadMover', '0');
      return;
    }
    handleInputChange(index, 'cantidadMover', sanitized);
  };

  // Función para realizar el intercambio de ubicación de un solo elemento
  const handleSwap = async (index: number) => {
    const item = cambioUbicaciones[index];
    const { cantidadMover, ubicacionDestino, disponible, racid } = item;

    // Validaciones antes de proceder con el intercambio
    if (!cantidadMover || !ubicacionDestino) {
      Alert.alert('Error', 'Por favor, llena todos los campos.');
      return;
    }

    const cantidadNum = parseFloat(cantidadMover);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Error', 'La cantidad a mover debe ser mayor a 0.');
      return;
    }

    if (cantidadNum > parseFloat(disponible)) {
      Alert.alert('Error', 'La cantidad a mover no puede ser mayor a la disponible.');
      return;
    }

    if (ubicacionDestino.trim()) {
      const isValidUbicacion = await validateUbicacion(empresa, ubicacionDestino.trim());
      if (!isValidUbicacion) {
        Alert.alert('Error', 'La ubicación no existe, ingrese una nueva');
        return; // Detener si la ubicación no es válida
      }
    }

    // Construcción del objeto a enviar
    const movimiento = {
      racid,
      cantidadMover: parseFloat(cantidadMover),
      ubicacionDestino,
      idUsuario: usuid, // ID de usuario (cambiar si es necesario)
    };

    try {
      // Llamada a la API para enviar el movimiento
      const response = await enviarMovimiento(movimiento);

      // Alerta con el mensaje que devuelve el backend
      Alert.alert('Éxito', fixEncoding(response?.message) || 'Movimiento realizado con éxito', [
        {
          text: 'OK',
          onPress: async () => {
            await handleSearch(true); // Refresca los datos en modo silencioso
          },
        },
      ]);

      console.log("Movimiento realizado con éxito:", response);
    } catch (error) {
      console.error("Error al realizar el movimiento:", error.message);
      console.log("No se pudo realizar el movimiento. Inténtalo de nuevo.");
    }
  };

  // Función para manejar la acción de mover todos los elementos
  const handleMoverTodo = () => {
    setModalVisible(true); // Muestra el modal para ingresar la ubicación global
  };

  // Función para mover todos los elementos a una ubicación destino global
  const moverTodos = async () => {
    if (!ubicacionDestinoGlobal.trim()) {
      Alert.alert('Error', 'Por favor, ingresa una ubicación destino válida.');
      return;
    }

    if (ubicacionDestinoGlobal.trim()) {
      const isValidUbicacion = await validateUbicacion(empresa, ubicacionDestinoGlobal.trim());
      if (!isValidUbicacion) {
        Alert.alert('Error', 'La ubicación no existe, ingrese una nueva');
        return; // Detener si la ubicación no es válida
      }
    }

    // Construcción de los movimientos basados en los datos actuales
    const movimientos = cambioUbicaciones.map((item) => ({
      racid: item.racid,
      cantidadMover: item.disponible, // Usa la cantidad disponible como cantidad a mover
      ubicacionDestino: ubicacionDestinoGlobal,
      idUsuario: usuid, // ID de usuario (modificar si es necesario)
    }));

    try {
      // Llamada a la API para enviar los movimientos
      const response = await enviarMovimiento(movimientos);
      console.log('Movimientos realizados con éxito:', response.data);
      Alert.alert('Éxito', fixEncoding(response?.data?.message ?? response?.message) || 'Movimiento(s) realizado(s) con éxito', [
        {
          text: 'OK',
          onPress: async () => {
            console.log('OK Pressed');
            await handleSearch(true); // Refresca los datos en modo silencioso
          },
        },
      ]);
    } catch (error) {
      console.error('Error al realizar los movimientos:', error);
      Alert.alert('Error', 'No se pudieron realizar los movimientos.');
    }
  };

  const abrirCamara = (field: string) => {
    setScannerVisible(true);
    setActiveField(field);
    console.log(isSearchByPallet)
    resetScanner();
    //setModalVisibleCamera(true); // Muestra el modal para ingresar la ubicación global
  };

  const handleCodeScanned = (code: string) => {
    setScannedCode(code);
    setIsCameraActive(false);
    setModalVisibleCamera(false);

    if (isSearchByPallet) {
      setIdPallet(code);
      handleSearch({pallet: code});
    } else if (activeField === "idUbicacion") {
      setUbicacion(code);
      handleSearch({ubicacion: code});
    } else if (activeField === "idProducto") {
      setIdProducto(code);
      handleSearch({producto: code});
    } else {
      handleSearch();
    }
    console.log(`Código escaneado: ${code}`);
  };



  const resetScanner = () => {
    setScannedCode(null); // Limpiar el código escaneado
    setIsCameraActive(true); // Reactivar la cámara
  };

  const [isSearchByPallet, setIsSearchByPallet] = useState(true);

  return (
    <MainLayout title="Cambio de Ubicación" subTitle="Almacén">
      <Layout style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={styles.container}>


            {isCameraActive ? (
              <ModalCodeScanner
              onCodeScanned={handleCodeScanned}
              isCameraActive={isCameraActive}
              visible={isScannerVisible}
              onClose={() => setScannerVisible(false)}
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




            <Modal
              visible={modalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Ingrese la nueva ubicación</Text>
                  <View style={{ width: '100%', marginBottom: 20, zIndex: 10 }}>
                    <SelectUbicacion
                      almacen={almacen}
                      value={ubicacionDestinoGlobal}
                      onChangeText={t => {
                        setUbicacionDestinoGlobal(t);
                        setUbicacionDestinoGlobalValid(false);
                      }}
                      onSelect={ubiid => {
                        setUbicacionDestinoGlobal(ubiid);
                        setUbicacionDestinoGlobalValid(true);
                      }}
                      onSubmitEditing={async text => {
                        const val = (text ?? ubicacionDestinoGlobal).trim();
                        if (!val) return;
                        setUbicacionDestinoGlobal(val);
                        const ok = await validateUbicacion(empresa, val);
                        setUbicacionDestinoGlobalValid(ok);
                        if (!ok) {
                          Alert.alert(
                            'Ubicación no encontrada',
                            `La ubicación "${val}" no existe.`,
                          );
                        }
                      }}
                      placeholder="Nueva Ubicación (3 letras)"
                      inputStyle="form"
                      hasValid={ubicacionDestinoGlobalValid}
                    />
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={async () => {
                        await moverTodos();
                        setModalVisible(false); // Cierra el modal
                      }}
                    >
                      <Text style={styles.confirmButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>


            {/* Header */}
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderIcon}>
                <MyIcon name="pin-outline" size={22} white />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Cambio de ubicación</Text>
                <Text style={styles.pageSubtitle}>
                  Mueve pallets entre ubicaciones del almacén
                </Text>
              </View>
            </View>

            {/* Search card */}
            <View style={[styles.searchCard, styles.selectRow]}>
              <View style={{ marginBottom: 12 }}>
                <SelectEmpresa
                  empresas={empresas}
                  onSelect={handleEmpresaSelect}
                  editableEmpresa={editableEmpresa}
                  hasError={empresaError}
                />
              </View>

              <View style={[{ marginBottom: 12 }, styles.selectRowLower]}>
                <SelectAlmacen
                  almacenes={almacenes}
                  onSelect={handleAlmacenSelect}
                  editable={editable}
                  hasError={almacenError}
                />
              </View>

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
                    setIdProducto('');
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
                    Ubicación + Producto
                  </Text>
                </TouchableOpacity>
              </View>

              {isSearchByPallet ? (
                <View style={styles.searchInputRow}>
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
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.cameraButton}
                    onPress={() => abrirCamara('idPallet')}>
                    <MyIcon name="camera-outline" size={22} white />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={[styles.searchInputRow, { zIndex: 50 }]}>
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
                  </View>
                  <View style={styles.searchInputRow}>
                    <View style={styles.inputWrap}>
                      <MyIcon name="cube-outline" size={18} />
                      <TextInput
                        style={styles.input}
                        placeholder="ID Producto"
                        placeholderTextColor="#94A3B8"
                        value={idProducto}
                        onChangeText={setIdProducto}
                        onSubmitEditing={e =>
                          handleSearch({
                            producto: e?.nativeEvent?.text ?? idProducto,
                          })
                        }
                        returnKeyType="search"
                        blurOnSubmit={false}
                      />
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.cameraButton}
                      onPress={() => abrirCamara('idProducto')}>
                      <MyIcon name="camera-outline" size={22} white />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <BottonTabBar
                onSearchPress={() => handleSearch()}
                onAddPress={handleMoverTodo}
                onDeletePress={() => console.log('Delete Press Botton')}
                buttonVisibility={{
                  search: true,
                  add: true,
                  delete: false,
                }}
              />
            </View>



            {/* Cards */}
            {isLoading ? (
              <LoadingScreen />
            ) : cambioUbicaciones.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {cambioUbicaciones.length}
                    </Text>
                  </View>
                  <Text style={styles.resultsText}>
                    Mostrando {page * PAGE_SIZE + 1}–
                    {Math.min(
                      (page + 1) * PAGE_SIZE,
                      cambioUbicaciones.length,
                    )}
                  </Text>
                </View>

                {cambioUbicaciones
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

                        {/* Métricas */}
                        <View style={styles.metricsRow}>
                          <View
                            style={[
                              styles.metricBox,
                              { backgroundColor: '#ECFDF5' },
                            ]}>
                            <Text
                              style={[
                                styles.metricValue,
                                { color: '#047857' },
                              ]}>
                              {item.disponible}
                            </Text>
                            <Text style={styles.metricLabel}>DISPONIBLE</Text>
                          </View>
                          <View
                            style={[
                              styles.metricBox,
                              { backgroundColor: '#EFF6FF' },
                            ]}>
                            <Text
                              style={[
                                styles.metricValueSmall,
                                { color: '#1D4ED8' },
                              ]}
                              numberOfLines={1}>
                              {item.racubiid || '—'}
                            </Text>
                            <Text style={styles.metricLabel}>UBICACIÓN</Text>
                          </View>
                        </View>

                        {/* Detalles */}
                        <View style={styles.detailsGrid}>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>LOTE</Text>
                            <Text style={styles.detailValue}>
                              {item.raclote || 'Sin lote'}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>CADUCIDAD</Text>
                            <Text style={styles.detailValue}>
                              {item.racfeccaducidad
                                ? new Date(
                                    item.racfeccaducidad,
                                  ).toLocaleDateString()
                                : 'Sin fecha'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardDivider} />

                        {/* Sección aplicar movimiento */}
                        <Text style={styles.sectionLabel}>
                          Mover a nueva ubicación
                        </Text>

                        <View style={styles.fieldGroup}>
                          <Text style={styles.fieldLabel}>Cantidad a mover</Text>
                          <TextInput
                            style={styles.formInput}
                            placeholder="0"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={item.cantidadMover}
                            onChangeText={value =>
                              handleCantidadMoverChange(index, value)
                            }
                          />
                        </View>

                        <View style={[styles.fieldGroup, { zIndex: 100 - localIndex }]}>
                          <Text style={styles.fieldLabel}>Nueva ubicación</Text>
                          <SelectUbicacion
                            almacen={almacen}
                            value={item.ubicacionDestino}
                            onChangeText={value => {
                              handleInputChange(
                                index,
                                'ubicacionDestino',
                                value,
                              );
                              setDestinoValidos(prev => ({...prev, [index]: false}));
                            }}
                            onSelect={ubiid => {
                              handleInputChange(index, 'ubicacionDestino', ubiid);
                              setDestinoValidos(prev => ({...prev, [index]: true}));
                            }}
                            onSubmitEditing={async text => {
                              const val = (text ?? item.ubicacionDestino ?? '').trim();
                              if (!val) return;
                              handleInputChange(index, 'ubicacionDestino', val);
                              const ok = await validateUbicacion(empresa, val);
                              setDestinoValidos(prev => ({...prev, [index]: ok}));
                              if (!ok) {
                                Alert.alert(
                                  'Ubicación no encontrada',
                                  `La ubicación "${val}" no existe.`,
                                );
                              }
                            }}
                            placeholder="Escribe 3 letras de la ubicación destino"
                            inputStyle="form"
                            hasValid={!!destinoValidos[index]}
                          />
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.swapButton}
                          onPress={() => handleSwap(index)}>
                          <MyIcon name="swap-outline" size={20} white />
                          <Text style={styles.swapButtonText}>
                            Mover a ubicación
                          </Text>
                        </TouchableOpacity>
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
                        Math.ceil(cambioUbicaciones.length / PAGE_SIZE),
                      )}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.pageButton,
                      (page + 1) * PAGE_SIZE >= cambioUbicaciones.length &&
                        styles.pageButtonDisabled,
                    ]}
                    disabled={
                      (page + 1) * PAGE_SIZE >= cambioUbicaciones.length
                    }
                    onPress={() => setPage(page + 1)}>
                    <Text style={styles.pageButtonText}>Siguiente ›</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <MyIcon name="pin-outline" size={32} />
                </View>
                <Text style={styles.emptyTitle}>Sin resultados</Text>
                <Text style={styles.emptySubtitle}>
                  Selecciona empresa/almacén y busca por pallet o ubicación.
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
    elevation: 2,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
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
    fontSize: 12,
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
  metricValueSmall: {
    fontSize: 14,
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  swapButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchContainer: {
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15, // Espaciado debajo del toggle
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  singleInputContainer: {
    flexDirection: 'column',
    marginBottom: 15,
  },
  doubleInputContainer: {
    flexDirection: 'column',
    marginBottom: 15,
  },
  wideInput: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 6,
    padding: 0,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  primaryButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 5,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
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
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  column: {
    flex: 1,
  },
  detailGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  inputGroup: {
    marginRight: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 390,
    right: 20,
    backgroundColor: '#5cb85c',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },


  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputModal: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'white',
  },
  confirmButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: 'white',
  },
  selectRow: {
    zIndex: 3000, // ZIndex alto para los primeros dos selects
    elevation: 3000, // Elevation alto para Android
  },
  selectRowLower: {
    zIndex: 2000, // ZIndex más bajo para los selects inferiores
    elevation: 2000, // Elevation más bajo para Android
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  totalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    paddingHorizontal: 5,
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
  pageInfo: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});
