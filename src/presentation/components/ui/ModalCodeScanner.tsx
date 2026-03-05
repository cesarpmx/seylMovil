import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Tamaño del área de escaneo
const SCAN_AREA_WIDTH = SCREEN_WIDTH * 0.9;
const SCAN_AREA_HEIGHT = 200;

interface CodeScannerProps {
    onCodeScanned: (code: string) => void;
    isCameraActive: boolean;
    visible: boolean;
    onClose: () => void;
}

const ModalCodeScanner: React.FC<CodeScannerProps> = ({ visible, onClose, onCodeScanned }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [mensajeCamara, setMensajeCamara] = useState('Alinea el código en el cuadro rojo');
    const [isScanning, setIsScanning] = useState(false);
    const [isReadyToScan, setIsReadyToScan] = useState(false); // Estado para retrasar el escaneo
    const device = useCameraDevice('back');

    useEffect(() => {
        const requestCameraPermission = async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        };
        requestCameraPermission();
    }, []);

    useEffect(() => {
        if (visible) {
            setIsReadyToScan(false); // Bloquea el escaneo al abrir la cámara
            setMensajeCamara('Alinea el código en el cuadro rojo'); 

            setTimeout(() => {
                setIsReadyToScan(true); // Habilita el escaneo después de 3 segundos
                setMensajeCamara('Listo para escanear');
            }, 3000);
        }
    }, [visible]);

    const handleCodeScanned = useCallback(
        (codes) => {
            if (!isReadyToScan || isScanning || codes.length === 0) return; // Evita múltiples escaneos antes del tiempo definido

            setIsScanning(true); // Bloquea nuevos escaneos
            const scannedCode = codes[0];
            console.log('Código detectado:', scannedCode.value);
            setMensajeCamara('Escaneando Código, por favor mantenga firme la cámara');

            setTimeout(() => {
                onCodeScanned(scannedCode.value);
                setIsScanning(false); // Permite escanear nuevamente después del delay
            }, 2000);
        },
        [onCodeScanned, isScanning, isReadyToScan]
    );

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'code-39'],
        onCodeScanned: handleCodeScanned,
    });

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.cameraContainer}>
                    {hasPermission && device ? (
                        <Camera
                            style={styles.camera}
                            isActive={visible}
                            device={device}
                            codeScanner={codeScanner}
                        />
                    ) : (
                        <Text style={styles.centeredText}>Permiso de cámara denegado</Text>
                    )}
                    {/* Marco visual del área de escaneo */}
                    <View style={styles.scanArea} />
                </View>

                <Text style={styles.centeredText}>{mensajeCamara}</Text>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    cameraContainer: {
        width: '100%',
        height: 350,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 10,
        backgroundColor: 'black',
    },
    camera: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
    },
    scanArea: {
        position: 'absolute',
        width: SCAN_AREA_WIDTH,
        height: SCAN_AREA_HEIGHT,
        borderColor: 'red',
        borderWidth: 3,
        borderRadius: 10,
    },
    closeButton: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    centeredText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        marginTop: 10,
    },
});

export default ModalCodeScanner;
