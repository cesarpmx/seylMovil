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
import {
  DetalleSurtidoItem,
  getDetalleSurtidoGrid,
} from '../../../../actions/almacen/surtido/get-detalleSurtidoGrid';
import {getDetalleSurtido} from '../../../../actions/almacen/surtido/get-detalleSurtido';
import {postSurtidoPl} from '../../../../actions/almacen/surtido/post-surtidoPl';
import {postSurtidoAplicar} from '../../../../actions/almacen/surtido/post-surtidoAplicar';
import ModalCodeScanner from '../../../components/ui/ModalCodeScanner';
import {SelectUbicacion, SelectUbicacionHandle} from '../../../components/ui/SelectUbicacion';

import DatePicker from 'react-native-date-picker';

// Alias local para no cambiar toda la pantalla
type DetSurtidoItem = DetalleSurtidoItem;

export const SurtidoPlScreen = () => {
  const {empresas, almacenes, usuid} = useAuthStore();
  const [enviandoSurtido, setEnviandoSurtido] = useState(false);
  const [cambiandoPartida, setCambiandoPartida] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'ubicacion' | 'clave' | null>(null);

  // Contexto
  const [empresa, setEmpresa] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [empresaError, setEmpresaError] = useState(false);
  const [almacenError, setAlmacenError] = useState(false);
  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [editableAlmacen, setEditableAlmacen] = useState(true);

  // Packing List
  const [pl, setPl] = useState('');
  const [plError, setPlError] = useState(false);
  const [plConfirmado, setPlConfirmado] = useState(false);
  const [cargandoPL, setCargandoPL] = useState(false);

  // Arreglo de detalle + índice
  const [items, setItems] = useState<DetSurtidoItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [preid, setPreid] = useState<number | null>(null);

  // Producto actual (auto-fill desde el item)
  const [claveProducto, setClaveProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidad, setUnidad] = useState('');
  const [inner, setInner] = useState('');

  // Campos editables del surtido
  const [ubicacion, setUbicacion] = useState(''); // origen (autofill del registro)
  const [ubicacionDestino, setUbicacionDestino] = useState(''); // manual, donde se coloca
  const [claveConfirm, setClaveConfirm] = useState(''); // manual/escaneada, para validar
  const ubicacionDestinoRef = useRef<SelectUbicacionHandle>(null);
  const claveConfirmRef = useRef<TextInput>(null);
  const plInputRef = useRef<TextInput>(null);
  const [cajasConfirm, setCajasConfirm] = useState('0');
  const [sueltasConfirm, setSueltasConfirm] = useState('0');
  const [lote, setLote] = useState('');
  const [pedimento, setPedimento] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [unidadesPedido, setUnidadesPedido] = useState('');
  const [unidadesSurtidoAcum, setUnidadesSurtidoAcum] = useState('');
  const [cantidadASurtir, setCantidadASurtir] = useState('');
  const [openCaducidad, setOpenCaducidad] = useState(false);

  const [resetKey, setResetKey] = useState(0);

  const formatDate = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
  };

  const formatDateISO = (iso: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : formatDate(d);
  };

  const cargarItemEnFormulario = (it: DetSurtidoItem) => {
    console.log('[SurtidoPL] ▶ producto cargado:', JSON.stringify(it, null, 2));
    setClaveProducto(it.prdclave);
    setDescripcion(it.prdnombre);
    setUnidad(it.prdualid);
    setInner(String(it.prdinner));
    setUbicacion(it.racubiid || '');
    setLote(it.raclote || '');
    setPedimento(it.racpedimento || '');
    setFechaCaducidad(formatDateISO(it.racfeccaducidad));
    setUnidadesPedido(String(it.dprcantidad));
    setUnidadesSurtidoAcum(String(it.dprsurtido ?? 0));
    setUbicacionDestino('');
    setClaveConfirm('');
    setCajasConfirm('0');
    setSueltasConfirm('0');
    setCantidadASurtir('');
  };

  const pendienteBase = (() => {
    const ped = Number(unidadesPedido) || 0;
    const sur = Number(unidadesSurtidoAcum) || 0;
    return Math.max(0, ped - sur);
  })();

  const pendiente = (() => {
    const inn = Number(inner) || 0;
    const cj = Number(cajasConfirm) || 0;
    const sl = Number(sueltasConfirm) || 0;
    return Math.max(0, pendienteBase - cj * inn - sl);
  })();

  useEffect(() => {
    const inn = Number(inner) || 0;
    const cj = Number(cajasConfirm) || 0;
    const sl = Number(sueltasConfirm) || 0;
    setCantidadASurtir(String(cj * inn + sl));
  }, [cajasConfirm, sueltasConfirm, inner]);

  const claveMatch =
    !!claveConfirm.trim() &&
    claveConfirm.trim().toUpperCase() === (claveProducto || '').trim().toUpperCase();
  const claveMismatch =
    !!claveConfirm.trim() && !claveMatch;

  const ubicacionMatch =
    !!ubicacionDestino.trim() &&
    ubicacionDestino.trim().toUpperCase() === (ubicacion || '').trim().toUpperCase();
  const ubicacionMismatch =
    !!ubicacionDestino.trim() && !ubicacionMatch;

  const cajas = (() => {
    const ped = Number(unidadesPedido) || 0;
    const inn = Number(inner) || 0;
    if (inn <= 0) return String(ped);
    return String(Math.floor(ped / inn));
  })();

  const cajasMax = (() => {
    const inn = Number(inner) || 0;
    if (inn <= 0) return pendienteBase;
    return Math.floor(pendienteBase / inn);
  })();
  const sueltas = (() => {
    const ped = Number(unidadesPedido) || 0;
    const inn = Number(inner) || 0;
    if (inn <= 0) return '0';
    return String(ped % inn);
  })();

  const sueltasMax = (() => {
    const inn = Number(inner) || 0;
    const cj = Number(cajasConfirm) || 0;
    const remaining = pendienteBase - cj * inn;
    if (inn <= 0) return Math.max(0, remaining);
    return Math.max(0, remaining);
  })();

  const handleCajasChange = (t: string) => {
    const clean = t.replace(/[^0-9]/g, '');
    if (clean === '') {
      setCajasConfirm('0');
      return;
    }
    const n = Number(clean);
    const inn = Number(inner) || 0;
    const sl = Number(sueltasConfirm) || 0;
    const totalPropuesto = n * inn + sl;
    if (n > cajasMax || totalPropuesto > pendienteBase) {
      Alert.alert(
        'Cajas inválidas',
        `No queda espacio para esa cantidad. Por surtir: ${pendienteBase}.`,
      );
      setCajasConfirm('0');
      return;
    }
    setCajasConfirm(String(n));
  };

  const handleSueltasChange = (t: string) => {
    const clean = t.replace(/[^0-9]/g, '');
    if (clean === '') {
      setSueltasConfirm('0');
      return;
    }
    const n = Number(clean);
    const inn = Number(inner) || 0;
    const cj = Number(cajasConfirm) || 0;
    const totalPropuesto = cj * inn + n;
    if (n > sueltasMax || totalPropuesto > pendienteBase) {
      Alert.alert(
        'Unidades inválidas',
        `No queda espacio para esa cantidad. Por surtir: ${pendienteBase}.`,
      );
      setSueltasConfirm('0');
      return;
    }
    setSueltasConfirm(String(n));
  };

  const handleEmpresaSelect = (v: string | null) => {
    setEmpresa(v || '');
    setEditableEmpresa(v === null);
    if (v) setEmpresaError(false);
  };

  const handleAlmacenSelect = (v: string | null) => {
    setAlmacen(v || '');
    setEditableAlmacen(v === null);
    if (v) setAlmacenError(false);
  };

  const plDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlePlChange = (t: string) => {
    setPl(t);
    setPlConfirmado(false);
    setPlError(false);

    // Auto-validación: cubre el caso del handheld que solo pega el
    // valor sin mandar Enter. Después de 400ms sin cambios, dispara
    // confirmarPL con el texto directo.
    if (plDebounceRef.current) clearTimeout(plDebounceRef.current);
    if (t.trim().length > 0) {
      plDebounceRef.current = setTimeout(() => {
        confirmarPL(t);
      }, 400);
    }
  };

  const confirmarPL = async (overrideClave?: string) => {
    const clave = (overrideClave ?? pl).trim();
    console.log('[SurtidoPL] ▶ PL capturada en input:', clave);
    if (!clave) return;
    if (!empresa || !almacen) {
      Alert.alert(
        'Faltan datos',
        'Selecciona Empresa y Almacén antes de escribir el Packing List.',
      );
      setPl('');
      return;
    }
    if (plConfirmado) return;

    try {
      setCargandoPL(true);

      // Un solo llamado: /almacen/detpackinglist/?ordensurtido=&empresa=&almacen=
      // Este endpoint valida que la PL exista para esa empresa/almacén y
      // devuelve las partidas por surtir. Si viene vacío, o la PL no existe
      // para ese contexto o ya está totalmente surtida (esa distinción la
      // decides tú a nivel backend según lo que devuelva).
      const partidas = await getDetalleSurtidoGrid(clave, empresa, almacen);
      console.log(
        '[SurtidoPL] ▶ partidas devueltas:',
        partidas ? partidas.length : 0,
      );

      // CASO A: no hay items → puede ser que la PL no exista para ese
      // contexto O que exista pero su estatus no permita surtir
      // (surtida/cancelada). Consultamos el header solo en este caso
      // para dar un mensaje claro con el estatus real.
      if (!partidas || partidas.length === 0) {
        const header = await getDetalleSurtido(clave);
        console.log('[SurtidoPL] ▶ header (fallback):', JSON.stringify(header));

        if (!header || !header.preid) {
          Alert.alert(
            'PL no encontrado',
            `No se encontró la orden "${clave}" para la empresa/almacén seleccionados. Verifica los datos.`,
            [{text: 'OK', onPress: () => setPl('')}],
          );
          return;
        }

        Alert.alert(
          'Orden no disponible',
          `La orden #${header.preid} no puede ser surtida porque se encuentra en estado "${
            header.esunombre || header.preestatus || '—'
          }".`,
          [{text: 'OK', onPress: () => setPl('')}],
        );
        return;
      }

      // CASO B: hay partidas por surtir → flujo normal.
      // El preid viene en cada partida (dprpreid), así que lo tomamos de ahí.
      const preidReal = Number(partidas[0].dprpreid) || Number(clave);
      setItems(partidas);
      setPreid(preidReal);
      const primerPend = partidas.findIndex(
        p => (Number(p.dprcantidad) || 0) - (Number(p.dprsurtido) || 0) > 0,
      );
      const startIdx = primerPend >= 0 ? primerPend : 0;
      setIdx(startIdx);
      cargarItemEnFormulario(partidas[startIdx]);
      setPl(String(preidReal));
      setPlConfirmado(true);
      setEditableEmpresa(false);
      setEditableAlmacen(false);
    } catch (e: any) {
      console.error('[SurtidoPL] error confirmarPL:', e?.message);
      Alert.alert('Error', 'No se pudo consultar el Packing List.');
    } finally {
      setCargandoPL(false);
    }
  };

  const handleSiguiente = () => {
    if (idx + 1 >= items.length) return;
    setCambiandoPartida(true);
    setTimeout(() => {
      const next = idx + 1;
      setIdx(next);
      cargarItemEnFormulario(items[next]);
      setCambiandoPartida(false);
    }, 350);
  };

  const handleEnviar = async () => {
    const partida = items[idx];
    if (!partida) {
      Alert.alert('Sin producto', 'No hay producto cargado para surtir.');
      return;
    }

    const cantidadNum = Number(cantidadASurtir);
    if (!cantidadASurtir || isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert(
        'Cantidad inválida',
        'Debes capturar al menos 1 caja o suelta para surtir.',
      );
      return;
    }

    const origen = (ubicacion || '').trim().toUpperCase();
    const destino = (ubicacionDestino || '').trim().toUpperCase();
    if (!destino) {
      Alert.alert(
        'Ubicación destino requerida',
        'Debes capturar o escanear la ubicación destino antes de guardar.',
      );
      return;
    }
    if (origen && destino !== origen) {
      Alert.alert(
        'Ubicación no coincide',
        `La ubicación destino "${destino}" no coincide con la ubicación origen "${origen}". El producto debe colocarse en la misma ubicación.`,
      );
      return;
    }

    const claveOrigen = (claveProducto || '').trim().toUpperCase();
    const claveDestino = (claveConfirm || '').trim().toUpperCase();
    if (!claveDestino) {
      Alert.alert(
        'Clave requerida',
        'Debes capturar o escanear la clave del producto antes de guardar.',
      );
      return;
    }
    if (claveOrigen && claveDestino !== claveOrigen) {
      Alert.alert(
        'Clave no coincide',
        `La clave capturada "${claveDestino}" no coincide con la del producto "${claveOrigen}".`,
      );
      return;
    }

    const payload = {
      dprid: partida.dprid,
      cantidad: cantidadNum,
      dprempid: empresa,
      dpralmid: almacen,
      idUsuario: String(usuid ?? ''),
    };

    // Impresión clara del JSON que se manda al backend (para debug).
    console.log('[SurtidoPL] ▶ POST payload:', JSON.stringify(payload));

    try {
      setEnviandoSurtido(true);
      const resp = await postSurtidoPl(payload);
      const ok =
        resp?.success === true ||
        String(resp?.success).toLowerCase() === 'true';
      const msg = resp?.message || (ok ? 'Surtido registrado.' : 'No se pudo surtir.');
      if (ok) {
        // Guardo el dprid que estaba surtiendo antes de refrescar
        const dpridActual = partida.dprid;

        // Refresco desde el server (el endpoint filtra las ya completadas)
        let partidasActualizadas = items;
        let refresco = false;
        if (preid != null) {
          try {
            const fresh = await getDetalleSurtidoGrid(preid, empresa, almacen);
            partidasActualizadas = fresh || [];
            setItems(partidasActualizadas);
            refresco = true;
          } catch (err) {
            console.warn('[SurtidoPL] no se pudo refrescar partidas', err);
          }
        }

        // Busco la partida actual por dprid en la lista fresca
        const nuevoIdx = partidasActualizadas.findIndex(p => p.dprid === dpridActual);

        if (nuevoIdx >= 0) {
          // Sigue con pendiente → recargo formulario con datos frescos
          setIdx(nuevoIdx);
          cargarItemEnFormulario(partidasActualizadas[nuevoIdx]);
          Alert.alert('Éxito', msg);
        } else if (partidasActualizadas.length > 0) {
          // Partida completada (ya no está en la lista) → paso a la primera pendiente
          const siguiente = partidasActualizadas[0];
          setIdx(0);
          cargarItemEnFormulario(siguiente);
          Alert.alert(
            'Producto completado',
            `${msg}\n\nPasando al siguiente producto.`,
          );
        } else {
          // Ya no quedan partidas → limpio PL para poder ingresar otro.
          // El focus al input se pone tras cerrar el alert para que el
          // handheld pueda escanear otra PL sin tocar la pantalla.
          limpiarPlYPartidas();
          Alert.alert(
            '¡Terminado!',
            `${msg}\n\nTodos los productos están surtidos.`,
            [
              {
                text: 'OK',
                onPress: () =>
                  setTimeout(() => plInputRef.current?.focus(), 100),
              },
            ],
          );
        }
      } else {
        Alert.alert('Error', msg);
      }
    } catch (e: any) {
      console.error('[SurtidoPL] error POST:', e?.message);
      Alert.alert('Error', e?.message || 'No se pudo enviar el surtido.');
    } finally {
      setEnviandoSurtido(false);
    }
  };

  const abrirScanner = (target: 'ubicacion' | 'clave') => {
    setScannerTarget(target);
    setScannerVisible(true);
  };

  const handleCodeScanned = (code: string) => {
    setScannerVisible(false);
    const partida = items[idx];
    if (!partida || !scannerTarget) return;
    const escaneado = (code || '').trim();

    if (scannerTarget === 'ubicacion') {
      const esperado = String(partida.racubiid ?? '').trim().toUpperCase();
      if (esperado && escaneado.toUpperCase() === esperado) {
        setUbicacionDestino(escaneado.toUpperCase());
        Alert.alert('Ubicación válida', `Coincide con el registro (${esperado}).`);
      } else {
        Alert.alert(
          'Ubicación no coincide',
          `Se esperaba "${esperado}" y se escaneó "${escaneado}".`,
        );
      }
    } else if (scannerTarget === 'clave') {
      const esperado = String(partida.prdclave ?? '').trim().toUpperCase();
      if (esperado && escaneado.toUpperCase() === esperado) {
        setClaveConfirm(escaneado.toUpperCase());
        Alert.alert('Clave válida', `Coincide con el producto (${esperado}).`);
      } else {
        Alert.alert(
          'Clave no coincide',
          `Se esperaba "${esperado}" y se escaneó "${escaneado}".`,
        );
      }
    }
    setScannerTarget(null);
  };

  const limpiarPlYPartidas = () => {
    setPl('');
    setPlConfirmado(false);
    setPlError(false);
    setItems([]);
    setIdx(0);
    setPreid(null);
    setClaveProducto('');
    setDescripcion('');
    setUnidad('');
    setInner('');
    setUbicacion('');
    setUbicacionDestino('');
    setClaveConfirm('');
    setCajasConfirm('0');
    setSueltasConfirm('0');
    setLote('');
    setPedimento('');
    setFechaCaducidad('');
    setUnidadesPedido('');
    setUnidadesSurtidoAcum('');
    setCantidadASurtir('');

    // Dejar el focus en el input de PL para leer con el handheld sin
    // tener que tocar la pantalla.
    setTimeout(() => plInputRef.current?.focus(), 100);
  };

  const limpiarTodo = () => {
    const hayPl = !!pl || plConfirmado || items.length > 0;
    if (hayPl) {
      // Solo limpia PL y sus datos, conserva empresa/almacén para permitir otro PL
      limpiarPlYPartidas();
      return;
    }
    // Si no hay PL, ahora sí limpia empresa/almacén también
    setEmpresa('');
    setAlmacen('');
    setEmpresaError(false);
    setAlmacenError(false);
    setEditableEmpresa(true);
    setEditableAlmacen(true);
    setResetKey(k => k + 1);
  };

  const hayMas = idx + 1 < items.length;
  const puedeEnviar = plConfirmado && items.length > 0;

  // Orden lista para APLICAR = PL confirmado, tenemos preid, y ya no
  // quedan productos pendientes (el endpoint devolvió arreglo vacío).
  // En ese momento el estado real de la orden en Oracle es "En Proceso"
  // con todos los productos surtidos, esperando la aplicación final.
  const enProceso = plConfirmado && preid != null && items.length === 0;

  const [aplicandoOrden, setAplicandoOrden] = useState(false);

  const handleAplicarOrden = () => {
    if (!enProceso || preid == null) return;
    Alert.alert(
      'Aplicar orden',
      `Se aplicará la orden #${preid} con los productos surtidos hasta ahora.\n\nUna vez aplicada, ya no podrás modificarla. ¿Continuar?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Aplicar',
          style: 'destructive',
          onPress: async () => {
            try {
              setAplicandoOrden(true);
              const resp = await postSurtidoAplicar({
                preid,
                idUsuario: String(usuid ?? ''),
              });
              const ok =
                resp?.success === true ||
                String(resp?.success).toLowerCase() === 'true';
              const msg =
                resp?.message ||
                (ok ? 'Orden aplicada.' : 'No se pudo aplicar la orden.');
              if (ok) {
                Alert.alert('Orden aplicada', msg);
                limpiarPlYPartidas();
              } else {
                Alert.alert('No se pudo aplicar', msg);
              }
            } catch (e: any) {
              Alert.alert(
                'Error',
                e?.message || 'No se pudo aplicar la orden.',
              );
            } finally {
              setAplicandoOrden(false);
            }
          },
        },
      ],
    );
  };

  return (
    <MainLayout title="Surtido por PL" subTitle="Almacén">
      <Layout style={{flex: 1, backgroundColor: '#F8FAFC'}}>
        <ScrollView
          style={{flex: 1}}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.container}
          nestedScrollEnabled>
          {/* Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderIcon}>
              <MyIcon name="checkmark-square-2-outline" size={22} white />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.pageTitle}>Surtido por PL</Text>
              <Text style={styles.pageSubtitle}>
                Surte cada producto del Packing List
              </Text>
            </View>
            {plConfirmado && items.length > 0 && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {idx + 1}/{items.length}
                </Text>
              </View>
            )}
          </View>

          {/* Contexto */}
          <View style={[styles.card, {zIndex: 5000}]}>
            <View style={styles.sectionHeader}>
              <MyIcon name="briefcase-outline" size={16} />
              <Text style={styles.sectionTitle}>Contexto</Text>
              {plConfirmado && (
                <View style={styles.lockedTag}>
                  <MyIcon name="lock-outline" size={11} />
                  <Text style={styles.lockedTagText}>Bloqueado</Text>
                </View>
              )}
            </View>

            <View style={[styles.fieldGroup, {zIndex: 4000}]}>
              <Text style={styles.fieldLabel}>Empresa *</Text>
              <SelectEmpresa
                key={`emp-${resetKey}`}
                empresas={empresas}
                onSelect={handleEmpresaSelect}
                editableEmpresa={editableEmpresa}
                hasError={empresaError}
              />
            </View>

            <View style={[styles.fieldGroup, {zIndex: 3000}]}>
              <Text style={styles.fieldLabel}>Almacén *</Text>
              <SelectAlmacen
                key={`alm-${resetKey}`}
                almacenes={almacenes}
                onSelect={handleAlmacenSelect}
                editable={editableAlmacen}
                hasError={almacenError}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Packing List *</Text>
              <View style={styles.referenciaWrap}>
                <TextInput
                  ref={plInputRef}
                  style={[
                    styles.formInput,
                    styles.referenciaInput,
                    plError && styles.inputError,
                    plConfirmado && styles.inputValid,
                  ]}
                  placeholder="Escribe la clave o presiona Enter"
                  placeholderTextColor={plError ? '#EF4444' : '#94A3B8'}
                  value={pl}
                  onChangeText={handlePlChange}
                  onBlur={() => confirmarPL()}
                  onSubmitEditing={e =>
                    confirmarPL(e?.nativeEvent?.text ?? pl)
                  }
                  editable={!cargandoPL}
                  returnKeyType="search"
                  blurOnSubmit={false}
                />
                {cargandoPL ? (
                  <ActivityIndicator
                    size="small"
                    color="#2563EB"
                    style={styles.referenciaIndicator}
                  />
                ) : plConfirmado ? (
                  <View style={styles.referenciaBadge}>
                    <Text style={styles.referenciaBadgeText}>✓</Text>
                  </View>
                ) : null}
              </View>
              {!plConfirmado && (
                <Text style={styles.helpText}>
                  Selecciona empresa/almacén y escribe el PL para cargar los productos.
                </Text>
              )}
            </View>
          </View>

          {/* Producto (auto-fill compacto) */}
          {plConfirmado && items.length > 0 && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <MyIcon name="cube-outline" size={16} />
                <Text style={styles.sectionTitle}>Producto</Text>
                <Text style={styles.itemCounter}>
                  {idx + 1}/{items.length}
                </Text>
              </View>

              <View style={styles.productSummary}>
                <View style={styles.productSummaryHeader}>
                  <View style={styles.productSummaryIcon}>
                    <MyIcon name="cube-outline" size={16} white />
                  </View>
                  <View style={{flex: 1, minWidth: 0}}>
                    <Text style={styles.productSummaryNombre} numberOfLines={3}>
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
                <View style={styles.metaDivider} />
                <View style={styles.metaRow}>
                  <View style={styles.metaStat}>
                    <Text style={styles.metaStatLabel}>Lote</Text>
                    <Text style={styles.metaStatValue} numberOfLines={1}>
                      {lote || '—'}
                    </Text>
                  </View>
                  <View style={styles.metaStatDivider} />
                  <View style={styles.metaStat}>
                    <Text style={styles.metaStatLabel}>Pedimento</Text>
                    <Text style={styles.metaStatValue} numberOfLines={1}>
                      {pedimento || '—'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Ubicación origen (autofill) + Confirmar ubicación */}
              <View style={[styles.fieldGroup, {marginTop: 12}]}>
                <Text style={styles.fieldLabel}>Ubicación</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputDisabled]}
                  value={ubicacion}
                  editable={false}
                />
              </View>
              <View style={[styles.fieldGroup, {zIndex: 100}]}>
                <Text style={styles.fieldLabel}>Confirmar ubicación</Text>
                <View style={styles.ubiRow}>
                  <View style={{flex: 1, minWidth: 0}}>
                    <SelectUbicacion
                      ref={ubicacionDestinoRef}
                      almacen={almacen}
                      value={ubicacionDestino}
                      onChangeText={setUbicacionDestino}
                      onSelect={ubiid => {
                        setUbicacionDestino(ubiid);
                        const esperado = (ubicacion || '').trim().toUpperCase();
                        if (ubiid.trim().toUpperCase() === esperado) {
                          setTimeout(() => claveConfirmRef.current?.focus(), 100);
                        }
                      }}
                      onSubmitEditing={text => {
                        const val = (text ?? ubicacionDestino).trim();
                        const esperado = (ubicacion || '').trim().toUpperCase();
                        if (!val) return;
                        if (val.toUpperCase() === esperado) {
                          setUbicacionDestino(val);
                          setTimeout(() => claveConfirmRef.current?.focus(), 100);
                        } else {
                          setUbicacionDestino('');
                          Alert.alert(
                            'Ubicación no coincide',
                            `Se esperaba "${esperado || '—'}" y se ingresó "${val}".`,
                            [
                              {
                                text: 'OK',
                                onPress: () =>
                                  setTimeout(
                                    () => ubicacionDestinoRef.current?.focus(),
                                    100,
                                  ),
                              },
                            ],
                          );
                        }
                      }}
                      placeholder="Buscar ubicación"
                      inputStyle="form"
                      minChars={3}
                      hasValid={ubicacionMatch}
                      hasError={ubicacionMismatch}
                    />
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.photoBtn}
                    onPress={() => abrirScanner('ubicacion')}>
                    <MyIcon name="camera-outline" size={18} white />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Clave producto (autofill) + Confirmar clave */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Clave producto</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputDisabled]}
                  value={claveProducto}
                  editable={false}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Confirmar clave</Text>
                <View style={styles.ubiRow}>
                  <TextInput
                    ref={claveConfirmRef}
                    style={[
                      styles.formInput,
                      {flex: 1, minWidth: 0},
                      claveMatch && styles.inputValid,
                      claveMismatch && styles.inputError,
                    ]}
                    placeholder="Escribe o escanea"
                    placeholderTextColor="#94A3B8"
                    value={claveConfirm}
                    onChangeText={setClaveConfirm}
                    onSubmitEditing={e => {
                      const val = (e?.nativeEvent?.text ?? claveConfirm).trim();
                      const esperado = (claveProducto || '').trim().toUpperCase();
                      if (!val) return;
                      if (val.toUpperCase() === esperado) {
                        setClaveConfirm(val);
                      } else {
                        setClaveConfirm('');
                        Alert.alert(
                          'Clave no coincide',
                          `Se esperaba "${esperado || '—'}" y se ingresó "${val}".`,
                          [
                            {
                              text: 'OK',
                              onPress: () =>
                                setTimeout(
                                  () => claveConfirmRef.current?.focus(),
                                  100,
                                ),
                            },
                          ],
                        );
                      }
                    }}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.photoBtn}
                    onPress={() => abrirScanner('clave')}>
                    <MyIcon name="camera-outline" size={18} white />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Detalle de surtido */}
          {plConfirmado && items.length > 0 && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <MyIcon name="edit-2-outline" size={16} />
                <Text style={styles.sectionTitle}>Surtido</Text>
              </View>

              {/* Resumen: cantidad pedida centrada (muestra el pendiente real: pedido − surtido) */}
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Cantidad pedida</Text>
                <Text style={styles.summaryValue}>
                  {unidadesPedido ? String(pendienteBase) : '—'}
                </Text>
              </View>

              {/* Cajas: valor esperado a la izquierda (grande), input a la derecha (destacado) */}
              <View style={styles.captureRow}>
                <View style={styles.captureExpectedBox}>
                  <Text style={styles.captureExpectedLabel}>Cajas</Text>
                  <Text style={styles.captureExpectedValue}>{cajas}</Text>
                </View>
                {(() => {
                  const n = Number(cajasConfirm) || 0;
                  const exp = Number(cajas) || 0;
                  const ok = n > 0 && n === exp;
                  return (
                    <View
                      style={
                        ok ? styles.captureInputWrapOk : styles.captureInputWrap
                      }>
                      <Text
                        style={
                          ok
                            ? styles.captureInputLabelOk
                            : styles.captureInputLabel
                        }>
                        Confirmar cajas
                      </Text>
                      <TextInput
                        style={styles.captureInput}
                        placeholder="0"
                        placeholderTextColor="#CBD5E1"
                        value={cajasConfirm}
                        onChangeText={handleCajasChange}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>
                  );
                })()}
              </View>

              {/* Unidades: mismo patrón */}
              <View style={styles.captureRow}>
                <View style={styles.captureExpectedBox}>
                  <Text style={styles.captureExpectedLabel}>Unidades</Text>
                  <Text style={styles.captureExpectedValue}>{sueltas}</Text>
                </View>
                {(() => {
                  const n = Number(sueltasConfirm) || 0;
                  const exp = Number(sueltas) || 0;
                  const ok = n > 0 && n === exp;
                  return (
                    <View
                      style={
                        ok ? styles.captureInputWrapOk : styles.captureInputWrap
                      }>
                      <Text
                        style={
                          ok
                            ? styles.captureInputLabelOk
                            : styles.captureInputLabel
                        }>
                        Confirmar unidades
                      </Text>
                      <TextInput
                        style={styles.captureInput}
                        placeholder="0"
                        placeholderTextColor="#CBD5E1"
                        value={sueltasConfirm}
                        onChangeText={handleSueltasChange}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>
                  );
                })()}
              </View>

              {/* Total a surtir: barra resumen grande, siempre visible */}
              <View style={styles.totalBar}>
                <View style={styles.totalBarLeft}>
                  <MyIcon name="checkmark-circle-2-outline" size={20} white />
                  <Text style={styles.totalBarLabel}>Total a surtir</Text>
                </View>
                <Text style={styles.totalBarValue}>{cantidadASurtir}</Text>
              </View>
            </View>
          )}

          {/* Placeholder: orden lista para APLICAR (no hay pendientes).
              Ocupa el lugar donde normalmente aparecen los productos. */}
          {enProceso && (
            <View style={styles.readyCard}>
              <View style={styles.readyIconWrap}>
                <MyIcon name="checkmark-circle-2-outline" size={32} white />
              </View>
              <Text style={styles.readyTitle}>Orden lista para aplicar</Text>
              <Text style={styles.readySubtitle}>
                La orden{' '}
                <Text style={styles.readyOrderId}>#{preid}</Text> ya tiene todos
                sus productos surtidos.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.readyBtn,
                  aplicandoOrden && styles.btnDisabled,
                ]}
                onPress={handleAplicarOrden}
                disabled={aplicandoOrden}>
                {aplicandoOrden ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MyIcon name="checkmark-outline" size={18} white />
                )}
                <Text style={styles.readyBtnText}>
                  {aplicandoOrden ? 'Aplicando…' : 'Aplicar orden'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Acciones */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.saveBtn,
                (!puedeEnviar || enviandoSurtido) && styles.btnDisabled,
              ]}
              onPress={handleEnviar}
              disabled={!puedeEnviar || enviandoSurtido}>
              {enviandoSurtido ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MyIcon name="save-outline" size={18} white />
              )}
              <Text style={styles.saveBtnText}>
                {enviandoSurtido ? 'Guardando…' : 'Guardar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.clearBtn}
              onPress={limpiarTodo}>
              <MyIcon name="trash-2-outline" size={18} white />
              <Text style={styles.clearBtnText}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.nextBtn,
                (!hayMas || cambiandoPartida) && styles.btnDisabled,
              ]}
              onPress={handleSiguiente}
              disabled={!hayMas || cambiandoPartida}>
              {cambiandoPartida ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MyIcon name="arrow-forward-outline" size={18} white />
              )}
              <Text style={styles.nextBtnText}>
                {cambiandoPartida ? 'Cambiando…' : 'Saltar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <ModalCodeScanner
          visible={scannerVisible}
          isCameraActive={scannerVisible}
          onClose={() => {
            setScannerVisible(false);
            setScannerTarget(null);
          }}
          onCodeScanned={handleCodeScanned}
        />
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
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.4,
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
  itemCounter: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
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
  ubiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
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
  inputWarning: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    backgroundColor: '#FFFBEB',
  },
  // === Surtido card — UX operador almacén ===
  summaryBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryChipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  summaryChipValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1D4ED8',
    letterSpacing: -0.3,
  },
  statBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statBoxValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  statBoxAccent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statBoxLabelAccent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statBoxValueAccent: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1D4ED8',
    letterSpacing: -0.5,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginBottom: 10,
  },
  captureExpectedBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  captureExpectedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  captureExpectedValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  captureInputWrap: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  captureInputWrapOk: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  captureInputWrapWarn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  captureInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  captureInputLabelOk: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  captureInputLabelWarn: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  captureInput: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    padding: 0,
    minHeight: 40,
  },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  totalBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalBarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  totalBarValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  hintOk: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  hintWarn: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  productSummary: {
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
  productSummaryMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  metaChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  metaChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
    fontSize: 13,
    letterSpacing: 0.2,
  },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  clearBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // === Placeholder "Orden lista para aplicar" ===
  readyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  readyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#16A34A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  readyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  readySubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  readyOrderId: {
    fontWeight: '900',
    color: '#0F172A',
  },
  readyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#16A34A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  readyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // === Barra "Aplicar orden" (Opción C) — estilo verde, acción de cierre positiva ===
  applyBar: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    marginBottom: 12,
    shadowColor: '#16A34A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  applyBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  applyBarStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  applyBarDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  applyBarStatusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#166534',
    letterSpacing: 0.8,
  },
  applyBarMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.2,
  },
  applyBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#16A34A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  applyBarBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  applyBarHint: {
    fontSize: 11,
    color: '#166534',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
