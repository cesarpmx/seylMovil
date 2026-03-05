import React, {useState} from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {MainLayout} from '../../../layouts/MainLayout';
import {Layout} from '@ui-kitten/components';
import {useAuthStore} from '../../../store/modules/useModulesStore';
import {SelectEmpresa} from '../../../components/ui/SelectEmpresa';
import {SelectAlmacen} from '../../../components/ui/SelectAlmacen';

import DatePicker from 'react-native-date-picker';

export const SurtidoPlScreen = () => {
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
    setEditableEstado(value === null);
  };

  // Función para formatear la fecha
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [open, setOpen] = useState<boolean>(false);

  return (
    <MainLayout title="Surtido por PL" subTitle="Almacén">
      <Layout style={{flex: 1}}>
        <View style={styles.container}>

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

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Packing List"
              //   onBlur={handleSearchByPallet}
              //   value={idPallet}
              //   onChangeText={text => setIdPallet(text)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Ubicacion"
              //   onBlur={handleSearchByConteo}
              //   value={idConteo}
              //   onChangeText={text => setIdConteo(text)}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="Descripción"
              //   value={descripcion}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, styles.inputDisabled]}
              placeholder="Caja"
              //   value={unidad}
              editable={false}
            />
            <TextInput
              style={[styles.input, styles.halfInput, styles.inputDisabled]}
              placeholder="Inner"
              //   value={inner}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Id Pallet"
              //   onBlur={handleSearchByPallet}
              //   value={idPallet}
              //   onChangeText={text => setIdPallet(text)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Confirmar Id Pallet"
              //   onBlur={handleSearchByConteo}
              //   value={idConteo}
              //   onChangeText={text => setIdConteo(text)}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Clave Producto"
              //   onBlur={handleSearchByPallet}
              //   value={idPallet}
              //   onChangeText={text => setIdPallet(text)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Confirmar Clave"
              //   onBlur={handleSearchByConteo}
              //   value={idConteo}
              //   onChangeText={text => setIdConteo(text)}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, styles.inputDisabled]}
              placeholder="Lote/Serie"
              //   value={lote}
              //   onChangeText={(text: string) => setLote(text)}
            />
            <View
              style={[styles.input, styles.halfInput, styles.inputDisabled]}>
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
              style={[styles.input, styles.halfInput, styles.inputDisabled]}
              placeholder="Cajas"
              //   onBlur={handleSearchByPallet}
              //   value={idPallet}
              //   onChangeText={text => setIdPallet(text)}
            />
            <TextInput
              style={[styles.input, styles.halfInput, styles.inputDisabled]}
              placeholder="Sueltas"
              //   onBlur={handleSearchByConteo}
              //   value={idConteo}
              //   onChangeText={text => setIdConteo(text)}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Unidades Pedido"
              //   onBlur={handleSearchByPallet}
              //   value={idPallet}
              //   onChangeText={text => setIdPallet(text)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Unidades Surtido"
              //   onBlur={handleSearchByConteo}
              //   value={idConteo}
              //   onChangeText={text => setIdConteo(text)}
            />
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={() => console.log('2')}>
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={() => console.log('2')}>
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={() => console.log('2')}>
              <Text style={styles.buttonText}>Limpiar</Text>
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
    flex: 1, // 75% del espacio
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
