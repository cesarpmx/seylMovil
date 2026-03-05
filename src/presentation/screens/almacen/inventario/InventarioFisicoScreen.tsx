import React, {useState} from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
  const [cantidadTotal, setCantidadTotal] = useState('');
  const [cajas, setCajas] = useState('');
  const [sueltas, setSueltas] = useState('');
  const [infprdid, setInfprdid] = useState('');

  const calcularCantidad = () => {
    const innerValue = parseInt(inner) || 0;
    const cajasValue = parseInt(cajas) || 0;
    const sueltasValue = parseInt(sueltas) || 0;

    const resultado = innerValue * cajasValue + sueltasValue;

    setCantidadTotal(resultado.toString());
  };
  const [editable, setEditable] = useState(true);
  const [editableEmpresa, setEditableEmpresa] = useState(true);
  const [editableConteo, setEditableConteo] = useState(true);
  const [editableEstado, setEditableEstado] = useState(true);

  const [resetKey, setResetKey] = useState(0);

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

  const handleSearchByPallet = async () => {
    try {
      if (!idPallet) {
        console.log('Por favor, ingresa un ID Pallet.');
        return;
      }

      const data = await getIdPallet(idPallet);

      if (data && data.length > 0) {
        const item = data[0];

        setClaveProducto(item.prdclave || '');
        setDescripcion(item.prdnombre || '');
        setUnidad(item.prdualid || '');
        setInner(item.prdinner?.toString() || '');
        setLote(item.raclote || '');
        setFechaCaducidad(item.racfeccaducidad.toLocaleDateString || '');
        setInfprdid(item.racprdid.toString() || '');
      } else {
        console.log('No se encontraron datos.');
      }
    } catch (error) {
      console.error('Error fetching inventario físico:', error);
    }
  };

  const handleSearchByConteo = async () => {
    try {
      if (!idConteo.trim()) {
        console.log('Por favor, ingresa un ID.');
        return;
      }

      const data = await getInventarioFisico(idConteo);

      if (data && data.length > 0) {
        const item = data[0];

        setIdPallet(item.infracid || '');
        setClaveProducto(item.prdclave || '');
        setDescripcion(item.prdnombre || '');
        setUnidad(item.prdualid || '');
        setInner(item.prdinner?.toString() || '');
        setLote(item.inflote || '');
        setFechaCaducidad(item.inffeccad || '');
        setInfprdid(item.infprdid.toString() || '');

        // setCantidad(item.infaplicar?.toString() || '');
      } else {
        console.log('No se encontraron datos.');
      }
    } catch (error) {
      console.error('Error fetching inventario físico:', error);
    }
  };

  const handleSearchByProducto = async () => {
    try {
      if (!claveProducto.trim() && !empresa) {
        console.log('Por favor, ingresa un ID.');
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
    if (!empresa) {
      Alert.alert('Error', 'Por favor, ingresa una empresa.');
      return;
    }
    if (!almacen) {
      Alert.alert('Error', 'Por favor, ingresa un almacen.');
      return;
    }
    if (!conteo) {
      Alert.alert('Error', 'Por favor, ingresa el conteo.');
      return;
    }
    if (!estadoInv) {
      Alert.alert('Error', 'Por favor, ingresa el estado del inventario.');
      return;
    }

    if (!ubicacion || !cantidadTotal || !lote || !fechaCaducidad) {
      Alert.alert(
        'Error',
        'Faltan datos por llenar. Por favor, revisa todos los campos.',
      );
      return;
    }

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
      setIdPallet('');
      setClaveProducto('');
      setDescripcion('');
      setUnidad('');
      setInner('');
      setLote('');
      setFechaCaducidad('');
      setCantidadTotal('');
      setCajas('');
      setSueltas('');
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
    setConteo('');
    setEstatus('');
    setUbicacion('');
    setIdPallet('');
    setClaveProducto('');
    setDescripcion('');
    setUnidad('');
    setInner('');
    setLote('');
    setFechaCaducidad('');
    setCantidadTotal('');
    setCajas('');
    setSueltas('');
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
            />
            <SelectAlmacen
              key={resetKey}
              almacenes={almacenes}
              onSelect={handleAlmacenSelect}
              editable={editable}
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
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="# Conteo"
              onBlur={handleSearchByConteo}
              value={idConteo}
              onChangeText={text => setIdConteo(text)}
            />

            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="ID Pallet"
              onBlur={handleSearchByPallet}
              value={idPallet}
              onChangeText={text => setIdPallet(text)}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Ubicación"
              value={ubicacion}
              onChangeText={text => setUbicacion(text)}
            />

            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Clave Producto"
              value={claveProducto}
              onBlur={handleSearchByProducto}
              onChangeText={text => setClaveProducto(text)}
            />
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
                date={new Date()} // Fecha inicial
                mode="date"
                locale="es" // Idioma español
                onConfirm={(selectedDate: Date) => {
                  setOpen(false);
                  setFechaCaducidad(formatDate(selectedDate)); // Actualiza la fecha
                }}
                onCancel={() => setOpen(false)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Cajas"
              value={cajas}
              onChangeText={text => setCajas(text)}
              onBlur={calcularCantidad}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Sueltas"
              value={sueltas}
              onChangeText={text => setSueltas(text)}
              onBlur={calcularCantidad}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              value={cantidadTotal}
              editable={false}
            />
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
      </Layout>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    // flex: 1,
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
    flex: 3, // 75% del espacio
  },
  clearButton: {
    backgroundColor: '#f44336',
    flex: 1, // 25% del espacio
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  datePlaceholder: {
    fontSize: 12,
    color: '#999', // Color para el placeholder
    textAlign: 'center',
    paddingVertical: 17,
    paddingRight: 45,
  },
  selectRow: {
    zIndex: 3000, // ZIndex alto para los primeros dos selects
    elevation: 3000, // Elevation alto para Android
  },
  selectRowLower: {
    zIndex: 2000, // ZIndex más bajo para los selects inferiores
    elevation: 2000, // Elevation más bajo para Android
  },
});
