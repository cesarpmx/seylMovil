import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {MainLayout} from '../../../layouts/MainLayout';
import {Layout} from '@ui-kitten/components';
import {useAuthStore} from '../../../store/modules/useModulesStore';
import {MyIcon} from '../../../components/ui/MyIcon';
import {SelectEmpresa} from '../../../components/ui/SelectEmpresa';
import {SelectAlmacen} from '../../../components/ui/SelectAlmacen';
import {getRemisionAlmacen} from '../../../../actions/almacen/bitacoraAlmacen/get-remisionAlmacen';
import {postDetRemisionProducto} from '../../../../actions/almacen/ingresos/post-detRemisionProducto';
import {SelectProducto, SelectProductoHandle} from '../../../components/ui/SelectProducto';
import {SelectUbicacion} from '../../../components/ui/SelectUbicacion';
import SimpleDropdown from '../../../components/ui/SelectEstatusInventario';
import {getEstatusInventario} from '../../../../actions/almacen/movimientosInternos/get-Estatus';
import {ProductoBusquedaItem} from '../../../../actions/almacen/inventario/search-productos';

import DatePicker from 'react-native-date-picker';

export const IngresoProductoScreen = () => {
  const {empresas, almacenes, usuid} = useAuthStore();

  // Contexto
  const [empresa, setEmpresa] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [empresaError, setEmpresaError] = useState(false);
  const [almacenError, setAlmacenError] = useState(false);
  const [editable, setEditable] = useState(true);
  const [editableEmpresa, setEditableEmpresa] = useState(true);

  // Remisión
  const [remision, setRemision] = useState('');
  const [remisionValida, setRemisionValida] = useState(false);
  const [verificandoRem, setVerificandoRem] = useState(false);
  const [remisionError, setRemisionError] = useState(false);
  const [remMalid, setRemMalid] = useState<string>('');
  const [remFecdocto, setRemFecdocto] = useState<string>('');

  // Producto
  const [buscarProd, setBuscarProd] = useState('');
  const [prdid, setPrdid] = useState<number | null>(null);
  const [claveProducto, setClaveProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidad, setUnidad] = useState('');
  const [inner, setInner] = useState('');

  // Detalle
  const [moneda, setMoneda] = useState('');
  const [costo, setCosto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [estatus, setEstatusVal] = useState<string | null>(null);
  const [estatusItems, setEstatusItems] = useState<{label: string; value: string}[]>([]);
  const [referencia, setReferencia] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [lote, setLote] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [pedimento, setPedimento] = useState('');
  const [puertoEntrada, setPuertoEntrada] = useState('');
  const [fechaImportacion, setFechaImportacion] = useState('');
  const [comentario, setComentario] = useState('');

  const [openCaducidad, setOpenCaducidad] = useState(false);
  const [openImportacion, setOpenImportacion] = useState(false);

  const [buscarError, setBuscarError] = useState(false);
  const [cantidadError, setCantidadError] = useState(false);
  const [estatusError, setEstatusError] = useState(false);
  const [ubicacionError, setUbicacionError] = useState(false);
  const [guardandoDet, setGuardandoDet] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [resetProdKey, setResetProdKey] = useState(0);
  const [importacionAbierta, setImportacionAbierta] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const buscarProdY = useRef(0);
  const selectProdRef = useRef<SelectProductoHandle>(null);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateISO = (iso: string): string => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return formatDate(d);
    } catch {
      return '';
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getEstatusInventario();
        setEstatusItems(data.map(it => ({label: it.ineid, value: it.ineid})));
      } catch (e) {
        console.warn('Error cargando estatus inventario', e);
      }
    })();
  }, []);

  const handleEmpresaSelect = (value: string | null) => {
    setEmpresa(value || '');
    setEditableEmpresa(value === null);
    if (value) setEmpresaError(false);
  };

  const handleAlmacenSelect = (value: string | null) => {
    setAlmacen(value || '');
    setEditable(value === null);
    if (value) setAlmacenError(false);
  };

  const remisionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const handleRemisionChange = (text: string) => {
    setRemision(text);
    setRemisionValida(false);
    setRemisionError(false);

    // Auto-validación: al dejar de teclear/escanear por 400ms se lanza
    // verificarRemision. Cubre el caso del handheld que solo pega el
    // valor sin mandar Enter.
    if (remisionDebounceRef.current) clearTimeout(remisionDebounceRef.current);
    if (text.trim().length > 0) {
      remisionDebounceRef.current = setTimeout(() => {
        verificarRemision(text);
      }, 400);
    }
  };

  const verificarRemision = async (overrideClave?: string) => {
    const clave = (overrideClave ?? remision).trim();
    if (!clave) {
      setRemisionValida(false);
      return;
    }
    if (!empresa || !almacen) {
      Alert.alert(
        'Selecciona Empresa y Almacén',
        'Debes seleccionar Empresa y Almacén antes de validar la remisión.',
      );
      setRemision('');
      setRemisionValida(false);
      return;
    }
    if (remisionValida) return;

    try {
      setVerificandoRem(true);
      const rem = await getRemisionAlmacen(clave, empresa, almacen);
      if (rem && rem.remid) {
        setRemision(String(rem.remid));
        setRemisionValida(true);
        setRemisionError(false);
        setRemMalid(rem.remmalid != null ? String(rem.remmalid) : '');
        setRemFecdocto(rem.remfecdocto ? formatDateISO(rem.remfecdocto) : '');
        setEditableEmpresa(false);
        setEditable(false);
      } else {
        setRemisionValida(false);
        Alert.alert(
          'Clave no encontrada',
          `La Remisión "${clave}" no existe en el sistema. Verifica e intenta nuevamente.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setRemision('');
                setRemisionError(true);
              },
            },
          ],
        );
      }
    } catch (e) {
      setRemisionValida(false);
      Alert.alert('Error', 'No se pudo verificar la remisión. Intenta nuevamente.');
    } finally {
      setVerificandoRem(false);
    }
  };

  const handleProductoSelect = (p: ProductoBusquedaItem) => {
    setPrdid(p.prdid);
    setClaveProducto(p.prdclave);
    setDescripcion(p.prdnombre || '');
    setUnidad(p.prdualid || '');
    setInner(p.prdinner != null ? String(p.prdinner) : '');
    setMoneda(p.prdmoncosto || 'MXN');
    setCosto(p.prdcosto != null ? String(p.prdcosto) : '');
    setBuscarProd(`${p.prdclave} - ${p.prdnombre}`);
    setBuscarError(false);
  };

  const handleEstatusChange = (v: string | null) => {
    setEstatusVal(v);
    if (v) setEstatusError(false);
  };

  const limpiarProducto = () => {
    setBuscarProd('');
    setPrdid(null);
    setClaveProducto('');
    setDescripcion('');
    setUnidad('');
    setInner('');
    setMoneda('');
    setCosto('');
    setCantidad('');
    setReferencia('');
    setUbicacion('');
    setLote('');
    setFechaCaducidad('');
    setPedimento('');
    setPuertoEntrada('');
    setFechaImportacion('');
    setComentario('');
    setBuscarError(false);
    setCantidadError(false);
    setUbicacionError(false);
    setResetProdKey(k => k + 1);
  };

  const limpiarTodo = () => {
    limpiarProducto();
    setEstatusVal(null);
    setEstatusError(false);
    setEmpresa('');
    setAlmacen('');
    setRemision('');
    setRemisionValida(false);
    setRemisionError(false);
    setEmpresaError(false);
    setAlmacenError(false);
    setRemMalid('');
    setRemFecdocto('');
    setEditableEmpresa(true);
    setEditable(true);
    setResetKey(k => k + 1);
  };

  const guardarDetalle = async () => {
    const faltaEmpresa = !empresa;
    const faltaAlmacen = !almacen;
    const faltaRem = !remisionValida;
    const faltaProd = !prdid || !claveProducto;
    const faltaCant = !cantidad || Number(cantidad) <= 0;
    const faltaEst = !estatus;
    const faltaUbi = !ubicacion.trim();
    setEmpresaError(faltaEmpresa);
    setAlmacenError(faltaAlmacen);
    setRemisionError(faltaRem);
    setBuscarError(faltaProd);
    setCantidadError(faltaCant);
    setEstatusError(faltaEst);
    setUbicacionError(faltaUbi);

    if (faltaEmpresa || faltaAlmacen || faltaRem) {
      Alert.alert(
        'Faltan campos',
        'Empresa, Almacén y Remisión (verificada) son obligatorios.',
      );
      return;
    }
    if (faltaProd || faltaCant || faltaEst || faltaUbi) {
      Alert.alert('Faltan campos', 'Producto, Cantidad, Estatus y Ubicación son obligatorios.');
      return;
    }

    const payload = {
      'idcmbproducto-inputEl': claveProducto,
      prdclave: claveProducto,
      dreid: '',
      racid: '',
      prdid: String(prdid),
      dreprdid: String(prdid),
      prdnombre: descripcion,
      prdualid: unidad,
      prdinner: inner,
      racmonid: moneda,
      prdcosto: costo,
      raccosto: costo,
      drecantidad: cantidad,
      racineid: estatus || '',
      drereferencia: referencia,
      racubiid: ubicacion,
      drelote: lote,
      drefeccaducidad: fechaCaducidad,
      racpedimento: pedimento,
      racptoentrada: puertoEntrada,
      racfecimportacion: fechaImportacion,
      raccoms: comentario,
      dreusuid: String(usuid ?? ''),
      dreempid: String(empresa),
      dreremid: String(remision),
      drealmid: String(almacen),
      dremalid: String(remMalid),
      drefecdocto: remFecdocto,
      idUsuario: String(usuid ?? ''),
    } as any;

    console.log('[IngresoProducto] payload:', JSON.stringify(payload));

    try {
      setGuardandoDet(true);
      const resp = await postDetRemisionProducto(remision, payload);
      const ok = resp?.success === true || String(resp?.success).toLowerCase() === 'true';
      const msg = resp?.message || (ok ? 'Producto agregado.' : 'No se pudo guardar el producto.');
      if (ok) {
        Alert.alert('Éxito', msg, [
          {
            text: 'OK',
            onPress: () => {
              limpiarProducto();
              scrollRef.current?.scrollTo({y: buscarProdY.current, animated: true});
              setTimeout(() => selectProdRef.current?.focus(), 400);
            },
          },
        ]);
      } else {
        Alert.alert('Error', msg);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar el producto.');
    } finally {
      setGuardandoDet(false);
    }
  };

  const productoHabilitado = !!empresa && remisionValida;

  return (
    <MainLayout title="Ingreso Producto" subTitle="Almacén">
      <Layout style={{flex: 1, backgroundColor: '#F8FAFC'}}>
        <ScrollView
          ref={scrollRef}
          style={{flex: 1}}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.container}
          nestedScrollEnabled>
          {/* Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderIcon}>
              <MyIcon name="cube-outline" size={22} white />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.pageTitle}>Ingreso de producto</Text>
              <Text style={styles.pageSubtitle}>
                Agrega productos a una remisión existente
              </Text>
            </View>
          </View>

          {/* Contexto */}
          <View style={[styles.card, {zIndex: 5000}]}>
            <View style={styles.sectionHeader}>
              <MyIcon name="briefcase-outline" size={16} />
              <Text style={styles.sectionTitle}>Contexto</Text>
              {remisionValida && (
                <View style={styles.lockedTag}>
                  <MyIcon name="lock-outline" size={11} />
                  <Text style={styles.lockedTagText}>Bloqueado</Text>
                </View>
              )}
            </View>

            <View style={[styles.fieldGroup, {zIndex: 4000}]}>
              <Text style={styles.fieldLabel}>Empresa *</Text>
              <SelectEmpresa
                key={`empresa-${resetKey}`}
                empresas={empresas}
                onSelect={handleEmpresaSelect}
                editableEmpresa={editableEmpresa}
                hasError={empresaError}
              />
            </View>

            <View style={[styles.fieldGroup, {zIndex: 3000}]}>
              <Text style={styles.fieldLabel}>Almacén *</Text>
              <SelectAlmacen
                key={`almacen-${resetKey}`}
                almacenes={almacenes}
                onSelect={handleAlmacenSelect}
                editable={editable}
                hasError={almacenError}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Remisión *</Text>
              <View style={styles.referenciaWrap}>
                <TextInput
                  style={[
                    styles.formInput,
                    styles.referenciaInput,
                    remisionError && styles.inputError,
                    remisionValida && styles.inputValid,
                    remisionValida && styles.formInputDisabled,
                  ]}
                  placeholder="Escribe la clave o presiona Enter"
                  placeholderTextColor={remisionError ? '#EF4444' : '#94A3B8'}
                  value={remision}
                  onChangeText={handleRemisionChange}
                  onBlur={verificarRemision}
                  onSubmitEditing={verificarRemision}
                  editable={!remisionValida && !verificandoRem}
                  returnKeyType="search"
                  blurOnSubmit={false}
                />
                {verificandoRem ? (
                  <ActivityIndicator
                    size="small"
                    color="#2563EB"
                    style={styles.referenciaIndicator}
                  />
                ) : remisionValida ? (
                  <View style={styles.referenciaBadge}>
                    <Text style={styles.referenciaBadgeText}>✓</Text>
                  </View>
                ) : null}
              </View>
              {!remisionValida && (
                <Text style={styles.helpText}>
                  Selecciona empresa y almacén, luego escribe la remisión.
                </Text>
              )}
            </View>
          </View>

          {/* Buscar Producto */}
          <View
            onLayout={e => {
              buscarProdY.current = e.nativeEvent.layout.y;
            }}
            style={[styles.card, {zIndex: 2500, opacity: productoHabilitado ? 1 : 0.6}]}>
            <View style={styles.sectionHeader}>
              <MyIcon name="search-outline" size={16} />
              <Text style={styles.sectionTitle}>Buscar producto</Text>
            </View>
            <SelectProducto
              ref={selectProdRef}
              key={`prod-${resetProdKey}`}
              empresa={empresa}
              value={buscarProd}
              onChangeText={setBuscarProd}
              onSelect={handleProductoSelect}
              placeholder="Escribe clave o descripción (mín. 3)"
              inputStyle="form"
              minChars={3}
              hasError={buscarError}
              editable={productoHabilitado}
            />

            {claveProducto ? (
              <View style={styles.productSummary}>
                <View style={styles.productSummaryHeader}>
                  <View style={styles.productSummaryIcon}>
                    <MyIcon name="cube-outline" size={16} white />
                  </View>
                  <View style={{flex: 1, minWidth: 0}}>
                    <Text style={styles.productSummaryClave} numberOfLines={1}>
                      {claveProducto}
                    </Text>
                    <Text style={styles.productSummaryNombre} numberOfLines={2}>
                      {descripcion}
                    </Text>
                  </View>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaRow}>
                  <View style={styles.metaStat}>
                    <Text style={styles.metaStatLabel}>Inner</Text>
                    <Text style={styles.metaStatValue}>{inner || '—'}</Text>
                  </View>
                  <View style={styles.metaStatDivider} />
                  <View style={styles.metaStat}>
                    <Text style={styles.metaStatLabel}>Unidad</Text>
                    <Text style={styles.metaStatValue}>{unidad || '—'}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyProduct}>
                <MyIcon name="cube-outline" size={26} />
                <Text style={styles.emptyProductText}>
                  Selecciona un producto para continuar
                </Text>
              </View>
            )}
          </View>

          {/* Detalle */}
          <View style={[styles.card, {zIndex: 2000}]}>
            <View style={styles.sectionHeader}>
              <MyIcon name="file-text-outline" size={16} />
              <Text style={styles.sectionTitle}>Detalle</Text>
            </View>

            <View style={[styles.fieldGroup, {zIndex: 1900}]}>
              <Text style={styles.fieldLabel}>Estatus *</Text>
              <SimpleDropdown
                key={`estatus-${resetKey}`}
                rawItems={estatusItems}
                value={estatus}
                initialValue={estatus}
                onChangeValue={handleEstatusChange}
                placeholder="Selecciona"
                hasError={estatusError}
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, {flex: 1, marginRight: 8}]}>
                <Text style={styles.fieldLabel}>Cantidad *</Text>
                <TextInput
                  style={[styles.formInput, cantidadError && styles.inputError]}
                  placeholder="0"
                  placeholderTextColor={cantidadError ? '#EF4444' : '#94A3B8'}
                  value={cantidad}
                  onChangeText={t => {
                    setCantidad(t);
                    if (t) setCantidadError(false);
                  }}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.fieldGroup, {flex: 1, zIndex: 1500}]}>
                <Text style={styles.fieldLabel}>Ubicación *</Text>
                <SelectUbicacion
                  key={`ubi-${resetProdKey}`}
                  almacen={almacen}
                  value={ubicacion}
                  onChangeText={t => {
                    setUbicacion(t);
                    if (t) setUbicacionError(false);
                  }}
                  onSelect={ubiid => {
                    setUbicacion(ubiid);
                    setUbicacionError(false);
                  }}
                  placeholder="Buscar ubicación"
                  inputStyle="form"
                  minChars={3}
                  hasError={ubicacionError}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Referencia</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Referencia"
                placeholderTextColor="#94A3B8"
                value={referencia}
                onChangeText={setReferencia}
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, {flex: 1, marginRight: 8}]}>
                <Text style={styles.fieldLabel}>Lote</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Lote"
                  placeholderTextColor="#94A3B8"
                  value={lote}
                  onChangeText={setLote}
                />
              </View>
              <View style={[styles.fieldGroup, {flex: 1}]}>
                <Text style={styles.fieldLabel}>Fecha de caducidad</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.formInput}
                  onPress={() => setOpenCaducidad(true)}>
                  <Text
                    style={[
                      styles.dateText,
                      !fechaCaducidad && styles.placeholderText,
                    ]}>
                    {fechaCaducidad || 'dd/mm/aaaa'}
                  </Text>
                </TouchableOpacity>
                <DatePicker
                  modal
                  open={openCaducidad}
                  date={new Date()}
                  mode="date"
                  locale="es"
                  onConfirm={d => {
                    setOpenCaducidad(false);
                    setFechaCaducidad(formatDate(d));
                  }}
                  onCancel={() => setOpenCaducidad(false)}
                />
              </View>
            </View>
          </View>

          {/* Importación (colapsable) */}
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setImportacionAbierta(v => !v)}
              style={[
                styles.sectionHeader,
                {marginBottom: importacionAbierta ? 12 : 0},
              ]}>
              <MyIcon name="globe-outline" size={16} />
              <Text style={styles.sectionTitle}>Importación</Text>
              <MyIcon
                name={
                  importacionAbierta
                    ? 'chevron-up-outline'
                    : 'chevron-down-outline'
                }
                size={18}
              />
            </TouchableOpacity>

            {importacionAbierta && (
            <>
            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, {flex: 1, marginRight: 8}]}>
                <Text style={styles.fieldLabel}>Pedimento</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Pedimento"
                  placeholderTextColor="#94A3B8"
                  value={pedimento}
                  onChangeText={setPedimento}
                />
              </View>
              <View style={[styles.fieldGroup, {flex: 1}]}>
                <Text style={styles.fieldLabel}>Puerto de entrada</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Puerto"
                  placeholderTextColor="#94A3B8"
                  value={puertoEntrada}
                  onChangeText={setPuertoEntrada}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Fecha de importación</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.formInput}
                onPress={() => setOpenImportacion(true)}>
                <Text
                  style={[
                    styles.dateText,
                    !fechaImportacion && styles.placeholderText,
                  ]}>
                  {fechaImportacion || 'dd/mm/aaaa'}
                </Text>
              </TouchableOpacity>
              <DatePicker
                modal
                open={openImportacion}
                date={new Date()}
                mode="date"
                locale="es"
                onConfirm={d => {
                  setOpenImportacion(false);
                  setFechaImportacion(formatDate(d));
                }}
                onCancel={() => setOpenImportacion(false)}
              />
            </View>

            </>
            )}
          </View>

          {/* Comentario (fuera de Importación) */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MyIcon name="message-square-outline" size={16} />
              <Text style={styles.sectionTitle}>Comentario</Text>
            </View>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Notas adicionales…"
              placeholderTextColor="#94A3B8"
              value={comentario}
              onChangeText={setComentario}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Acciones */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.saveBtn, guardandoDet && styles.btnDisabled]}
              onPress={guardarDetalle}
              disabled={guardandoDet}>
              <MyIcon name="save-outline" size={18} white />
              <Text style={styles.saveBtnText}>
                {guardandoDet ? 'Guardando…' : 'Guardar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.clearBtn, guardandoDet && styles.btnDisabled]}
              onPress={limpiarTodo}
              disabled={guardandoDet}>
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
    paddingBottom: 40,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.1,
    flex: 1,
  },
  collapseHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginRight: 4,
  },
  lockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  lockedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  rowFields: {
    flexDirection: 'row',
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
    marginTop: 6,
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
    justifyContent: 'center',
  },
  formInputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  textArea: {
    minHeight: 90,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
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
  productSummary: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  productSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productSummaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productSummaryClave: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  productSummaryNombre: {
    fontSize: 12,
    color: '#0F172A',
    marginTop: 2,
  },
  metaDivider: {
    height: 1,
    backgroundColor: '#BFDBFE',
    marginVertical: 10,
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
  },
  metaStat: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaStatDivider: {
    width: 1,
    backgroundColor: '#DBEAFE',
  },
  metaStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  emptyProduct: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  emptyProductText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
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
    shadowOffset: {width: 0, height: 4},
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
