import React, { useState, useEffect, useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Layout } from '@ui-kitten/components';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

interface CodeScannerProps {
  onCodeScanned: (code: string) => void; // Callback al escanear un código
  isCameraActive: boolean; // Controla si la cámara está activa
  style?: object; // Opcional: Estilos personalizados
}

const CodeScanner: React.FC<CodeScannerProps> = ({ onCodeScanned, isCameraActive, style }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isReadyToScan, setIsReadyToScan] = useState(false); // Retraso en escaneo
  const [isScanning, setIsScanning] = useState(false); // Controla múltiples escaneos
  const [mensajeCamara, setMensajeCamara] = useState('Alinea el código en el cuadro');

  const device = useCameraDevice('back'); // Usa la cámara trasera

  // Solicita permisos de cámara
  const requestCameraPermission = async () => {
    try {
      const status = await Camera.requestCameraPermission();
      console.log('Estado del permiso solicitado:', status);
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error solicitando permisos de cámara:', error);
    }
  };

  // Verifica permisos al montar el componente
  useEffect(() => {
    const checkPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();
      console.log('Estado inicial del permiso:', status);
      if (status === 'authorized' || status === 'granted') {
        setHasPermission(true);
      } else {
        await requestCameraPermission();
      }
    };
    checkPermission();
  }, []);

  // Configura el estado de la cámara cuando el dispositivo esté listo
  useEffect(() => {
    if (device) {
      setCameraReady(true);
    }
  }, [device]);

  // Al activar la cámara, espera 3 segundos antes de permitir el escaneo
  useEffect(() => {
    if (isCameraActive) {
      setIsReadyToScan(false);
      setMensajeCamara('Alinea el código en el cuadro');

      setTimeout(() => {
        setIsReadyToScan(true);
        setMensajeCamara('Listo para escanear');
      }, 3000);
    }
  }, [isCameraActive]);

  // Maneja los códigos escaneados
  const handleCodeScanned = useCallback(
    (codes) => {
      if (!isReadyToScan || isScanning || codes.length === 0) return; // Bloquea múltiples escaneos

      setIsScanning(true); // Bloquea nuevos escaneos
      const code = codes[0].value;
      console.log('Código detectado:', code);
      setMensajeCamara('Escaneando, mantén la cámara estable...');

      setTimeout(() => {
        onCodeScanned(code);
        setIsScanning(false); // Permite escanear nuevamente después del delay
      }, 2000);
    },
    [onCodeScanned, isScanning, isReadyToScan]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-39'], // Agrega más tipos si es necesario
    onCodeScanned: handleCodeScanned,
  });

  return (
    <Layout style={[styles.container, style]}>
      {hasPermission ? (
        cameraReady && isCameraActive ? (
          <>
            <Camera
              style={StyleSheet.absoluteFill}
              isActive={true}
              device={device}
              codeScanner={codeScanner}
            />
            <Text style={styles.overlayText}>{mensajeCamara}</Text>
          </>
        ) : (
          <Text style={styles.centeredText}>
            Cámara {isCameraActive ? 'cargando...' : 'desactivada'}
          </Text>
        )
      ) : (
        <Text style={styles.centeredText}>
          Permiso de cámara denegado. Habilítalo en la configuración.
        </Text>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: 300,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredText: {
    textAlign: 'center',
    marginTop: 130,
  },
  overlayText: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: 5,
    borderRadius: 5,
    fontSize: 14,
  },
});

export default CodeScanner;
