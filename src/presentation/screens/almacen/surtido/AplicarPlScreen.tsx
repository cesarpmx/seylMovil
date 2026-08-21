import React, {useRef, useState} from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {MainLayout} from '../../../layouts/MainLayout';
import {Layout} from '@ui-kitten/components';
import {useAuthStore} from '../../../store/modules/useModulesStore';
import {MyIcon} from '../../../components/ui/MyIcon';
import {SelectEmpresa} from '../../../components/ui/SelectEmpresa';
import {SelectAlmacen} from '../../../components/ui/SelectAlmacen';
import {
  getSurtirPlMovil,
  SurtirPlMovilItem,
} from '../../../../actions/almacen/surtido/get-surtirPlMovil';
import {getDetalleSurtido} from '../../../../actions/almacen/surtido/get-detalleSurtido';
import {postSurtidoAplicar} from '../../../../actions/almacen/surtido/post-surtidoAplicar';

export const AplicarPlScreen = () => {
  const {empresas, almacenes, usuid} = useAuthStore();

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
  const plInputRef = useRef<TextInput>(null);

  // Datos de la PL validada (para checar diferencias pedido/surtido)
  const [items, setItems] = useState<SurtirPlMovilItem[]>([]);
  const [preid, setPreid] = useState<number | null>(null);
  const [aplicandoOrden, setAplicandoOrden] = useState(false);

  const [resetKey, setResetKey] = useState(0);

  // Detecta si al menos una partida no está totalmente surtida
  // (dprcantidad !== dprsurtido) para mostrar la advertencia.
  const hayPendientes = items.some(
    it => (Number(it.dprcantidad) || 0) !== (Number(it.dprsurtido) || 0),
  );

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
    console.log('[AplicarPL] ▶ PL capturada:', clave);
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

      const items = await getSurtirPlMovil(clave, empresa, almacen);
      console.log('[AplicarPL] ▶ items devueltos:', items?.length ?? 0);

      if (!items || items.length === 0) {
        // Fallback: consulta el header para saber el estatus real y dar
        // un mensaje claro (surtida, cancelada, etc.).
        const header = await getDetalleSurtido(clave);
        console.log('[AplicarPL] ▶ header (fallback):', JSON.stringify(header));

        const limpiarInput = () => {
          setPl('');
          setPlConfirmado(false);
          setTimeout(() => plInputRef.current?.focus(), 100);
        };

        if (!header || !header.preid) {
          Alert.alert(
            'PL no encontrado',
            `No se encontró la orden "${clave}" para la empresa/almacén seleccionados. Verifica los datos.`,
            [{text: 'OK', onPress: limpiarInput}],
          );
          return;
        }

        Alert.alert(
          'Orden no disponible',
          `La orden #${header.preid} no puede aplicarse porque se encuentra en estado "${
            header.esunombre || header.preestatus || '—'
          }".`,
          [{text: 'OK', onPress: limpiarInput}],
        );
        return;
      }

      // OK: la PL existe para ese contexto → marcamos válida (check verde)
      // sin renderizar card de detalle. Guardamos items y preid para
      // el flujo de aplicar la orden.
      setItems(items);
      setPreid(Number(items[0].dprpreid) || Number(clave));
      setPl(String(items[0].dprpreid || clave));
      setPlConfirmado(true);
      setPlError(false);
      setEditableEmpresa(false);
      setEditableAlmacen(false);
    } catch (e: any) {
      console.error('[AplicarPL] error confirmarPL:', e?.message);
      Alert.alert('Error', 'No se pudo consultar el Packing List.');
    } finally {
      setCargandoPL(false);
    }
  };

  const aplicarPost = async () => {
    if (!preid) return;
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
        Alert.alert('Orden aplicada', msg, [
          {
            text: 'OK',
            onPress: () => {
              limpiarTodoInterno();
              setTimeout(() => plInputRef.current?.focus(), 100);
            },
          },
        ]);
      } else {
        Alert.alert('No se pudo aplicar', msg);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo aplicar la orden.');
    } finally {
      setAplicandoOrden(false);
    }
  };

  const handleAplicarOrden = () => {
    if (!plConfirmado || preid == null) return;

    // Confirmación única — el aviso de "productos sin surtir" ahora
    // se muestra dentro de la card (readyCard) en amarillo, no aquí.
    Alert.alert(
      'Confirmar orden',
      `¿Estás seguro que deseas confirmar la orden #${preid}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Confirmar',
          style: 'default',
          onPress: aplicarPost,
        },
      ],
    );
  };

  const limpiarTodoInterno = () => {
    setPl('');
    setPlConfirmado(false);
    setPlError(false);
    setItems([]);
    setPreid(null);
    setEditableEmpresa(true);
    setEditableAlmacen(true);
  };

  const limpiarTodo = () => {
    const hayPl = !!pl || plConfirmado || items.length > 0;
    if (hayPl) {
      // Primera limpieza: solo PL. Rehabilita empresa/almacén por si el
      // usuario quiere cambiar contexto para leer otra PL.
      limpiarTodoInterno();
      setTimeout(() => plInputRef.current?.focus(), 100);
      return;
    }
    // Segunda limpieza (sin PL): también empresa/almacén.
    setEmpresa('');
    setAlmacen('');
    setEmpresaError(false);
    setAlmacenError(false);
    setEditableEmpresa(true);
    setEditableAlmacen(true);
    setResetKey(k => k + 1);
  };

  return (
    <MainLayout title="Aplicar PL" subTitle="Almacén">
      <Layout style={{flex: 1, backgroundColor: '#F8FAFC'}}>
        <ScrollView
          style={{flex: 1}}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
          nestedScrollEnabled>
          {/* Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderIcon}>
              <MyIcon name="checkmark-circle-2-outline" size={22} white />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.pageTitle}>Aplicar PL</Text>
              <Text style={styles.pageSubtitle}>
                Aplica una orden de surtido lista para cierre
              </Text>
            </View>
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
                  Selecciona empresa/almacén y escribe el PL para aplicar la
                  orden.
                </Text>
              )}
            </View>
          </View>

          {/* Card "Aplicar orden" — aparece cuando la PL fue validada.
              Verde si todo pedido = surtido; amarilla si hay diferencias. */}
          {plConfirmado && preid != null && (
            <View
              style={[
                styles.readyCard,
                hayPendientes && styles.readyCardWarn,
              ]}>
              <View
                style={[
                  styles.readyIconWrap,
                  hayPendientes && styles.readyIconWrapWarn,
                ]}>
                <MyIcon
                  name={
                    hayPendientes
                      ? 'alert-triangle-outline'
                      : 'checkmark-circle-2-outline'
                  }
                  size={32}
                  white
                />
              </View>
              <Text style={styles.readyTitle}>
                {hayPendientes
                  ? 'Orden con diferencias'
                  : 'Orden lista para aplicar'}
              </Text>
              <Text style={styles.readySubtitle}>
                La orden <Text style={styles.readyOrderId}>#{preid}</Text>{' '}
                {hayPendientes
                  ? 'tiene productos con cantidades pendientes por surtir. Al confirmar se aplicará con lo que ya está surtido.'
                  : 'fue validada correctamente. Todos los productos están surtidos.'}
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.readyBtn,
                  hayPendientes && styles.readyBtnWarn,
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
                  {aplicandoOrden ? 'Aplicando…' : 'Confirmar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Acciones */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.clearBtn}
              onPress={limpiarTodo}>
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
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
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
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  clearBtn: {
    flex: 1,
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

  // === Card "Orden lista para aplicar" ===
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
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  readyOrderId: {
    fontWeight: '900',
    color: '#0F172A',
  },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  warnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.1,
    flexShrink: 1,
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
  btnDisabled: {
    opacity: 0.5,
  },

  // === Variante ámbar (orden con diferencias / pendientes) ===
  readyCardWarn: {
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
  },
  readyIconWrapWarn: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  readyBtnWarn: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
  },
});
