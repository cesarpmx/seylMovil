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
import { getConsultaExistencia } from '../../../../actions/almacen/consulta/get-ConsultaExistencia';
import { ConsultaExistencia } from '../../../../domain/entities/almacen/consulta/consultaExistencia';
import { getUbicacion } from '../../../../actions/almacen/movimientosInternos/get-Ubicaciones';
import BottonTabBar from '../../../components/ui/BottonTabBar';
import CodeScanner from '../../../components/ui/CodeScanner';

export const ConsultaExistenciaScreen = () => {

  const [idPallet, setIdPallet] = useState('');
  const [idProducto, setIdProducto] = useState('');
  const [idUbicacion, setUbicacion] = useState('');
  const [consultaExistencia, setConsultaExistencia] = useState<ConsultaExistencia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSearchByPallet, setIsSearchByPallet] = useState(true);

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true); // Controla si la cámara está activa

  const { empresas, almacenes } = useAuthStore();

  const handleEmpresaSelect = (value: string | null) => {
    console.log('Empresa seleccionada:', value);
    setEmpresa(value || '');
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

  const handleSearch = async () => {
    try {
      setIsLoading(true);


      if (!empresa) {
        Alert.alert('Info', 'Por favor, seleccione una empresa.');
        return;
      }

      // Validación inicial: al menos un campo debe estar lleno
      if (!idPallet.trim() && !idProducto.trim() && !idUbicacion.trim()) {
        console.log("Por favor, ingresa un ID de pallet, producto o ubicación.");
        return;
      }

      // Validación redundante
      if (!idPallet.trim() && (!idProducto.trim() && !idUbicacion.trim())) {
        console.log("Por favor, ingresa un ID de pallet, o completa un producto o una ubicación.");
        return;
      }

      // Validar la ubicación si se proporcionó
      if (idUbicacion.trim()) {
        const isValidUbicacion = await validateUbicacion(empresa, idUbicacion.trim());
        if (!isValidUbicacion) {
          Alert.alert('Error', 'La ubicación no existe, ingrese una nueva');
          return; // Detener si la ubicación no es válida
        }
      }

      // Llamada a la API para obtener datos de cambio de ubicación
      const data = await getConsultaExistencia(empresa, idPallet.trim(), idUbicacion.trim(), idProducto.trim());

      // Formatear los datos para agregar campos adicionales que serán usados en la UI
      setConsultaExistencia(
        data.map((item) => ({
          ...item
        }))
      );
    } catch (error) {
      console.error("Error fetching cambio ubicaciones:", error); // Manejo de errores
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
      <Layout style={{ flex: 1 }}>
        <ScrollView style={{ marginHorizontal: 10 }}>
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








            {/* Inicio Seccion de bysqueda */}
            <View style={styles.searchContainer}>
              <View style={styles.inputGroup}>
                <View style={styles.singleInputContainer}>
                  <SelectEmpresa empresas={empresas}
                    onSelect={handleEmpresaSelect}
                    editableEmpresa={editableEmpresa}
                  />

                </View>

                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Buscar por ID Pallet</Text>
                  <Switch
                    value={isSearchByPallet}
                    onValueChange={setIsSearchByPallet}
                  />
                </View>
                {isSearchByPallet ? (
                  <View style={styles.row}>
                    <TextInput
                      style={styles.input}
                      placeholder="ID Pallet"
                      value={idPallet}
                      onChangeText={setIdPallet}
                      onSubmitEditing={handleSearch}
                    />

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={abrirCamara}
                    >
                      <MyIcon name="camera-outline" size={25} white />
                    </TouchableOpacity>
                  </View>



                ) : (

                  <View style={styles.row}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ubicación"
                      value={idUbicacion}
                      onChangeText={setUbicacion}
                      onSubmitEditing={handleSearch}
                    />

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={abrirCamara}
                    >
                      <MyIcon name="camera-outline" size={25} white />
                    </TouchableOpacity>
                  </View>



                )}
              </View>

              <BottonTabBar
                onSearchPress={handleSearch}
                onAddPress={() => console.log('Add Press Botton')}
                onDeletePress={() => console.log('Delete Press Botton')}
                buttonVisibility={{
                  search: true,
                  add: false,
                  delete: false,
                }}
              />
              {/* <TouchableOpacity style={styles.secondaryButton}>
                  <MyIcon name="camera-outline" size={25} white />
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSearch}>
                  <MyIcon name="search-outline" size={25} white />
                </TouchableOpacity> */}

            </View>

            {/* Fin seccion de busqueda */}



            {/* Cards */}
            {
              isLoading ? (
                <LoadingScreen />
              ) : consultaExistencia.length > 0 ? (
                consultaExistencia.map((item, index) => (
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
                          <Text style={styles.label}>Inner</Text>
                          <Text style={styles.value}>{item.prdinner || ''}</Text>
                        </View>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Ubicacion</Text>
                          <Text style={styles.value}>{item.racubiid}</Text>


                        </View>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Lote</Text>
                          <Text style={styles.value}>{item.raclote || 'Sin lote'}</Text>

                        </View>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Fecha de Caducidad</Text>
                          <Text style={styles.value}>
                            {item.racfeccaducidad
                              ? new Date(item.racfeccaducidad).toLocaleDateString()
                              : 'Sin fecha'}
                          </Text>

                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Unidad</Text>
                          <Text style={styles.value}>{item.prdualid}</Text>
                        </View>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Disponible</Text>
                          <Text style={styles.value}>{item.disponible}</Text>

                        </View>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Reservado</Text>
                          <Text style={styles.value}>{item.racreservado}</Text>
                        </View>

                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Real</Text>
                          <Text style={styles.value}>{item.racreal}</Text>
                        </View>
                      </View>
                    </View>
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
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    backgroundColor: '#fff',
    marginRight: 5,
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
    bottom: 310,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  }
});
