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
import { QREmbarque } from '../../../domain/entities/almacen/embarque/QrEmbarque';
import { enviarConfirmacionEmbarqueQR, getQrEmbarque } from '../../../actions/almacen/embarque/get-qrembarque';
import { LoadingScreen } from '../loading/LoadingScreen';
import { useAuthStore } from '../../store/modules/useModulesStore';
import { ScrollView } from 'react-native-gesture-handler';




export const VerificadorEmbarqueScreen = () => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true); // Controla si la cámara está activa
  const [qrEmbarque, setQrEmbarque] = useState<QREmbarque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { usuid } = useAuthStore();

  const handleCodeScanned = async (code: string) => {
    setScannedCode(code); // Guardar el código escaneado
    setIsCameraActive(false); // Desactivar la cámara después del escaneo
    console.log(`Código escaneado: ${code}`);

    const data = await getQrEmbarque(code.trim());

    // Formatear los datos para agregar campos adicionales que serán usados en la UI
    setQrEmbarque(
      data.map((item) => ({
        ...item
      }))
    );



  };

  const resetScanner = () => {
    setScannedCode(null); // Limpiar el código escaneado
    setIsCameraActive(true); // Reactivar la cámara
    setQrEmbarque([])
  };

  const handleConfirm = async () => {

    if (qrEmbarque.length > 0) {
      // Extraer valores
      const { pemempid, pemalmid, pemid, pemestatus } = qrEmbarque[0];

      // Crear el JSON
      const jsonData = {
        empresa: pemempid,
        almacen: pemalmid,
        clave: pemid,
        estatus: pemestatus,
        idUsuario: usuid, // Agregamos el código escaneado
      };

      console.log("Enviando datos:", jsonData);

      try {
        // Llamada a la API para enviar los movimientos
        const response = await enviarConfirmacionEmbarqueQR(jsonData);
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
    <MainLayout title="Verificador QR (Embarque)" subTitle="Almacén">
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
              ) : qrEmbarque.length > 0 ? (
                qrEmbarque.map((item, index) => (
                  <Layout key={index} style={styles.card}>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Estatus</Text>
                      <Text style={styles.value}>{item.epenombre}</Text>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Fecha de Carga</Text>
                      <Text style={styles.value}>{new Date(item.pemfeccarga).toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailGroup}>
                      <Text style={styles.label}>Proveedor</Text>
                      <Text style={styles.value}>{item.proveedor}</Text>
                    </View>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Chofer</Text>
                          <Text style={styles.value}>{item.chonombre || 'Sin chofer'}</Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Placas</Text>
                          <Text style={styles.value}>{item.vehplacas || 'No found'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Tipo Vehiculo</Text>
                          <Text style={styles.value}>{item.vehtveid}</Text>
                        </View>
                      </View>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Tipo Embarque</Text>
                          <Text style={styles.value}>{item.temnombre}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Ruta</Text>
                          <Text style={styles.value}>{item.pemruta}</Text>
                        </View>
                      </View>

                    </View>

                    <View style={styles.detailsContainer}>
                      <View style={styles.column}>
                        <View style={styles.detailGroup}>
                          <Text style={styles.label}>Comentarios</Text>
                          <Text style={styles.value}>{item.pemcoms}</Text>
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