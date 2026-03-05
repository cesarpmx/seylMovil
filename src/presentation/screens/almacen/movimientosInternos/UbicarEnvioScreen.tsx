import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Text, Card, Button } from '@ui-kitten/components';

import {
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { useAuthStore } from '../../../store/modules/useModulesStore';
import { UbicarEnvio } from '../../../../domain/entities/almacen/movimientosInternos/UbicarEnvio';
import { enviaUbicarEnvio, getUbicarEnvio } from '../../../../actions/almacen/movimientosInternos/get-UbicarEnvio';
import { MainLayout } from '../../../layouts/MainLayout';
import CodeScanner from '../../../components/ui/CodeScanner';
import { LoadingScreen } from '../../loading/LoadingScreen';
import { MyIcon } from '../../../components/ui/MyIcon';


export const UbicarEnvioScreen = () => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true); // Controla si la cámara está activa
  const [scannedCodeUbicacion, setScannedCodeUbicacion] = useState<string | null>(null);
  const [isCameraActiveUbicacion, setIsCameraActiveUbicacion] = useState(true); // Controla si la cámara está activa
  const [ubicarEnvioData, setUbicarEnvioData] = useState<UbicarEnvio[]>([]);
  const [ubicacion, setUbicacion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { usuid } = useAuthStore();
  const [idUbicacion, setIdUbicacion] = useState('');
  const [modalVisibleCamera, setModalVisibleCamera] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleCodeScanned = async (code: string) => {
    setScannedCode(code); // Guardar el código escaneado
    setIsCameraActive(false); // Desactivar la cámara después del escaneo
    console.log(`Código escaneado: ${code}`);


    const data = await getUbicarEnvio(code.trim());

    // Formatear los datos para agregar campos adicionales que serán usados en la UI
    setUbicarEnvioData(
      data.map((item) => ({
        ...item
      }))
    );
  };

  const resetScanner = () => {
    setIdUbicacion("")
    setScannedCode(null); // Limpiar el código escaneado
    setIsCameraActive(true); // Reactivar la cámara
    setUbicarEnvioData([]);
  };

  const handleConfirm = async () => {

    if (!idUbicacion.trim()) {
      Alert.alert('Info', 'Por favor, ingresa una ubicación.');
      return;
    }

    if (ubicarEnvioData.length > 0) {
      // Extraer valores
      const { embid } = ubicarEnvioData[0];

      // Crear el JSON
      const jsonData = {
        clave: embid,
        ubicacion: idUbicacion,
        idUsuario: usuid, // Agregamos el código escaneado
      };

      console.log("Enviando datos:", jsonData);

      try {
        // Llamada a la API para enviar los movimientos
        const response = await enviaUbicarEnvio(jsonData);

        if (response.success === "false") {
          throw new Error(response.message || "Error desconocido");
        }

        console.log('Movimientos realizados con éxito:', response.message);
        Alert.alert('Info', response.message || 'Error al actualizar', [
          {
            text: 'OK',
            onPress: async () => {
              console.log('OK Pressed');
              await resetScanner();
            },
          },
        ]);
      } catch (error) {
        console.error('Error al realizar los movimientos:', error);
        Alert.alert('Error', 'No se pudieron realizar los movimientos.');
      }





    } else {
      console.log("No hay datos para confirmar");
    }
  };


  const abrirCamara = (field: string) => {
    setActiveField(field);
    setIsCameraActiveUbicacion(true);
    //console.log(isSearchByPallet)
    //resetScanner();
    setModalVisibleCamera(true); // Muestra el modal para ingresar la ubicación global
  };

  const handleCodeScannedUbicacion = (codeUbicacion: string) => {
    setScannedCodeUbicacion(codeUbicacion);
    setIsCameraActiveUbicacion(false);
    setModalVisibleCamera(false);

    setIdUbicacion(codeUbicacion);

    console.log(`Código escaneado: ${codeUbicacion}`);
  };


  return (
    <MainLayout title="Ubicación Envío" subTitle="Almacén">
      <Layout style={{ flex: 1 }}>

        <Modal
          visible={modalVisibleCamera}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisibleCamera(false)}
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
                {isCameraActiveUbicacion ? (
                  <CodeScanner
                    onCodeScanned={handleCodeScannedUbicacion}
                    isCameraActive={isCameraActiveUbicacion}
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
                    {scannedCodeUbicacion
                      ? `Código escaneado: ${scannedCodeUbicacion}`
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
                  onPress={() => setModalVisibleCamera(false)}
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



        <ScrollView style={{ marginHorizontal: 10 }}>
          <Layout
            style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}
          >
            <Layout
              style={{
                height: 200,
                width: 300,
                borderWidth: 2,
                borderColor: '#ccc',
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 10,
              }}
            >
              {isCameraActive ? (
                <CodeScanner
                  onCodeScanned={handleCodeScanned}
                  isCameraActive={isCameraActive}
                  style={{ flex: 1 }}
                />
              ) : (
                <Text style={{ textAlign: 'center', marginTop: 80 }}>
                  {scannedCode ? `Código escaneado: ${scannedCode}` : 'Cámara desactivada'}
                </Text>
              )}
            </Layout>
          </Layout>

          <View style={styles.container}>

            {
              isLoading ? (
                <LoadingScreen />
              ) : ubicarEnvioData.length > 0 ? (
                ubicarEnvioData.map((item, index) => (
                  <Layout key={index} style={styles.card}>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>ID</Text>
                          <Text style={styles.value}>{item.embid || 'No found'}</Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Cajas</Text>
                          <Text style={styles.valueResaltar}>{item.embcajas || 'No found'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Referencia 1</Text>
                          <Text style={styles.value}>{item.embref1 || 'No found'}</Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Referencia 2</Text>
                          <Text style={styles.value}>{item.embref2 || 'No found'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Fecha de Cita</Text>
                      <Text style={styles.value}>
                        {item.embfeccita ? new Date(item.embfeccita).toLocaleString() : "Fecha no encontrada"}
                      </Text>
                    </View>

                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Fecha Rec</Text>
                      <Text style={styles.value}>{new Date(item.embfecrec).toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Cliente</Text>
                      <Text style={styles.value}>{item.clinombre}</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Empresa</Text>
                          <Text style={styles.value}>{item.embempid}</Text>
                        </View>



                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Ubicacion Actual</Text>
                          <Text style={styles.value}>{item.embubicacion || 'No found'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Destino</Text>
                      <Text style={styles.valueResaltar}>{item.destino}</Text>
                    </View>

                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Nueva Ubicación</Text>
                      <View style={styles.row}>


                        <TextInput
                          style={styles.input}
                          placeholder="Ubicación"
                          value={idUbicacion}
                          onChangeText={setIdUbicacion}
                          //onSubmitEditing={handleSearch} // Ejecuta la búsqueda al presionar "Enter"
                          returnKeyType="search"
                        />
                        <TouchableOpacity
                          style={styles.secondaryButton}
                          onPress={() => abrirCamara("idUbicacion")}
                        >
                          <MyIcon name="camera-outline" size={25} white />
                        </TouchableOpacity>
                      </View>
                    </View>

                  </Layout>
                ))
              ) : (
                <Text>No se encontraron resultados.</Text>
              )

            }

            {/* Botones */}
            <Layout style={{ flexDirection: 'row', marginTop: 0 }}>
              {/* Botón Confirmar */}
              <Button
                style={{ flex: 1, marginRight: 8 }}
                onPress={handleConfirm}
                disabled={!scannedCode} // Deshabilitado si no hay código escaneado
              >
                Confirmar
              </Button>

              {/* Botón Escanear nuevo código */}
              <Button
                style={{ flex: 1, marginLeft: 8 }}
                onPress={resetScanner}
                disabled={isCameraActive} // Deshabilitado si la cámara ya está activa
              >
                Escanear nuevo código
              </Button>
            </Layout>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  cameraContainer: {
    height: 300,
    width: 300,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f7f9fc',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
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
  valueResaltar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#333',
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
  secondaryButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  }
});
