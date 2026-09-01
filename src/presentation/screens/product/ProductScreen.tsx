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
import { postProductoImagen } from '../../../actions/products/post-productoImagen';
import { launchCamera, launchImageLibrary, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';
import { LoadingScreen } from '../loading/LoadingScreen';
import BottonTabBar from '../../components/ui/BottonTabBar';
import { Products } from '../../../domain/entities/products';
import ProductCard from '../../components/productos/ProductCard';
import ProductDetailModal from './ProductDetailModal';
// import QRCodeScanner from 'react-native-qrcode-scanner'; // no usado aquí; incompatible con new arch
// import { RNCamera } from 'react-native-camera'; // deprecada, crashea con RN 0.76 new arch
// import RNMail from "react-native-smtp-mail"; // temporalmente deshabilitado para simulador
// import SmtpMailer from "react-native-smtp-mail"; // temporalmente deshabilitado para simulador
const SmtpMailer: any = { sendMail: async () => { throw new Error('SMTP deshabilitado en simulador'); } };
import ModalCodeScanner from '../../components/ui/ModalCodeScanner';

export const ProductScreen = () => {
  const PAGE_SIZE = 20;
  const [descripcion, setDescripcion] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [page, setPage] = useState<number>(0);
  const [products, setProducts] = useState<Products[]>([]);
  const [totalRecs, setTotalRecs] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const [productImage, setProductImage] = useState<string>('');
  const [productImageId, setProductImageId] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [correoDestino, setCorreoDestino] = useState<string>('');

  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [empresaError, setEmpresaError] = useState(false);

  const { empresas, usuid, modules } = useAuthStore();

  // Busca recursivamente el umoacceso para un contexto dado.
  // Los submódulos vienen en `modulos` o `subModulos` según el nivel.
  const findAccesoByContexto = (
    tree: any[] | undefined,
    contexto: string,
  ): number => {
    if (!Array.isArray(tree)) return 0;
    for (const m of tree) {
      if (m?.modcontexto === contexto) return Number(m?.umoacceso) || 0;
      const hijos = [
        ...(Array.isArray(m?.modulos) ? m.modulos : []),
        ...(Array.isArray(m?.subModulos) ? m.subModulos : []),
      ];
      if (hijos.length > 0) {
        const encontrado = findAccesoByContexto(hijos, contexto);
        if (encontrado > 0) return encontrado;
      }
    }
    return 0;
  };

  // Nivel de acceso al módulo de central de productos → aplica a la imagen.
  // Reglas del backend: acceso ≥ 2 puede INSERT, acceso ≥ 3 puede UPDATE.
  const imagenAcceso = findAccesoByContexto(modules, '/almacen/productos/central/');
  const canInsertImage = imagenAcceso >= 2;
  const canUpdateImage = imagenAcceso >= 3;

  const loadProductsByEmpresa = async (
    empresaValue: string,
    descripcionValue: string = '',
    pageValue: number = 0,
  ) => {
    try {
      setIsLoading(true);
      const result = await getProductsByPage(pageValue, descripcionValue, empresaValue, PAGE_SIZE);
      setProducts(result.products);
      setPage(pageValue);

      const knownTotal = pageValue === 0 ? result.totalrecs : totalRecs;
      const effectiveTotal = Math.max(
        knownTotal,
        pageValue * PAGE_SIZE + result.products.length,
      );
      if (pageValue === 0) {
        setTotalRecs(result.totalrecs);
      } else if (effectiveTotal > totalRecs) {
        setTotalRecs(effectiveTotal);
      }

      const computedHasMore =
        effectiveTotal > 0
          ? (pageValue + 1) * PAGE_SIZE < effectiveTotal
          : result.hasMore;
      setHasMore(computedHasMore);
    } catch (error: any) {
      console.error('Error fetching productos:', error?.response?.status, error?.response?.data, error?.message);
      setProducts([]);
      if (pageValue === 0) {
        setTotalRecs(0);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmpresaSelect = (value: string | null) => {
    console.log('Empresa seleccionada:', value);
    const nuevaEmpresa = value || '';
    setEmpresa(nuevaEmpresa);
    setDescripcion('');
    if (nuevaEmpresa) {
      setEmpresaError(false);
      loadProductsByEmpresa(nuevaEmpresa, '', 0);
    } else {
      setProducts([]);
      setTotalRecs(0);
      setHasMore(false);
      setPage(0);
    }
  };

  const handleSearch = async (overrideText?: string) => {
    if (!empresa) {
      setEmpresaError(true);
      Alert.alert('Info', 'Por favor, seleccione una empresa.');
      return;
    }
    setEmpresaError(false);
    // Si viene texto del evento (scanner handheld) lo usamos directo,
    // ya que setDescripcion es async y aún no está en el state.
    const textoBusqueda =
      typeof overrideText === 'string' ? overrideText : descripcion;
    if (typeof overrideText === 'string' && overrideText !== descripcion) {
      setDescripcion(overrideText);
    }
    await loadProductsByEmpresa(empresa, textoBusqueda, 0);
  };

  const handleNextPage = async () => {
    if (!empresa || !hasMore || isLoading) return;
    await loadProductsByEmpresa(empresa, descripcion, page + 1);
  };

  const handlePrevPage = async () => {
    if (!empresa || page <= 0 || isLoading) return;
    await loadProductsByEmpresa(empresa, descripcion, page - 1);
  };

  const totalPages = totalRecs > 0 ? Math.ceil(totalRecs / PAGE_SIZE) : 0;

  const handleProductPress = async (product: Products) => {
    setSelectedProduct(product);
    setModalVisible(true);

    setProductImage('');
    setProductImageId('');
    setIsImageLoading(true);

    const clave = product.prdid;

    try {
      const data = await getProductsImage(clave);

      if (data && data.length > 0 && data[0].pimimagen) {
        setProductImage(data[0].pimimagen);
        if (data[0].pimid !== undefined && data[0].pimid !== null) {
          setProductImageId(String(data[0].pimid));
        }
      }
    } catch (error) {
      console.error('Error fetching no se pudo cargar la Imagen:', error);
    } finally {
      setIsImageLoading(false);
    }
  };

  const abrirCamara = () => {
    //  console.log(isSearchByPallet)
    resetScanner();
    setScannerVisible(true); // Muestra el modal para ingresar la ubicación global
  };

  // Sube la imagen al backend con el mismo shape que el front web:
  // POST /archivos/productos/?clave={clave}  body: { pimprdid, pimimagen }
  const subirImagenProducto = async (base64WithPrefix: string) => {
    if (!selectedProduct) return;
    try {
      setIsUploadingImage(true);
      const resp = await postProductoImagen(selectedProduct.prdid, {
        pimprdid: String(selectedProduct.prdid),
        pimimagen: base64WithPrefix,
        // Si ya existía una imagen previa, mandamos su pimid para que el
        // backend ACTUALICE en vez de insertar un registro nuevo.
        ...(productImageId ? { pimid: productImageId } : {}),
        // Usuario en sesión → el backend valida permisos sobre el contexto.
        idUsuario: String(usuid ?? ''),
      });
      console.log('[subirImagenProducto] respuesta backend:', JSON.stringify(resp));
      const ok = resp?.success === true || String(resp?.success) === 'true';
      if (ok) {
        setProductImage(base64WithPrefix);
        Alert.alert('Éxito', resp?.message || 'Imagen subida correctamente.');
      } else {
        // Casos 210/211/212 → llegan como respuesta "exitosa" HTTP pero con success:false.
        Alert.alert('Sin permisos', resp?.message || 'No se pudo subir la imagen.');
      }
    } catch (e: any) {
      console.error('[subirImagenProducto] error:', e?.message);
      // Si el backend respondió con JSON (400/401/403/409/500), mostramos su mensaje real.
      const backendMsg = e?.response?.data?.message;
      Alert.alert('Error', backendMsg || 'Ocurrió un error al subir la imagen.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePickFromCamera = async () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 750,
      maxHeight: 550,
      quality: 0.9,
      saveToPhotos: false,
      cameraType: 'back',
    };
    const result = await launchCamera(options);
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Cámara', result.errorMessage || 'No se pudo abrir la cámara.');
      return;
    }
    const photo = result.assets?.[0];
    if (!photo?.base64) return;
    const mime = photo.type || 'image/jpeg';
    await subirImagenProducto(`data:${mime};base64,${photo.base64}`);
  };

  const handlePickFromGallery = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 750,
      maxHeight: 550,
      quality: 0.9,
      selectionLimit: 1,
    };
    const result = await launchImageLibrary(options);
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Galería', result.errorMessage || 'No se pudo abrir la galería.');
      return;
    }
    const photo = result.assets?.[0];
    if (!photo?.base64) return;
    const mime = photo.type || 'image/jpeg';
    await subirImagenProducto(`data:${mime};base64,${photo.base64}`);
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

      {isCameraActive && isScannerVisible ? (

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

      <Layout style={{flex: 1, backgroundColor: '#F8FAFC'}}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderIcon}>
                <MyIcon name="search-outline" size={22} white />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.pageTitle}>Buscar producto</Text>
                <Text style={styles.pageSubtitle}>
                  Consulta el catálogo por empresa
                </Text>
              </View>
            </View>

            {/* Search card */}
            <View style={styles.searchCard}>
              <View style={{marginBottom: 12}}>
                <SelectEmpresa
                  empresas={empresas}
                  onSelect={handleEmpresaSelect}
                  editableEmpresa={editableEmpresa}
                  hasError={empresaError}
                />
              </View>

              <View style={styles.searchInputRow}>
                <View style={styles.inputWrap}>
                  <MyIcon name="search-outline" size={18} />
                  <TextInput
                    style={styles.input}
                    placeholder="Buscar por descripción..."
                    placeholderTextColor="#94A3B8"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    onSubmitEditing={e =>
                      handleSearch(e?.nativeEvent?.text ?? descripcion)
                    }
                    returnKeyType="search"
                    blurOnSubmit={false}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cameraButton}
                  onPress={abrirCamara}>
                  <MyIcon name="camera-outline" size={22} white />
                </TouchableOpacity>
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
            </View>

            {isLoading ? (
              <LoadingScreen />
            ) : products.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{totalRecs}</Text>
                  </View>
                  <Text style={styles.resultsText}>
                    Mostrando {page * PAGE_SIZE + 1}–
                    {page * PAGE_SIZE + products.length}
                  </Text>
                </View>

                {products.map(product => (
                  <ProductCard
                    key={product.prdid}
                    product={product}
                    onPress={handleProductPress}
                  />
                ))}

                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.pageButton,
                      (page <= 0 || isLoading) && styles.pageButtonDisabled,
                    ]}
                    disabled={page <= 0 || isLoading}
                    onPress={handlePrevPage}>
                    <Text style={styles.pageButtonText}>‹ Anterior</Text>
                  </TouchableOpacity>
                  <View style={styles.pageInfoWrap}>
                    <Text style={styles.pageInfoNumber}>{page + 1}</Text>
                    {totalPages > 0 && (
                      <Text style={styles.pageInfoTotal}>de {totalPages}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.pageButton,
                      (!hasMore || isLoading) && styles.pageButtonDisabled,
                    ]}
                    disabled={!hasMore || isLoading}
                    onPress={handleNextPage}>
                    <Text style={styles.pageButtonText}>Siguiente ›</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <MyIcon name="cube-outline" size={32} />
                </View>
                <Text style={styles.emptyTitle}>Sin productos</Text>
                <Text style={styles.emptySubtitle}>
                  Selecciona una empresa y realiza tu búsqueda.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </Layout>

      <ProductDetailModal
        visible={modalVisible}
        product={selectedProduct}
        productImage={productImage}
        isImageLoading={isImageLoading}
        isUploading={isUploadingImage}
        canInsertImage={canInsertImage}
        canUpdateImage={canUpdateImage}
        onPickImageCamera={handlePickFromCamera}
        onPickImageGallery={handlePickFromGallery}
        onClose={() => setModalVisible(false)}
      />
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
    shadowOffset: {width: 0, height: 4},
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 6,
    padding: 0,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 4,
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
});
