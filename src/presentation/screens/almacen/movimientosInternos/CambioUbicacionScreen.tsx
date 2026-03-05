import React, { useEffect, useState } from 'react';
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

export const CambioUbicacionScreen = () => {

  const [idPallet, setIdPallet] = useState('');
  const [idProducto, setIdProducto] = useState('');
  const [idUbicacion, setUbicacion] = useState('');
  const [cambioUbicaciones, setCambioUbicaciones] = useState<CambioUbicacion[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [ubicacionDestinoGlobal, setUbicacionDestinoGlobal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [editable, setEditable] = useState(true);
  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true); // Controla si la cámara está activa
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [modalVisibleCamera, setModalVisibleCamera] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);


  const { empresas, almacenes, usuid } = useAuthStore();

  const handleEmpresaSelect = (value: string | null) => {
    console.log('Empresa seleccionada:', value);
    setEmpresa(value || '');
  };

  const handleAlmacenSelect = (value: string | null) => {
    console.log('Almacen seleccionado:', value);
    setAlmacen(value || '');
  };



  const validateUbicacion = async (idEmpresa: string, idUbicacion: string) => {
    try {
      const ubicaciones = await getUbicacion(idEmpresa, idUbicacion);

      // Validar si la ubicación existe
      if (
        ubicaciones.length === 2 &&
        ubicaciones.some(
          (item) =>
            item.ubiid !== null ||
            item.ubialmid !== null ||
            item.ubiprioridad !== null
        )
      ) {
        return true; // Ubicación válida
      } else {
        return false; // Ubicación no válida
      }
    } catch (error) {
      console.error('Error validating ubicacion:', error);
      return false;
    }
  };



  // Función para buscar datos basados en los inputs proporcionados
  const handleSearch = async () => {
    try {
      setIsLoading(true);

      if (!empresa) {
        Alert.alert('Info', 'Por favor, seleccione una empresa.');
        return;
      }
      // Validación inicial: al menos un campo debe estar lleno
      if (!idPallet.trim() && !idProducto.trim() && !idUbicacion.trim()) {
        Alert.alert('Info', 'Por favor, ingresa un ID de pallet, producto o ubicación.');
        return;
      }

      // Validación redundante (aunque parece repetitiva)
      if (!idPallet.trim() && (!idProducto.trim() && !idUbicacion.trim())) {
        Alert.alert('Info', 'Por favor, ingresa un ID de pallet, o completa un producto o una ubicación.');
        return;
      }


      if (idUbicacion.trim()) {
        const isValidUbicacion = await validateUbicacion(empresa, idUbicacion.trim());
        if (!isValidUbicacion) {
          Alert.alert('Error', 'La ubicación no existe, ingrese una nueva');
          return; // Detener si la ubicación no es válida
        }
      }

      // Llamada a la API para obtener datos de cambio de ubicación
      const data = await getCambioUbicacion(empresa, almacen, idPallet.trim(), idUbicacion.trim(), idProducto.trim());

      // Formatear los datos para agregar campos adicionales que serán usados en la UI
      setCambioUbicaciones(
        data.map((item) => ({
          ...item,
          cantidadMover: '', // Campo para la cantidad a mover
          ubicacionDestino: '', // Campo para la nueva ubicación
        }))
      );
    } catch (error) {
      console.error("Error fetching cambio ubicaciones:", error); // Manejo de errores
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

  // Función para realizar el intercambio de ubicación de un solo elemento
  const handleSwap = async (index: number) => {
    const item = cambioUbicaciones[index];
    const { cantidadMover, ubicacionDestino, disponible, racid } = item;

    // Validaciones antes de proceder con el intercambio
    if (!cantidadMover || !ubicacionDestino) {
      Alert.alert('Error', '"Por favor, llena todos los campos.');
      return;
    }

    if (parseFloat(cantidadMover) > parseFloat(disponible)) {
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

      // Alerta de éxito y recarga de datos después de confirmar
      Alert.alert('Éxito', 'Movimiento realizado con éxito:', [
        {
          text: 'OK',
          onPress: async () => {
            console.log('OK Pressed');
            await handleSearch(); // Refresca los datos después de confirmar
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
      Alert.alert('Éxito', 'Movimiento(s) realizado(s) con éxito:', [
        {
          text: 'OK',
          onPress: async () => {
            console.log('OK Pressed');
            await handleSearch(); // Refresca los datos después de confirmar
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
    } else if (activeField === "idUbicacion") {
      setUbicacion(code);
    } else if (activeField === "idProducto") {
      setIdProducto(code);
    }

    handleSearch(); // Ejecuta la búsqueda automáticamente
    console.log(`Código escaneado: ${code}`);
  };



  const resetScanner = () => {
    setScannedCode(null); // Limpiar el código escaneado
    setIsCameraActive(true); // Reactivar la cámara
  };

  useEffect(() => {
    if (isSearchByPallet && idPallet) {
      handleSearch();
    }
  }, [idPallet]);

  useEffect(() => {
    if (!isSearchByPallet && idUbicacion && idProducto) {
      handleSearch();
    }
  }, [idUbicacion, idProducto]);



  const [isSearchByPallet, setIsSearchByPallet] = useState(true);

  return (
    <MainLayout title="Cambio de Ubicación" subTitle="Almacén">
      <Layout style={{ flex: 1 }}>
        <ScrollView style={{ marginHorizontal: 10 }}>
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
                  <TextInput
                    style={styles.inputModal}
                    placeholder="Nueva Ubicación"
                    value={ubicacionDestinoGlobal}
                    onChangeText={setUbicacionDestinoGlobal}
                  />
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


            {/* Inicio Seccion de bysqueda */}
            <View style={[styles.row, styles.selectRow]}>
              <SelectEmpresa
                empresas={empresas}
                onSelect={handleEmpresaSelect}
                editableEmpresa={editableEmpresa}
              />

            </View>

            <View style={[styles.row, styles.selectRowLower]}>
              <SelectAlmacen
                almacenes={almacenes}
                onSelect={handleAlmacenSelect}
                editable={editable}
              />
            </View>


            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Buscar por ID Pallet</Text>
              <Switch value={isSearchByPallet} onValueChange={setIsSearchByPallet} />
            </View>

            {isSearchByPallet ? (
              <View style={styles.row}>
                <TextInput
                  style={styles.wideInput}
                  placeholder="ID Pallet"
                  value={idPallet}
                  onChangeText={setIdPallet}
                  onSubmitEditing={handleSearch} // Ejecuta la búsqueda al presionar "Enter"
                  returnKeyType="search"
                />
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => abrirCamara("idPallet")}
                >
                  <MyIcon name="camera-outline" size={25} white />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.doubleInputContainer}>
                <View style={styles.row}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ubicación"
                    value={idUbicacion}
                    onChangeText={setUbicacion}
                    onSubmitEditing={handleSearch} // Ejecuta la búsqueda al presionar "Enter"
                    returnKeyType="search"
                  />
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => abrirCamara("idUbicacion")}
                  >
                    <MyIcon name="camera-outline" size={25} white />
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <TextInput
                    style={styles.input}
                    placeholder="ID Producto"
                    value={idProducto}
                    onChangeText={setIdProducto}
                    onSubmitEditing={handleSearch} // Ejecuta la búsqueda al presionar "Enter"
                    returnKeyType="search"
                  />
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => abrirCamara("idProducto")}
                  >
                    <MyIcon name="camera-outline" size={25} white />
                  </TouchableOpacity>
                </View>
              </View>
            )}


            <BottonTabBar
              onSearchPress={handleSearch}
              onAddPress={handleMoverTodo}
              onDeletePress={() => console.log('Delete Press Botton')}
              buttonVisibility={{
                search: true,
                add: true,
                delete: false,
              }}
            />
            {/* <TouchableOpacity style={styles.secondaryButton}>
                  <MyIcon name="camera-outline" size={25} white />
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleMoverTodo}>
                  <MyIcon name="done-all-outline" size={25} white />
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSearch}>
                  <MyIcon name="search-outline" size={25} white />
                </TouchableOpacity> */}

            {/* Fin seccion de busqueda */}



            {/* Cards */}
            {
              isLoading ? (
                <LoadingScreen />
              ) : cambioUbicaciones.length > 0 ? (
                cambioUbicaciones.map((item, index) => (
                  <Layout key={index} style={styles.card}>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>ID Pallet</Text>
                          <Text style={styles.value}>{item.racid || 'Sin id Pallet'}</Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Estatus</Text>
                          <Text style={styles.value}>{item.racineid || 'Sin Estatus'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Clave Producto</Text>
                      <Text style={styles.value}>{item.prdclave}</Text>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Descripción</Text>
                      <Text style={styles.value}>{item.prdnombre}</Text>
                    </View>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Lote</Text>
                          <Text style={styles.value}>{item.raclote || 'Sin lote'}</Text>
                        </View>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Fecha de caducidad</Text>
                          <Text style={styles.value}>
                            {item.racfeccaducidad
                              ? new Date(item.racfeccaducidad).toLocaleDateString()
                              : 'Sin fecha'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Disponible</Text>
                          <Text style={styles.value}>{item.disponible}</Text>
                        </View>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Ubicación</Text>
                          <Text style={styles.value}>{item.racubiid}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Cantidad a Mover</Text>
                      <TextInput
                        style={styles.input}
                        value={item.cantidadMover}
                        onChangeText={(value) => handleInputChange(index, 'cantidadMover', value)}
                      />
                    </View>

                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Nueva Ubicación</Text>
                      <TextInput
                        style={styles.input}
                        value={item.ubicacionDestino}
                        onChangeText={(value) => handleInputChange(index, 'ubicacionDestino', value)}
                      />
                    </View>


                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleSwap(index)}
                    >
                      <MyIcon name="swap-outline" size={25} white />
                    </TouchableOpacity>
                  </Layout>
                ))
              ) : (
                <Text>No se encontraron resultados.</Text>
              )

            }



          </View>
        </ScrollView>
      </Layout>
    </MainLayout>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 14,
    marginBottom: 10,
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
    backgroundColor: '#f7f9fc',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
    position: 'relative',
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
  }
});
