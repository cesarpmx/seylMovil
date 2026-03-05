import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Text, Card, Button } from '@ui-kitten/components';
import { MainLayout } from '../../layouts/MainLayout';
import {
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
  const [isCameraActive, setIsCameraActive] = useState(true); // Controla si la cámara está activa
  const [qrRecibo, setQrRecibo] = useState<QrRecibo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { usuid } = useAuthStore();

  const handleCodeScanned = async (code: string) => {
    setScannedCode(code); // Guardar el código escaneado
    setIsCameraActive(false); // Desactivar la cámara después del escaneo
    console.log(`Código escaneado: ${code}`);


    const data = await getQrRecibo(code.trim());

    // Formatear los datos para agregar campos adicionales que serán usados en la UI
    setQrRecibo(
      data.map((item) => ({
        ...item
      }))
    );
  };

  const resetScanner = () => {
    setScannedCode(null); // Limpiar el código escaneado
    setIsCameraActive(true); // Reactivar la cámara
    setQrRecibo([]);
  };

  const handleConfirm = async () => {

    if (qrRecibo.length > 0) {
      // Extraer valores
      const { prrempid, prralmid, prrid, prrestatus } = qrRecibo[0];

      // Crear el JSON
      const jsonData = {
        empresa: prrempid,
        almacen: prralmid,
        clave: prrid,
        estatus: prrestatus,
        idUsuario: usuid, // Agregamos el código escaneado
      };

      console.log("Enviando datos:", jsonData);

      try {
        // Llamada a la API para enviar los movimientos
        const response = await enviarConfirmacionReciboQR(jsonData);
        console.log('Movimientos realizados con éxito:', response.data);
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


  return (
    <MainLayout title="Verificador QR (Recibo)" subTitle="Almacén">
      <Layout style={{ flex: 1 }}>
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
              ) : qrRecibo.length > 0 ? (
                qrRecibo.map((item, index) => (
                  <Layout key={index} style={styles.card}>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Estatus</Text>
                      <Text style={styles.value}>{item.eprnombre}</Text>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Fecha de Cita</Text>
                      <Text style={styles.value}>{new Date(item.prrfeccita).toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Linea de transporte</Text>
                      <Text style={styles.value}>{item.prrlineatr}</Text>
                    </View>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Chofer</Text>
                          <Text style={styles.value}>{item.prrchofer || 'Sin chofer'}</Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Placas</Text>
                          <Text style={styles.value}>{item.prrplacas || 'No found'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Tipo Vehiculo</Text>
                          <Text style={styles.value}>{item.prrtveid}</Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Tipo Carga</Text>
                          <Text style={styles.value}>{item.prrtcaid}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Unidad</Text>
                          <Text style={styles.value}>{item.prrualid}</Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Cantidad</Text>
                          <Text style={styles.value}>{item.prrcantidad}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Puerta</Text>
                          <Text style={styles.value}>{item.prrdocid}</Text>
                        </View>

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
  value: {
    fontSize: 14,
    color: '#333',
  },
});
