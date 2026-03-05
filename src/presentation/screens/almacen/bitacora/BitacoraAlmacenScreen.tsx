import { Alert, ScrollView } from "react-native";
import { Layout } from '@ui-kitten/components';
import { MainLayout } from "../../../layouts/MainLayout";
import { View, Text, TextInput, Button, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useEffect, useState } from "react";
import { SelectEmpresa } from "../../../components/ui/SelectEmpresa";
import { useAuthStore } from "../../../store/modules/useModulesStore";
import { getEstatusInventario } from "../../../../actions/almacen/movimientosInternos/get-Estatus";
import SimpleDropdown from "../../../components/ui/SelectEstatusInventario";
import { getEventosBitacoraAlmacen } from "../../../../actions/almacen/bitacoraAlmacen/get-eventosBitacoraAlmacen";
import { getListaDistribucionBitacora } from '../../../../actions/almacen/bitacoraAlmacen/get-listaDistribucionBitacora';
import { enviarBitacoraAlmacen } from "../../../../actions/almacen/bitacoraAlmacen/post-bitacoraAlmacen";
import { launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';





export const BitacoraAlmacenScreen = () => {

  const [images, setImages] = useState([]);
  const [empresa, setEmpresa] = useState('');
  const [referencia, setReferencia] = useState('');
  const [detalle, setDetalle] = useState('');
  const [listaDistribucion, setListaDistribucion] = useState('');
  const [eventoItems, setEventoItems] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evidencia1, setEvidencia1] = useState('');
  const [evidencia2, setEvidencia2] = useState('');
  const [evidencia3, setEvidencia3] = useState('');
  const [photoCount, setPhotoCount] = useState(0); // Para rastrear la cantidad de fotos tomadas
  const [uriImages, setUriImages] = useState([null, null, null]); // URIs para mostrar las imágenes
  const [editableEmpresa, setEditableEmpresa] = useState(true);



  const { empresas, usuid } = useAuthStore();

  console.log(usuid)


  const [base64Image, setBase64Image] = useState(null);
  const [uriImage, setUriImage] = useState(null);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permiso para usar la cámara',
          message:
            'Esta aplicación necesita acceso a la cámara para tomar fotos.',
          buttonNeutral: 'Preguntar más tarde',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        console.log('Permiso de cámara denegado');
        return;
      }
    }

    if (photoCount >= 3) {
      Alert.alert('Límite alcanzado', 'Solo se permiten 3 fotos.');
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 800,
      maxHeight: 800,
    };

    const result = await launchCamera(options);

    if (result.didCancel) {
      console.log('Captura cancelada por el usuario');
    } else if (result.errorCode) {
      console.error('Error al usar la cámara:', result.errorMessage);
    } else if (result.assets && result.assets.length > 0) {
      const photo = result.assets[0];
      const base64WithPrefix = `data:${photo.type};base64,${photo.base64}`;
      const newPhotoCount = photoCount + 1;

      // Actualizar las imágenes
      const updatedUriImages = [...uriImages];
      updatedUriImages[newPhotoCount - 1] = photo.uri; // Asignamos la foto tomada a la posición correspondiente
      setUriImages(updatedUriImages);

      // Guardar la evidencia correspondiente
      if (newPhotoCount === 1) {
        setEvidencia1(base64WithPrefix);
      } else if (newPhotoCount === 2) {
        setEvidencia2(base64WithPrefix);
      } else if (newPhotoCount === 3) {
        setEvidencia3(base64WithPrefix);
      }

      setPhotoCount(newPhotoCount);
    }
  };



  useEffect(() => {
    const fetchEventosBitacora = async () => {
      try {
        setLoading(true);
        const data = await getEventosBitacoraAlmacen(); // Llamada a la función API
        // Mapeo de datos al formato requerido por DropDownPicker
        const transformedItems = data.map((item) => ({
          label: item.tevnombre, // El texto visible
          value: item.tevid, // El valor interno
        }));
        setEventoItems(transformedItems);
      } catch (err) {
        setError('Error al cargar datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventosBitacora();
  }, []);


  const getListaDistribucion = async (eventoId) => {
    try {
      const data = await getListaDistribucionBitacora(empresa, eventoId); // Llama a la función API
      if (data && data.length > 0) {
        return data[0].eldlistadist; // Extrae el valor de 'eldlistadist' del primer objeto
      }
      return ''; // Si no hay datos, devuelve una cadena vacía
    } catch (error) {
      console.error('Error al obtener la lista de distribución:', error);
      return '';
    }
  };



  const handleDropdownChange = async (value) => {
    setSelectedValue(value);


    console.log("valor sd: "+selectedValue)
    if (value) {
      const lista = await getListaDistribucion(selectedValue);


      console.log(lista);
      setListaDistribucion(lista); // Actualiza el campo "Lista de distribución"
    }
  };

  const handleEmpresaSelect = (value: string | null) => {
    console.log('Empresa seleccionada:', value);
    setEmpresa(value || '');
  };



  //   const pickImage = () => {
  //     if (images.length >= 3) return alert('Solo se permiten 3 imágenes.');

  //     launchImageLibrary(
  //       {
  //         mediaType: 'photo',
  //         selectionLimit: 1,
  //       },
  //       (response) => {
  //         if (response.assets && response.assets.length > 0) {
  //           setImages([...images, response.assets[0].uri]);
  //         }
  //       }
  //     );
  //   };

  const handleSave = async () => {
    const movimiento = {
      empresa: empresa,
      ealtevid: selectedValue,
      ealremid: referencia,
      ealdetalle: detalle,
      lista_distribucio: listaDistribucion,
      ealclob1: evidencia1,
      ealclob2:evidencia2,
      ealclob3:evidencia3,
      idUsuario: 1, // ID de usuario (cambiar si es necesario)
    };


    console.log(movimiento);

    try {
      // Llamada a la API para enviar el movimiento
      const response = await enviarBitacoraAlmacen(movimiento);

      // Alerta de éxito y recarga de datos después de confirmar
      Alert.alert('Éxito', 'Movimiento realizado con éxito:', [
        {
          text: 'OK',
          onPress: async () => {
            console.log('OK Pressed');
          },
        },
      ]);

      console.log("Movimiento realizado con éxito:", response);
    } catch (error) {
      console.error("Error al realizar el movimiento:", error.message);
      console.log("No se pudo realizar el movimiento. Inténtalo de nuevo.");
    }
  };

  const handleClear = () => {
    setEmpresa('');
    setReferencia('');
    setDetalle('');
    setListaDistribucion('');
    setSelectedValue(null);
    setEvidencia1('');
    setEvidencia2('');
    setEvidencia3('');
    setPhotoCount(0);
    setUriImages([null, null, null]);
  };





  return (
    <MainLayout title="Bitacora Almacén" subTitle="Almacén">
      <Layout style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Sección 1 */}
          <View style={[styles.row, styles.selectRow]}>
            <SelectEmpresa
              empresas={empresas}
              onSelect={handleEmpresaSelect}
              editableEmpresa={editableEmpresa}
            />

          </View>

          <View style={[styles.row, styles.selectRowLower]}>
            <SimpleDropdown
              rawItems={eventoItems}
              value={selectedValue}
              initialValue={selectedValue}
              onChangeValue={handleDropdownChange}
              placeholder="Selecciona un evento"
            />
          </View>

          {/* Sección 2 */}
          <View style={styles.section}>

            <TextInput
              style={styles.input}
              placeholder="Referencia"
              value={referencia}
              onChangeText={setReferencia}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalle"
              value={detalle}
              onChangeText={setDetalle}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Lista de distribución"
              value={listaDistribucion}
              onChangeText={setListaDistribucion}
            />
          </View>


          <View style={styles.container}>
            <Button title="Tomar Foto" onPress={handleTakePhoto} />

            {/* Mostrar la última foto tomada */}
            {uriImages[photoCount - 1] && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: uriImages[photoCount - 1] }} style={styles.image} />
              </View>
            )}
          </View>


          {/* <View style={styles.container}>
            <Button title="Tomar Foto" onPress={handleTakePhoto} />

            {uriImage && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: uriImage }} style={styles.image} />
              </View>
            )}

            {base64Image && (
              <Text style={styles.base64Text}>
                {`Base64: ${base64Image.substring(0, 100)}...`}
              </Text>
            )}
          </View> */}

          {/* Sección 3 */}
          {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evidencias (Máximo 3)</Text>
        <View style={styles.imageContainer}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Subir Imagen</Text>
        </TouchableOpacity>
      </View> */}

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <Button title="Guardar" onPress={handleSave} />
            <Button title="Limpiar" onPress={handleClear} color="red" />
          </View>
        </ScrollView>
      </Layout>
    </MainLayout>
  );

};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  base64Text: {
    marginTop: 20,
    fontSize: 12,
    color: '#333',
  },
});