import React, { useEffect, useRef, useState } from 'react';
import { MainLayout } from '../../../layouts/MainLayout';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Layout } from '@ui-kitten/components';
import { MyIcon } from '../../../components/ui/MyIcon';
import { getCambioUbicacion, enviarMovimiento } from '../../../../actions/almacen/movimientosInternos/get-CambioUbicacion';
import { useQuery } from '@tanstack/react-query';
import { CambioUbicacion } from '../../../../domain/entities/almacen/movimientosInternos/cambioUbicacion';
import { enviarMovimientoEstatus, getCambioEstatus } from '../../../../actions/almacen/movimientosInternos/get-CambioEstatus';
import { CambioEstatus } from '../../../../domain/entities/almacen/movimientosInternos/cambioEstatus';
import { SelectEmpresa } from '../../../components/ui/SelectEmpresa';
import { SelectAlmacen } from '../../../components/ui/SelectAlmacen';
import { useAuthStore } from '../../../store/modules/useModulesStore';
import { LoadingScreen } from '../../loading/LoadingScreen';
import { getEstatusInventario } from '../../../../actions/almacen/movimientosInternos/get-Estatus';
import BottonTabBar from '../../../components/ui/BottonTabBar';
import SimpleDropdown from '../../../components/ui/SelectEstatusInventario';
import CodeScanner from '../../../components/ui/CodeScanner';
import ModalCodeScanner from '../../../components/ui/ModalCodeScanner';
import { fixEncoding } from '../../../../helpers/fixEncoding';
import { SelectUbicacion } from '../../../components/ui/SelectUbicacion';

export const CambioEstatusScreen = () => {

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);
  const [idPallet, setIdPallet] = useState('');
  const [idProducto, setIdProducto] = useState('');
  const [idUbicacion, setUbicacion] = useState('');
  const [cambioEstatus, setCambioEstatus] = useState<CambioEstatus[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [ubicacionDestinoGlobal, setUbicacionDestinoGlobal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [empresaError, setEmpresaError] = useState(false);
  const [almacenError, setAlmacenError] = useState(false);
  const { empresas, almacenes, usuid } = useAuthStore();

  const [estatusItems, setEstatusItems] = useState([]); // Estado para almacenar los datos del dropdown
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [selectedValue, setSelectedValue] = useState(null); // Estado para el valor seleccionado
  const [error, setError] = useState(null); // Estado para manejar errores
  const [editable, setEditable] = useState(true);
  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isScannerVisible, setScannerVisible] = useState(false); // Controla si la cámara está activa
  const [modalVisibleCamera, setModalVisibleCamera] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);


  const inputRef = useRef(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [page]);

  useEffect(() => {
    handleFocus();
  }, []);


  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus(); // Enfocar el TextInput
    }
  };

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


  useEffect(() => {
    const fetchEstatusInventario = async () => {
      try {
        setLoading(true);
        const data = await getEstatusInventario(); // Llamada a la función API
        // Mapeo de datos al formato requerido por DropDownPicker
        const transformedItems = data.map((item) => ({
          label: item.ineid, // El texto visible
          value: item.ineid, // El valor interno
        }));
        setEstatusItems(transformedItems);
      } catch (err) {
        setError('Error al cargar datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstatusInventario();
  }, []);

  // Función para buscar datos basados en los inputs proporcionados
  const handleSearch = async (
    arg?: boolean | {pallet?: string; ubicacion?: string; producto?: string; silent?: boolean},
  ) => {
    const silent = typeof arg === 'boolean' ? arg : !!arg?.silent;
    const overrides = typeof arg === 'object' && arg !== null ? arg : undefined;

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

      // Si viene texto de un scanner (nativeEvent), usarlo directo
      // porque setState es async y aún no está en el state.
      const palletBuscar =
        typeof overrides?.pallet === 'string' ? overrides.pallet : idPallet;
      const ubicacionBuscar =
        typeof overrides?.ubicacion === 'string' ? overrides.ubicacion : idUbicacion;
      const productoBuscar =
        typeof overrides?.producto === 'string' ? overrides.producto : idProducto;

      // Sincronizo state visible con lo escaneado
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


      // Llamada a la API para obtener datos de cambio de ubicación
      const data = await getCambioEstatus(empresa, almacen, palletBuscar.trim(), ubicacionBuscar.trim(), productoBuscar.trim());

      // Si buscamos por pallet y no vino nada, alerta explícita
      if (isSearchByPallet && (!data || data.length === 0)) {
        setCambioEstatus([]);
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
        setCambioEstatus([]);
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
      setCambioEstatus(
        data.map((item) => ({
          ...item,
          cantidadMover: '', // Campo para la cantidad a mover
          nuevoEstatus: '', // Campo para la nueva ubicación
          nuevoComentario: '', // Comentario que el usuario escriba en el input (separado del historial)
        }))
      );
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
  const handleCantidadMoverChange = (index: number, value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const disponible = parseFloat(cambioEstatus[index]?.disponible ?? '0');
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

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedData = [...cambioEstatus];
    updatedData[index][field] = value; // Actualiza el campo especificado
    setCambioEstatus(updatedData); // Actualiza el estado con los datos modificados
  };

  // Función para realizar el intercambio de ubicación de un solo elemento
  const handleSwap = async (index: number) => {
    const item = cambioEstatus[index];
    const { cantidadMover, nuevoEstatus, disponible, racid, nuevoComentario } = item;
    console.log(item)


    // Validaciones antes de proceder con el intercambio
    if (!cantidadMover || !selectedValue) {
      Alert.alert('Info', 'Por favor, llena todos los campos.');
      return;
    }

    const cantidadNum = parseFloat(cantidadMover);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Info', 'La cantidad a mover debe ser mayor a 0.');
      return;
    }

    if (cantidadNum > parseFloat(disponible)) {
      Alert.alert('Info', 'La cantidad a mover no puede ser mayor a la disponible.');
      return;
    }

    // Solo se manda el comentario nuevo que el usuario escribió; el historial no se reenvía.
    const raccomsLimpio = (nuevoComentario ?? '').trim();

    // Construcción del objeto a enviar (mismo formato que el web para que Oracle aplique el movimiento)
    const movimiento = {
      ...item,
      nuevaCantidad: String(cantidadMover),
      nuevoEstatus: selectedValue,
      raccoms: raccomsLimpio,
      idUsuario: String(usuid),
    };

    console.log(movimiento)

    try {
      // Llamada a la API para enviar el movimiento
      const response = await enviarMovimientoEstatus(movimiento);

      // Alerta con el mensaje que devuelve el backend (ej. "Se creo un nuevo Id Pallet: 25")
      Alert.alert('Éxito', fixEncoding(response?.message) || 'Movimiento realizado con éxito', [
        {
          text: 'OK',
          onPress: async () => {
            setSelectedValue(null);
            await handleSearch(true); // refresca las cards en modo silencioso
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
      console.log('Por favor, ingresa una ubicación destino válida.');
      return;
    }

    // Construcción de los movimientos basados en los datos actuales
    const movimientos = cambioEstatus.map((item) => ({
      racid: item.racid,
      cantidadMover: item.disponible, // Usa la cantidad disponible como cantidad a mover
      ubicacionDestino: ubicacionDestinoGlobal,
      idUsuario: usuid, // ID de usuario (modificar si es necesario)
    }));

    try {
      // Llamada a la API para enviar los movimientos
      const response = await enviarMovimiento(movimientos);
      console.log('Movimientos realizados con éxito:', response);
      Alert.alert('Éxito', 'Todos los movimientos se realizaron con éxito');
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
   // setModalVisibleCamera(true); // Muestra el modal para ingresar la ubicación global
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
    <MainLayout title="Cambio de Estatus" subTitle="Almacén">
      <Layout style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={styles.container}>

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
                      onChangeText={setUbicacionDestinoGlobal}
                      placeholder="Nueva Ubicación (3 letras)"
                      inputStyle="form"
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

            {/* Header */}
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderIcon}>
                <MyIcon name="sync-outline" size={22} white />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Cambio de estatus</Text>
                <Text style={styles.pageSubtitle}>
                  Actualiza el estatus de inventario del pallet
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

              {/* Segmented */}
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
            ) : cambioEstatus.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {cambioEstatus.length}
                    </Text>
                  </View>
                  <Text style={styles.resultsText}>
                    Mostrando {page * PAGE_SIZE + 1}–
                    {Math.min((page + 1) * PAGE_SIZE, cambioEstatus.length)}
                  </Text>
                </View>

                {cambioEstatus
                  .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
                  .map((item, localIndex) => {
                    const index = page * PAGE_SIZE + localIndex;
                    const historialComentarios = (item.raccoms || '')
                      .replace(/^(\d{8}:\s?)+/, '')
                      .trim();
                    return (
                      <View
                        key={item.racid}
                        style={[
                          styles.card,
                          {
                            zIndex: PAGE_SIZE - localIndex,
                            elevation: PAGE_SIZE - localIndex,
                          },
                        ]}>
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

                        {/* Métrica destacada: Existencia */}
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
                            <Text style={styles.metricLabel}>EXISTENCIA</Text>
                          </View>
                          <View
                            style={[
                              styles.metricBox,
                              { backgroundColor: '#EFF6FF' },
                            ]}>
                            <Text
                              style={[
                                styles.metricValue,
                                { color: '#1D4ED8' },
                              ]}>
                              {item.disponible}
                            </Text>
                            <Text style={styles.metricLabel}>INNER</Text>
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

                        {/* Historial comentarios */}
                        <View style={styles.commentBlock}>
                          <Text style={styles.detailLabel}>COMENTARIOS</Text>
                          <Text style={styles.commentText}>
                            {historialComentarios ||
                              'No se encontraron comentarios'}
                          </Text>
                        </View>

                        <View style={styles.cardDivider} />

                        {/* Sección de aplicar cambio */}
                        <Text style={styles.sectionLabel}>
                          Aplicar cambio de estatus
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

                        <View style={styles.fieldGroup}>
                          <Text style={styles.fieldLabel}>Nuevo estatus</Text>
                          <SimpleDropdown
                            rawItems={estatusItems}
                            value={selectedValue}
                            initialValue={selectedValue}
                            onChangeValue={setSelectedValue}
                            placeholder="Selecciona un estatus"
                          />
                        </View>

                        <View style={styles.fieldGroup}>
                          <Text style={styles.fieldLabel}>Comentario</Text>
                          <TextInput
                            style={styles.formInput}
                            placeholder="Escribe un comentario..."
                            placeholderTextColor="#94A3B8"
                            value={item.nuevoComentario}
                            onChangeText={value =>
                              handleInputChange(
                                index,
                                'nuevoComentario',
                                value,
                              )
                            }
                          />
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.swapButton}
                          onPress={() => handleSwap(index)}>
                          <MyIcon name="swap-outline" size={20} white />
                          <Text style={styles.swapButtonText}>
                            Cambiar estatus
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
                        Math.ceil(cambioEstatus.length / PAGE_SIZE),
                      )}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.pageButton,
                      (page + 1) * PAGE_SIZE >= cambioEstatus.length &&
                        styles.pageButtonDisabled,
                    ]}
                    disabled={(page + 1) * PAGE_SIZE >= cambioEstatus.length}
                    onPress={() => setPage(page + 1)}>
                    <Text style={styles.pageButtonText}>Siguiente ›</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <MyIcon name="sync-outline" size={32} />
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
  // Card
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
  commentBlock: {
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  commentText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 17,
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
    bottom: 550,
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
