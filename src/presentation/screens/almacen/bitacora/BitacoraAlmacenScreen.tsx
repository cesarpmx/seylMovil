import { Alert, ScrollView } from "react-native";
import { Layout } from '@ui-kitten/components';
import { MainLayout } from "../../../layouts/MainLayout";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MyIcon } from "../../../components/ui/MyIcon";
import { useEffect, useState } from "react";
import { SelectEmpresa } from "../../../components/ui/SelectEmpresa";
import { SelectAlmacen } from "../../../components/ui/SelectAlmacen";
import { useAuthStore } from "../../../store/modules/useModulesStore";
import { getEstatusInventario } from "../../../../actions/almacen/movimientosInternos/get-Estatus";
import SimpleDropdown from "../../../components/ui/SelectEstatusInventario";
import { getEventosBitacoraAlmacen } from "../../../../actions/almacen/bitacoraAlmacen/get-eventosBitacoraAlmacen";
import { getListaDistribucionBitacora } from '../../../../actions/almacen/bitacoraAlmacen/get-listaDistribucionBitacora';
import { enviarBitacoraAlmacen } from "../../../../actions/almacen/bitacoraAlmacen/post-bitacoraAlmacen";
import { getRemisionAlmacen } from "../../../../actions/almacen/bitacoraAlmacen/get-remisionAlmacen";
import { launchCamera } from 'react-native-image-picker';
import { ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import { fixEncoding } from "../../../../helpers/fixEncoding";
import { enviarCorreoEmpresa } from "../../../../actions/correo/enviar-correo-empresa";





export const BitacoraAlmacenScreen = () => {

  const [images, setImages] = useState([]);
  const [empresa, setEmpresa] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [almacenError, setAlmacenError] = useState(false);
  const [editableAlmacen, setEditableAlmacen] = useState(true);
  const [referencia, setReferencia] = useState('');
  const [detalle, setDetalle] = useState('');
  const [listaDistribucion, setListaDistribucion] = useState('');
  const [eventoItems, setEventoItems] = useState<{label: string; value: any}[]>([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evidencia1, setEvidencia1] = useState('');
  const [evidencia2, setEvidencia2] = useState('');
  const [evidencia3, setEvidencia3] = useState('');
  const [photoCount, setPhotoCount] = useState(0); // Para rastrear la cantidad de fotos tomadas
  const [uriImages, setUriImages] = useState([null, null, null]); // URIs para mostrar las imágenes
  const [editableEmpresa, setEditableEmpresa] = useState(true);

  // Validaciones y estado de verificación de la remisión
  const [referenciaValida, setReferenciaValida] = useState(false);
  const [verificandoRef, setVerificandoRef] = useState(false);
  const [empresaError, setEmpresaError] = useState(false);
  const [eventoError, setEventoError] = useState(false);
  const [referenciaError, setReferenciaError] = useState(false);
  const [detalleError, setDetalleError] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [probandoCorreo, setProbandoCorreo] = useState(false);

  const probarCorreo = async () => {
    if (!empresa) {
      Alert.alert('Falta Empresa', 'Selecciona una empresa para enviar correo.');
      return;
    }
    if (!listaDistribucion || listaDistribucion.trim().length === 0) {
      Alert.alert(
        'Sin destinatarios',
        'Selecciona un Evento para que se cargue la lista de distribución.',
      );
      return;
    }

    try {
      setProbandoCorreo(true);
      console.log('[BitacoraAlmacen] → disparando correo MANUAL (botón)');
      const resultado = await enviarCorreoEmpresa({
        idEmpresa: empresa,
        destinatarios: listaDistribucion,
        asunto: 'Prueba SMTP - Seyl WMS',
        cuerpo:
          'Este es un correo de prueba enviado desde la app Seyl-WMS.\n\n' +
          `Empresa: ${empresa}\nDestinatarios: ${listaDistribucion}\n\n` +
          'Si recibes este mensaje, la configuración SMTP funciona correctamente.',
      });
      Alert.alert('Correo enviado', resultado || 'Correo enviado correctamente.');
    } catch (e: any) {
      console.error('[BitacoraAlmacen] error correo:', e);
      Alert.alert('Error de correo', e?.message || 'No se pudo enviar el correo.');
    } finally {
      setProbandoCorreo(false);
    }
  };



  const { empresas, almacenes, usuid } = useAuthStore();

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


  const getListaDistribucion = async (eventoId: string) => {
    try {
      const data = await getListaDistribucionBitacora(empresa, eventoId);
      if (!data || data.length === 0) return '';
      // Descarta la fila "meta" de Oracle (todos los campos en null) y
      // concatena las direcciones de correo separadas por coma, igual que el web.
      const correos = data
        .filter((it: any) => it && it.eldlistadist)
        .map((it: any) => String(it.eldlistadist).trim())
        .filter(Boolean);
      return correos.join(', ');
    } catch (error) {
      console.error('Error al obtener la lista de distribución:', error);
      return '';
    }
  };

  const handleDropdownChange = async (value) => {
    setSelectedValue(value);
    if (value) {
      setEventoError(false);
      if (!empresa) {
        // Sin empresa no hay contra qué consultar; se limpia la lista
        setListaDistribucion('');
        return;
      }
      const lista = await getListaDistribucion(value);
      setListaDistribucion(lista);
    } else {
      setListaDistribucion('');
    }
  };

  const handleEmpresaSelect = (value: string | null) => {
    console.log('Empresa seleccionada:', value);
    setEmpresa(value || '');
    if (value) setEmpresaError(false);
  };

  const handleAlmacenSelect = (value: string | null) => {
    console.log('Almacén seleccionado:', value);
    setAlmacen(value || '');
    if (value) setAlmacenError(false);
  };

  const handleReferenciaChange = (text: string) => {
    setReferencia(text);
    // Al modificar la referencia, invalidamos la verificación previa
    setReferenciaValida(false);
    setReferenciaError(false);
  };

  const verificarRemision = async () => {
    const clave = referencia.trim();
    if (!clave) {
      setReferenciaValida(false);
      return;
    }
    if (!empresa || !almacen) {
      Alert.alert(
        'Selecciona Empresa y Almacén',
        'Debes seleccionar Empresa y Almacén antes de validar la remisión.',
      );
      setReferencia('');
      setReferenciaValida(false);
      return;
    }
    // Si ya está validada (mismo valor), no re-verificamos
    if (referenciaValida) return;

    try {
      setVerificandoRef(true);
      const rem = await getRemisionAlmacen(clave, empresa, almacen);
      if (rem && rem.remid) {
        setReferencia(String(rem.remid));
        setReferenciaValida(true);
        setReferenciaError(false);
      } else {
        setReferenciaValida(false);
        Alert.alert(
          'Clave no encontrada',
          `La Remisión "${clave}" no existe en el sistema. Por favor, verifica e intenta nuevamente.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setReferencia('');
                setReferenciaError(true);
              },
            },
          ],
        );
      }
    } catch (e) {
      setReferenciaValida(false);
      Alert.alert('Error', 'No se pudo verificar la remisión. Intenta nuevamente.');
    } finally {
      setVerificandoRef(false);
    }
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
    // Validación de campos requeridos
    const faltaEmpresa = !empresa;
    const faltaEvento = !selectedValue;
    const faltaReferencia = !referencia.trim();
    const faltaDetalle = !detalle.trim();

    setEmpresaError(faltaEmpresa);
    setEventoError(faltaEvento);
    setReferenciaError(faltaReferencia);
    setDetalleError(faltaDetalle);

    if (faltaEmpresa || faltaEvento || faltaReferencia || faltaDetalle) {
      Alert.alert(
        'Faltan campos requeridos',
        'Empresa, Evento, Referencia y Detalle son obligatorios.',
      );
      return;
    }

    if (!referenciaValida) {
      Alert.alert(
        'Referencia sin verificar',
        'La Remisión ingresada no se ha validado. Sal del campo para verificarla o corrige la clave.',
      );
      setReferenciaError(true);
      return;
    }

    const movimiento = {
      empresa: empresa,
      ealtevid: selectedValue,
      ealremid: referencia,
      ealdetalle: detalle,
      lista_distribucio: listaDistribucion,
      ealclob1: evidencia1 || null,
      ealclob2: evidencia2 || null,
      ealclob3: evidencia3 || null,
      idUsuario: usuid,
    };

    try {
      setGuardando(true);
      const response = await enviarBitacoraAlmacen(movimiento);
      const success = String(response?.success ?? '').toLowerCase() === 'true' || response?.success === true;
      const message = fixEncoding(response?.message) || (success ? 'Evento de bitácora insertado.' : 'No se pudo guardar el registro.');

      if (success) {
        // Envío automático del correo si hay destinatarios
        let mensajeCorreo = '';
        console.log('[BitacoraAlmacen] POST OK. Destinatarios:', JSON.stringify(listaDistribucion));
        if (listaDistribucion && listaDistribucion.trim().length > 0) {
          console.log('[BitacoraAlmacen] → disparando correo AUTOMÁTICO (post-guardar)');
          try {
            const nombreEvento =
              eventoItems.find((it: any) => it.value === selectedValue)?.label || '';
            const idBitacora = (response as any)?.id;
            const cuerpo =
              `Se registró un nuevo evento en la Bitácora de Almacén.\n\n` +
              (idBitacora ? `Folio: ${idBitacora}\n` : '') +
              `Empresa: ${empresa}\n` +
              (nombreEvento ? `Evento: ${nombreEvento}\n` : '') +
              (referencia ? `Referencia (Remisión): ${referencia}\n` : '') +
              (detalle ? `\nDetalle:\n${detalle}\n` : '') +
              `\n---\nRespuesta del sistema: ${message}\n` +
              `\nEnviado automáticamente desde la app Seyl-WMS.`;

            const resultadoCorreo = await enviarCorreoEmpresa({
              idEmpresa: empresa,
              destinatarios: listaDistribucion,
              asunto: `Bitácora almacén${nombreEvento ? ' - ' + nombreEvento : ''}`,
              cuerpo,
              // adjuntos: se omiten de momento
            });
            console.log('[BitacoraAlmacen] ✅ correo AUTOMÁTICO enviado:', resultadoCorreo);
            mensajeCorreo = '\n\nCorreo enviado a la lista de distribución.';
          } catch (mailErr: any) {
            console.error('[BitacoraAlmacen] error correo automático:', mailErr);
            mensajeCorreo =
              '\n\nAtención: el registro se guardó pero el correo no pudo enviarse (' +
              (mailErr?.message || 'error desconocido') +
              ').';
          }
        }

        Alert.alert('Éxito', message + mensajeCorreo, [
          {
            text: 'OK',
            onPress: () => {
              handleClear();
            },
          },
        ]);
      } else {
        Alert.alert('Error', message);
      }
    } catch (error: any) {
      console.error('Error al realizar el movimiento:', error?.message);
      Alert.alert('Error', error?.message || 'No se pudo realizar el movimiento.');
    } finally {
      setGuardando(false);
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
    setReferenciaValida(false);
    setEmpresaError(false);
    setEventoError(false);
    setReferenciaError(false);
    setDetalleError(false);
    // Fuerza el re-mount de los selects para limpiar su estado interno
    setResetKey(prev => prev + 1);
  };





  return (
    <MainLayout title="Bitácora Almacén" subTitle="Almacén">
      <Layout style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderIcon}>
              <MyIcon name="clipboard-outline" size={22} white />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>Bitácora de almacén</Text>
              <Text style={styles.pageSubtitle}>
                Registra un evento asociado a una remisión
              </Text>
            </View>
          </View>

          {/* Card: contexto */}
          <View style={[styles.card, { zIndex: 3000 }]}>
            <Text style={styles.sectionTitle}>Contexto</Text>

            <View style={[styles.fieldGroup, { zIndex: 3000 }]}>
              <Text style={styles.fieldLabel}>Empresa *</Text>
              <SelectEmpresa
                key={`empresa-${resetKey}`}
                empresas={empresas}
                onSelect={handleEmpresaSelect}
                editableEmpresa={editableEmpresa}
                hasError={empresaError}
              />
            </View>

            <View style={[styles.fieldGroup, { zIndex: 2500 }]}>
              <Text style={styles.fieldLabel}>Almacén *</Text>
              <SelectAlmacen
                key={`almacen-${resetKey}`}
                almacenes={almacenes}
                onSelect={handleAlmacenSelect}
                editable={editableAlmacen}
                hasError={almacenError}
              />
            </View>

            <View style={[styles.fieldGroup, { zIndex: 2000 }]}>
              <Text style={styles.fieldLabel}>Evento *</Text>
              <SimpleDropdown
                key={`evento-${resetKey}`}
                rawItems={eventoItems}
                value={selectedValue}
                initialValue={selectedValue}
                onChangeValue={handleDropdownChange}
                placeholder="Selecciona un evento"
                hasError={eventoError}
              />
            </View>
          </View>

          {/* Card: detalles */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Detalles</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Referencia (Remisión) *</Text>
              <View style={styles.referenciaWrap}>
                <TextInput
                  style={[
                    styles.formInput,
                    styles.referenciaInput,
                    referenciaError && styles.inputError,
                    referenciaValida && styles.inputValid,
                  ]}
                  placeholder="Escribe la clave y sal del campo"
                  placeholderTextColor={referenciaError ? '#EF4444' : '#94A3B8'}
                  value={referencia}
                  onChangeText={handleReferenciaChange}
                  onBlur={verificarRemision}
                  returnKeyType="done"
                />
                {verificandoRef ? (
                  <ActivityIndicator
                    size="small"
                    color="#2563EB"
                    style={styles.referenciaIndicator}
                  />
                ) : referenciaValida ? (
                  <View style={styles.referenciaBadge}>
                    <Text style={styles.referenciaBadgeText}>✓</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Detalle *</Text>
              <TextInput
                style={[
                  styles.formInput,
                  styles.textArea,
                  detalleError && styles.inputError,
                ]}
                placeholder="Describe el evento…"
                placeholderTextColor={detalleError ? '#EF4444' : '#94A3B8'}
                value={detalle}
                onChangeText={t => {
                  setDetalle(t);
                  if (t.trim()) setDetalleError(false);
                }}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Lista de distribución</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Se llena por el evento o escribe correos separados por coma"
                placeholderTextColor="#94A3B8"
                value={listaDistribucion}
                onChangeText={setListaDistribucion}
                multiline
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Card: evidencias */}
          <View style={styles.card}>
            <View style={styles.evidenciasHeader}>
              <Text style={styles.sectionTitle}>Evidencias</Text>
              <View style={styles.evidenciaCounter}>
                <Text style={styles.evidenciaCounterText}>
                  {photoCount}/3
                </Text>
              </View>
            </View>

            <View style={styles.thumbsRow}>
              {[0, 1, 2].map(i => (
                <View key={i} style={styles.thumbBox}>
                  {uriImages[i] ? (
                    <Image source={{ uri: uriImages[i] }} style={styles.thumbImg} />
                  ) : (
                    <View style={styles.thumbEmpty}>
                      <MyIcon name="image-outline" size={22} />
                    </View>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.cameraBtn,
                photoCount >= 3 && styles.cameraBtnDisabled,
              ]}
              onPress={handleTakePhoto}
              disabled={photoCount >= 3}>
              <MyIcon name="camera-outline" size={18} white />
              <Text style={styles.cameraBtnText}>
                {photoCount >= 3 ? 'Máximo alcanzado' : 'Tomar foto'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Acciones */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.saveBtn, guardando && styles.btnDisabled]}
              onPress={handleSave}
              disabled={guardando}>
              <MyIcon name="save-outline" size={18} white />
              <Text style={styles.saveBtnText}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.mailBtn, (guardando || probandoCorreo) && styles.btnDisabled]}
              onPress={probarCorreo}
              disabled={guardando || probandoCorreo}>
              <MyIcon name="email-outline" size={18} white />
              <Text style={styles.mailBtnText}>
                {probandoCorreo ? '…' : 'Correo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.clearBtn, guardando && styles.btnDisabled]}
              onPress={handleClear}
              disabled={guardando}>
              <MyIcon name="trash-2-outline" size={18} white />
              <Text style={styles.clearBtnText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Layout>
    </MainLayout>
  );

};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
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
    shadowOffset: { width: 0, height: 4 },
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  helpText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 44,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 10,
  },
  formInputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  section: {
    marginBottom: 20,
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
  referenciaWrap: {
    position: 'relative',
  },
  referenciaInput: {
    paddingRight: 40,
  },
  referenciaIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  referenciaBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referenciaBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  inputValid: {
    borderColor: '#16A34A',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  evidenciasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  evidenciaCounter: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  evidenciaCounterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.4,
  },
  thumbsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  thumbBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
  },
  cameraBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  cameraBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  saveBtn: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  mailBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
  },
  mailBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  clearBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});