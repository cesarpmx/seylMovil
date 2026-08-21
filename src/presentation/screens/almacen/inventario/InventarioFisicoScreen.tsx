import React, {useRef, useState} from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {MainLayout} from '../../../layouts/MainLayout';
import {Layout} from '@ui-kitten/components';
import {useAuthStore} from '../../../store/modules/useModulesStore';
import {SelectEmpresa} from '../../../components/ui/SelectEmpresa';
import {SelectAlmacen} from '../../../components/ui/SelectAlmacen';
import {
  getIdPallet,
  getInventarioFisico,
  getProductByClave,
  postInventario,
} from '../../../../actions/almacen/inventario/get-CentralInventario';
import {SelectConteo} from '../../../components/ui/SelectConteo';
import {EstadoInvSelect} from '../../../components/ui/EstadoInvSelect';
import {SelectUbicacion, SelectUbicacionHandle} from '../../../components/ui/SelectUbicacion';
import {SelectProducto, SelectProductoHandle} from '../../../components/ui/SelectProducto';
import {getUbicacion} from '../../../../actions/almacen/movimientosInternos/get-Ubicaciones';

import DatePicker from 'react-native-date-picker';

export const InventarioFisicoScreen = () => {
  const [empresa, setEmpresa] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [conteo, setConteo] = useState('');
  const [estadoInv, setEstadoInv] = useState('');
  const [estatus, setEstatus] = useState('');

  const [idConteo, setIdConteo] = useState('');
  const [idPallet, setIdPallet] = useState('');
  const {empresas, almacenes, usuid} = useAuthStore();
  const [ubicacion, setUbicacion] = useState('');
  const [claveProducto, setClaveProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidad, setUnidad] = useState('');
  const [inner, setInner] = useState('');
  const [lote, setLote] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [cantidadTotal, setCantidadTotal] = useState('0');
  const [cajas, setCajas] = useState('0');
  const [sueltas, setSueltas] = useState('0');
  const [infprdid, setInfprdid] = useState('');
  const [ubicacionValid, setUbicacionValid] = useState(false);
  const [productoValid, setProductoValid] = useState(false);
  const [palletValid, setPalletValid] = useState(false);
  const [palletLockedProducto, setPalletLockedProducto] = useState(false);
  const ubicacionRef = useRef<SelectUbicacionHandle>(null);
  const productoRef = useRef<SelectProductoHandle>(null);
  const palletRef = useRef<TextInput>(null);

  const calcularCantidad = () => {
    const cajasValue = parseInt(cajas) || 0;
    const sueltasValue = parseInt(sueltas) || 0;

    const resultado = cajasValue + sueltasValue;

    setCantidadTotal(resultado.toString());
  };

  const handleNumericChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => (text: string) => {
    // Solo dígitos, sin negativos ni decimales; vacío se trata como '0'.
    const sanitized = text.replace(/[^0-9]/g, '');
    setter(sanitized === '' ? '0' : sanitized);
  };
  const [editable, setEditable] = useState(true);
  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [editableConteo, setEditableConteo] = useState(true);
  const [editableEstado, setEditableEstado] = useState(true);

  const [resetKey, setResetKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const lastFetchedPallet = useRef<string>('');
  const lastFetchedConteo = useRef<string>('');

  const isMissing = (value: string) => submitted && !value?.toString().trim();

  const handleEmpresaSelect = (value: string | null) => {
    console.log('Empresa seleccionada:', value);
    setEmpresa(value || '');
    setEditableEmpresa(value === null); // Cambia la editabilidad según si hay valor seleccionado
  };

  const handleAlmacenSelect = (value: string | null) => {
    console.log('Almacen seleccionada:', value);
    setAlmacen(value || '');
    setEditable(value === null); // Cambia la editabilidad según si hay valor seleccionado
  };

  const handleConteonSelect = (value: string | null) => {
    console.log('conteo seleccionada:', value);
    setConteo(value || '');
    setEditableConteo(value === null);
  };

  const handleEstadoInvonSelect = (value: string | null) => {
    console.log('Estado seleccionada:', value);
    setEstadoInv(value || '');
    setEditableEstado(value === null)
  };

  const clearPalletFields = () => {
    setClaveProducto('');
    setDescripcion('');
    setUnidad('');
    setInner('');
    setLote('');
    setFechaCaducidad('');
    setInfprdid('');
    setProductoValid(false);
    setPalletLockedProducto(false);
  };

  const handleSearchByPallet = async (override?: string): Promise<boolean> => {
    try {
      const current = ((override ?? idPallet) || '').trim();

      // Si es el mismo valor que la última búsqueda, no hacemos nada.
      if (current === lastFetchedPallet.current && current !== '') {
        return palletValid;
      }

      if (!current) {
        clearPalletFields();
        lastFetchedPallet.current = '';
        setPalletValid(false);
        setPalletLockedProducto(false);
        return false;
      }

      if (typeof override === 'string' && override !== idPallet) {
        setIdPallet(override);
      }

      // Solo actualizamos el ref DESPUÉS del fetch para poder distinguir
      // éxito de fallo (así no se pierden los datos si el pallet no existe).
      const data = await getIdPallet(current);

      if (data && data.length > 0) {
        const item = data[0];
        lastFetchedPallet.current = current;

        setClaveProducto(item.prdclave || '');
        setDescripcion(item.prdnombre || '');
        setUnidad(item.prdualid || '');
        setInner(item.prdinner?.toString() || '');
        setLote(item.raclote || '');
        setFechaCaducidad(
          item.racfeccaducidad
            ? new Date(item.racfeccaducidad).toLocaleDateString()
            : '',
        );
        setInfprdid(item.racprdid?.toString() || '');
        if (item.prdclave) {
          setProductoValid(true);
          setPalletLockedProducto(true);
        }
        setPalletValid(true);
        return true;
      } else {
        setPalletValid(false);
        setPalletLockedProducto(false);
        return false;
      }
    } catch (error) {
      console.error('Error fetching inventario físico:', error);
      setPalletValid(false);
      setPalletLockedProducto(false);
      return false;
    }
  };

  const handleSearchByConteo = async () => {
    try {
      const current = idConteo.trim();

      // Mismo valor que la última búsqueda → no re-fetchamos ni sobrescribimos
      // los campos (evita que se pisen los datos que el usuario ya cambió).
      if (current === lastFetchedConteo.current) {
        return;
      }

      if (!current) {
        lastFetchedConteo.current = '';
        return;
      }

      const data = await getInventarioFisico(current);

      if (data && data.length > 0) {
        const item = data[0];
        lastFetchedConteo.current = current;

        const nuevoPallet = item.infracid || '';
        // Solo llenamos ID Pallet si el usuario NO escribió nada ahí.
        // Evita pisar lo que está escribiendo mientras el fetch corría.
        setIdPallet(prev => {
          if (prev && prev.trim() !== '') return prev;
          if (nuevoPallet) lastFetchedPallet.current = nuevoPallet;
          return nuevoPallet;
        });

        // Mismo criterio para los demás campos: no pisar si el usuario ya escribió
        setClaveProducto(prev => (prev ? prev : item.prdclave || ''));
        setDescripcion(prev => (prev ? prev : item.prdnombre || ''));
        setUnidad(prev => (prev ? prev : item.prdualid || ''));
        setInner(prev => (prev ? prev : item.prdinner?.toString() || ''));
        setLote(prev => (prev ? prev : item.inflote || ''));
        setFechaCaducidad(prev => (prev ? prev : item.inffeccad || ''));
        setInfprdid(prev => (prev ? prev : item.infprdid?.toString() || ''));
      } else {
        lastFetchedConteo.current = current;
        console.log('No se encontraron datos.');
      }
    } catch (error) {
      console.error('Error fetching inventario físico:', error);
    }
  };

  const handleSearchByProducto = async () => {
    try {
      if (!claveProducto.trim() || !empresa) {
        return;
      }

      const data = await getProductByClave(empresa, claveProducto);

      if (data && data.length > 0) {
        const item = data[0];

        setDescripcion(item.prdnombre || '');
        setUnidad(item.prdualid || '');
        setInner(item.prdinner?.toString() || '');
        setInfprdid(item.prdid.toString() || '');
      } else {
        console.log('No se encontraron datos.');
      }
    } catch (error) {
      console.error('Error fetching inventario físico:', error);
    }
  };

  const moverTodos = async () => {
    if (!empresa || !almacen || !estadoInv || !claveProducto.trim()) {
      setSubmitted(true);
      Alert.alert(
        'Faltan campos requeridos',
        'Los campos marcados con * en rojo son obligatorios.',
      );
      return;
    }

    setSubmitted(false);

    const valores = {
      infid: idConteo,
      infempid: empresa,
      infalmid: almacen,
      infracid: idPallet,
      infineid: estadoInv,
      infprdid: infprdid,
      infubiid: ubicacion,
      conteo: conteo,
      totalUnidades: cantidadTotal,
      inflote: lote,
      inffeccad: fechaCaducidad,
      infestatus: estatus,
      inftres: '',
      idUsuario: usuid,
    };

    try {
      const response = await postInventario(valores);

      setConteo('');
      setEstatus('');
      setUbicacion('');
      setUbicacionValid(false);
      setIdPallet('');
      setPalletValid(false);
      setPalletLockedProducto(false);
      lastFetchedPallet.current = '';
      setClaveProducto('');
      setProductoValid(false);
      setDescripcion('');
      setUnidad('');
      setInner('');
      setLote('');
      setFechaCaducidad('');
      setCantidadTotal('0');
      setCajas('0');
      setSueltas('0');
      setIdConteo('');

      Alert.alert(
        'Éxito',
        `Movimiento(s) realizado(s) con éxito: ${response.message}`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error al realizar los movimientos:', error);
      Alert.alert('Error', 'No se pudieron realizar los movimientos.');
    }
  };

  const borrarDatos = () => {
    setSubmitted(false);
    lastFetchedPallet.current = '';
    lastFetchedConteo.current = '';
    setConteo('');
    setEstatus('');
    setUbicacion('');
    setUbicacionValid(false);
    setProductoValid(false);
    setPalletValid(false);
    setPalletLockedProducto(false);
    setIdPallet('');
    setClaveProducto('');
    setDescripcion('');
    setUnidad('');
    setInner('');
    setLote('');
    setFechaCaducidad('');
    setCantidadTotal('0');
    setCajas('0');
    setSueltas('0');
    setIdConteo('');

    setEditableEmpresa(true);
    setEditable(true);
    setEditableConteo(true);
    setEditableEstado(true);

    // setEmpresa('');

    // Cambiar la clave para forzar el re-renderizado
    setResetKey(prevKey => prevKey + 1);
  };

  const conteosArr = [
    {
      conteoValue: 1,
      conteoName: '1',
    },
    {
      conteoValue: 2,
      conteoName: '2',
    },
    {
      conteoValue: 3,
      conteoName: '3',
    },
  ];

  const estatusArry = [
    {
      statusValue: 'CUARENTENA',
      statusName: 'CUARENTENA',
    },
    {
      statusValue: 'DEVOLUCIONES',
      statusName: 'DEVOLUCIONES',
    },
    {
      statusValue: 'DISPONIBLE',
      statusName: 'DISPONIBLE',
    },
    {
      statusValue: 'ETIQUETADO',
      statusName: 'ETIQUETADO',
    },
    {
      statusValue: 'MAL ESTADO',
      statusName: 'MAL ESTADO',
    },
    {
      statusValue: 'VENTA EMP',
      statusName: 'VENTA EMP',
    },
  ];

  // Función para formatear la fecha
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [open, setOpen] = useState<boolean>(false);

  return (
    <MainLayout title="Inventario Físico" subTitle="Almacén">
      <Layout style={{flex: 1}}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{paddingBottom: 40}}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled>
        <View style={styles.container}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Buscar Producto:</Text>
          </View>

          <View style={[styles.row, styles.selectRow]}>
            <SelectEmpresa
              key={resetKey}
              empresas={empresas}
              onSelect={handleEmpresaSelect}
              editableEmpresa={editableEmpresa}
              hasError={isMissing(empresa)}
            />
            <SelectAlmacen
              key={resetKey}
              almacenes={almacenes}
              onSelect={handleAlmacenSelect}
              editable={editable}
              hasError={isMissing(almacen)}
            />
          </View>

          <View style={[styles.row, styles.selectRowLower]}>
            <SelectConteo
              key={resetKey}
              conteosArr={conteosArr}
              onSelect={handleConteonSelect}
              editableConteo={editableConteo}
            />
            <EstadoInvSelect
              key={resetKey}
              estatusArry={estatusArry}
              onSelect={handleEstadoInvonSelect}
              editableEstado={editableEstado}
              hasError={isMissing(estadoInv)}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="# Conteo (1-3)"
              placeholderTextColor="#94A3B8"
              onBlur={handleSearchByConteo}
              value={idConteo}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={text => {
                if (text === '' || text === '1' || text === '2' || text === '3') {
                  setIdConteo(text);
                } else {
                  Alert.alert(
                    'Valor no válido',
                    'El # Conteo solo puede ser 1, 2 o 3.',
                  );
                }
              }}
            />

            <TextInput
              ref={palletRef}
              style={[
                styles.input,
                styles.halfInput,
                palletValid && styles.inputValidPallet,
              ]}
              placeholder="ID Pallet"
              placeholderTextColor="#94A3B8"
              value={idPallet}
              onChangeText={text => {
                setIdPallet(text);
                setPalletValid(false);
                setPalletLockedProducto(false);
              }}
              onSubmitEditing={async e => {
                const val = (e?.nativeEvent?.text ?? idPallet).trim();
                if (!val) return;
                const ok = await handleSearchByPallet(val);
                if (ok) {
                  setTimeout(() => ubicacionRef.current?.focus(), 100);
                } else {
                  setIdPallet('');
                  lastFetchedPallet.current = '';
                  Alert.alert(
                    'ID Pallet no encontrado',
                    `No se encontró información para el pallet "${val}".`,
                    [
                      {
                        text: 'OK',
                        onPress: () =>
                          setTimeout(() => palletRef.current?.focus(), 100),
                      },
                    ],
                  );
                }
              }}
              returnKeyType="search"
              blurOnSubmit={false}
            />
          </View>

          <View style={[styles.row, styles.ubicacionRow]}>
            <View style={[styles.halfInput, { marginRight: 10 }]}>
              <SelectUbicacion
                ref={ubicacionRef}
                almacen={almacen}
                value={ubicacion}
                onChangeText={text => {
                  setUbicacion(text);
                  setUbicacionValid(false);
                }}
                onSelect={ubiid => {
                  setUbicacion(ubiid);
                  setUbicacionValid(true);
                  if (!palletLockedProducto) {
                    setTimeout(() => productoRef.current?.focus(), 100);
                  }
                }}
                onSubmitEditing={async text => {
                  const val = (text ?? ubicacion).trim();
                  if (!val || !almacen) return;
                  setUbicacion(val);
                  try {
                    const items = await getUbicacion(almacen, val);
                    const target = val.toUpperCase();
                    // Match EXACTO (case-insensitive) — así funciona
                    // igual con escaneo (handheld pega el valor completo)
                    // que con escritura manual + enter.
                    const found = items.some(
                      it =>
                        String(it.ubiid || '').trim().toUpperCase() === target,
                    );
                    if (found) {
                      setUbicacionValid(true);
                      setUbicacion(val);
                      if (!palletLockedProducto) {
                        setTimeout(() => productoRef.current?.focus(), 100);
                      }
                    } else {
                      setUbicacionValid(false);
                      setUbicacion('');
                      Alert.alert(
                        'Ubicación no encontrada',
                        `La ubicación "${val}" no existe.`,
                        [
                          {
                            text: 'OK',
                            onPress: () =>
                              setTimeout(() => ubicacionRef.current?.focus(), 100),
                          },
                        ],
                      );
                    }
                  } catch {
                    setUbicacionValid(false);
                    setUbicacion('');
                    Alert.alert(
                      'Ubicación no encontrada',
                      `La ubicación "${val}" no existe.`,
                      [
                        {
                          text: 'OK',
                          onPress: () =>
                            setTimeout(() => ubicacionRef.current?.focus(), 100),
                        },
                      ],
                    );
                  }
                }}
                placeholder="Ubicación (3 letras)"
                inputStyle="form"
                hasValid={ubicacionValid}
              />
            </View>

            <View style={[styles.halfInput, { zIndex: 1200 }]}>
              <SelectProducto
                ref={productoRef}
                empresa={empresa}
                value={claveProducto}
                editable={!palletLockedProducto}
                onChangeText={text => {
                  setClaveProducto(text);
                  setProductoValid(false);
                }}
                onSelect={item => {
                  setClaveProducto(item.prdclave);
                  setDescripcion(item.prdnombre || '');
                  setUnidad(item.prdualid || '');
                  setInner(item.prdinner?.toString() || '');
                  setInfprdid(item.prdid.toString());
                  setProductoValid(true);
                }}
                onSubmitEditing={(text, matched) => {
                  if (!matched) {
                    setClaveProducto('');
                    setDescripcion('');
                    setUnidad('');
                    setInner('');
                    setInfprdid('');
                    setProductoValid(false);
                    Alert.alert(
                      'Producto no encontrado',
                      `No se encontró producto para "${text}".`,
                      [
                        {
                          text: 'OK',
                          onPress: () =>
                            setTimeout(() => productoRef.current?.focus(), 100),
                        },
                      ],
                    );
                  }
                }}
                placeholder="Clave o descripción *"
                hasError={isMissing(claveProducto)}
                hasValid={productoValid}
              />
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="Descripción"
              value={descripcion}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, styles.inputDisabled]}
              placeholder="Unidad"
              value={unidad}
              editable={false}
            />
            <TextInput
              style={[styles.input, styles.halfInput, styles.inputDisabled]}
              placeholder="Inner"
              value={inner}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Lote"
              placeholderTextColor="#94A3B8"
              value={lote}
              onChangeText={(text: string) => setLote(text)}
            />
            <View style={[styles.input, styles.halfInput]}>
              <Text
                style={styles.datePlaceholder}
                onPress={() => setOpen(true)}>
                {fechaCaducidad || 'Fecha de Caducidad'}
              </Text>
              <DatePicker
                modal
                open={open}
                date={new Date()}
                mode="date"
                locale="es"
                onConfirm={(selectedDate: Date) => {
                  setOpen(false);
                  setFechaCaducidad(formatDate(selectedDate));
                }}
                onCancel={() => setOpen(false)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>Cajas</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={cajas}
                onChangeText={handleNumericChange(setCajas)}
                onBlur={calcularCantidad}
              />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>Sueltas</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={sueltas}
                onChangeText={handleNumericChange(setSueltas)}
                onBlur={calcularCantidad}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Cantidad</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={cantidadTotal}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={moverTodos}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={borrarDatos}>
              <Text style={styles.buttonText}>Borrar</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </Layout>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
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
  input: {
    width: '99%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#F8F8FF',
    pointerEvents: 'none',
  },
  inputValidPallet: {
    borderColor: '#16A34A',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
    flex: 3,
  },
  clearButton: {
    backgroundColor: '#f44336',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  datePlaceholder: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 17,
    paddingRight: 45,
  },
  selectRow: {
    zIndex: 3000,
    elevation: 3000,
  },
  selectRowLower: {
    zIndex: 2000,
    elevation: 2000,
  },
  ubicacionRow: {
    zIndex: 1500,
    elevation: 1500,
  },
  required: {
    color: '#EF4444',
    fontWeight: '800',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
});
