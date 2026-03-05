import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { MainLayout } from '../../layouts/MainLayout';
import { Button, Layout } from '@ui-kitten/components';
import { MyIcon } from '../../components/ui/MyIcon';
import { useAuthStore } from '../../store/modules/useModulesStore';
import { SelectEmpresa } from '../../components/ui/SelectEmpresa';
import {
  getProductsByPage,
  getProductsImage,
  getServidor,
} from '../../../actions/products/get-products-by-page';
import { LoadingScreen } from '../loading/LoadingScreen';
import BottonTabBar from '../../components/ui/BottonTabBar';
import { Products } from '../../../domain/entities/products';
import ProductCard from '../../components/productos/ProductCard';
import ProductDetailModal from './ProductDetailModal';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNMail from "react-native-smtp-mail";
import SmtpMailer from "react-native-smtp-mail";
import ModalCodeScanner from '../../components/ui/ModalCodeScanner';

export const ProductScreen = () => {
  const [descripcion, setDescripcion] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [page, setPage] = useState<number>(0);
  const [products, setProducts] = useState<Products[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const [productImage, setProductImage] = useState<string>('');
  const [correoDestino, setCorreoDestino] = useState<string>('');

  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const [editableEmpresa, setEditableEmpresa] = useState(true);

  const { empresas } = useAuthStore();

  const handleEmpresaSelect = (value: string | null) => {
    console.log('Empresa seleccionada:', value);
    setEmpresa(value || '');
  };

  const handleSearch = async () => {
    try {
      if (!descripcion.trim() && empresa) {
        console.log('Por favor, ingresa un ID de pallet.');
        return;
      }

      setIsLoading(true);

      const data = await getProductsByPage(page, descripcion, empresa);

      setProducts(data);
    } catch (error) {
      console.error('Error fetching cambio ubicaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = async (product: Products) => {
    setSelectedProduct(product);
    setModalVisible(true);

    setProductImage('');

    const clave = product.prdid;

    try {
      setIsLoading(true);

      const data = await getProductsImage(clave);

      if (data && data.length > 0) {
        const base64Icon = data[0].pimimagen;
        setProductImage(base64Icon);
      }
    } catch (error) {
      console.error('Error fetching no se pudo cargar la Imagen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const abrirCamara = () => {
    //  console.log(isSearchByPallet)
    resetScanner();
    setScannerVisible(true); // Muestra el modal para ingresar la ubicación global
  };


  const resetScanner = () => {
    setScannedCode(null); // Limpiar el código escaneado
    setIsCameraActive(true); // Reactivar la cámara
  };



  // const handleServidorPress111111 = async () => {
  //   try {
  //     const mailOptions: MailOptions = {
  //       mailhost: "mail.concir.mx",
  //       port: "587",
  //       ssl: false, // Cambiar a true si el servidor usa SSL
  //       username: "raymundo.silva@concir.mx",
  //       password: "B#S1D&XwILj}",
  //       from: "raymundo.silva@concir.mx",
  //       recipients: "destinatario@ejemplo.com",
  //       subject: "Correo de prueba",
  //       htmlBody: "<h1>Este es un correo enviado desde React Native.</h1>",
  //     };

  //     const response = await RNMail.sendMail(mailOptions);

  //     console.log("Correo enviado:", response);
  //     Alert.alert("Éxito", "Correo enviado correctamente");
  //   } catch (error) {
  //     console.error("Error enviando correo:", error);
  //     Alert.alert("Error", "No se pudo enviar el correo.");
  //   }
  // };

  // const handleServidorPress = async () => {

  //   try {
  //     console.log('RNSmtpMailer:', SmtpMailer);  // Agrega este log para verificar si el objeto está disponible

  //     const response = await SmtpMailer.sendMail({
  //       mailhost: "mail.concir.mx",
  //       port: "465",
  //       username: "raymundo.silva@concir.mx",
  //       password: "B#S1D&XwILj}",
  //       fromEmail: "raymundo.silva@concir.mx",
  //       recipients: "aziel.balbuena@concir.mx",
  //       subject: "Correo de prueba",
  //       htmlBody: "<h1>Este es un correo enviado desde React Native.</h1>",
  //     });

  //     console.log("Correo enviado:", response);
  //     Alert.alert("Éxito", "Correo enviado correctamente.");
  //   } catch (error: any) {
  //     console.error("Error enviando correo:", error || error);
  //     Alert.alert("Error", "No se pudo enviar el correo.");
  //   }
  // };


  const handleServidorPress = async () => {
    const clave = empresa; // Asumiendo que empresa está definido en tu estado o props

    console.log('Empresa seleccionada:', empresa);


       if (!clave) {
            Alert.alert('Info', 'Por favor, seleccione una empresa.');
            return;
          }

    try {
      // Realizamos la petición para obtener los datos del servidor
      const serverData = await getServidor(clave);

      if (!serverData || serverData.length === 0) {
        throw new Error('No se encontraron datos del servidor.');
      }

      const server = serverData[0]; // Usamos el primer registro del array



      console.log(server.ecouser + server.ecopassword + correoDestino + server.ecohost)

      // Enviamos el correo
      const response = await SmtpMailer.sendMail({
        mailhost: server.ecohost, // Host del servidor
        port: server.ecoport.toString(), // Puerto SMTP
        // ssl: server.ecossl === 'S', // Convertir "S" o "N" en booleano
        username: server.ecouser, // Usuario del servidor
        password: server.ecopassword, // Contraseña del servidor
        fromEmail: server.ecouser,
        recipients: correoDestino,
        subject: "Correo de prueba",
        htmlBody: "<h1>Este es un correo enviado desde CIA WMS.</h1>",

      });

      // Notificamos el éxito
      Alert.alert('Éxito', 'Correo enviado correctamente');
      console.log('Correo enviado con éxito.');
    } catch (error: any) {
      // Mostramos cualquier error en una alerta
      console.error('Error al enviar el correo:', error.message);
      Alert.alert('Error', `No se pudo enviar el correo: ${error.message}`);
    }
  };




  const handleCodeScanned = (code: string) => {

    setScannedCode(code); // Guardar el código escaneado
    setIsCameraActive(false); // Desactivar la cámara después del escaneo
    setModalVisible(false);

    setDescripcion(code);

    // isSearchByPallet ? setIdPallet(code) : setUbicacion(code);


    console.log(`Código escaneado: ${code}`);
  };

  return (



    <MainLayout title="Central de Productos" subTitle="Almacén">

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

      <Layout style={{ flex: 1 }}>
        <ScrollView
          style={{ marginHorizontal: 10 }}
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Buscar Producto</Text>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.row}>
                <SelectEmpresa
                  empresas={empresas}
                  onSelect={handleEmpresaSelect}
                  editableEmpresa={editableEmpresa}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  placeholder="Descripción"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  onSubmitEditing={handleSearch}
                />

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={abrirCamara}>
                  <MyIcon name="camera-outline" size={25} white />
                </TouchableOpacity>
              </View>

              {/* Mostrar el escáner QR condicionalmente */}




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
            </View>

            {/* Espaciador */}
            <Layout />

            {isLoading ? (
              <LoadingScreen />
            ) : products.length > 0 ? (
              products.map(product => (
                <ProductCard
                  key={product.prdid}
                  product={product}
                  onPress={handleProductPress}
                />
              ))
            ) : (
              <Text>No hay productos disponibles</Text>
            )}

          </View>
        </ScrollView>
      </Layout>

      <ProductDetailModal
        visible={modalVisible}
        product={selectedProduct}
        productImage={productImage}
        onClose={() => setModalVisible(false)}
      />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  primaryButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  secondaryButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
