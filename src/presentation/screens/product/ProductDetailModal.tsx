import {Button} from '@ui-kitten/components';
import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface ProductDetailModalProps {
  visible: boolean;
  product: {
    prdid: string;
    prdclave: string;
    prdualid: string;
    prdnombre: string;
    prdclaveext: string;
    prdupc: string;
    prdlinid: string;
    prdfamid: string;
    prdinventario: boolean;
    prdventa: boolean;
    prdcompuesto: boolean;
    prdtprid: string;
    prdmoncosto: string;
    prdcosto: number;
    prdmonprecio: string;
    prdprecio: number;
    prdunivol: string;
    prdvolumen: number;
    prdinner: string;
    prdunipeso: string;
    prdpeso: number;
  } | null;
  productImage: string;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  productImage,
  onClose,
}) => {
  if (!product) return null;

  const enviarCorreo = async () => {
    console.log(1);
    try {
      const response = await fetch("http://localhost:3000/send-email", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              // destinatario,
              // asunto,
              // mensaje,
              agente: "agente@example.com",
              correoNotificaciones: "notificaciones@example.com",
          }),
      });

      const data = await response.json();
      if (data.success) {
          alert("Correo enviado con éxito");
      } else {
          alert("Error al enviar el correo");
      }
  } catch (error) {
      console.error(error);
      alert("Error en la conexión");
  }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Text style={styles.closeIconText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {product && (
            <>
              {/* Sección 1: Información General */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información General</Text>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>ID:</Text> {product.prdid}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Clave:</Text> {product.prdclave}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Estatus:</Text>{' '}
                      {product.prdualid}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Nombre:</Text>{' '}
                      {product.prdnombre}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sección 2: Detalles del Producto */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Imagen del Producto</Text>
                <View style={styles.row}>
                  <View style={styles.imageContainer}>
                    {productImage ? (
                      <Image
                        source={{uri: productImage}}
                        style={styles.modalImage}
                      />
                    ) : (
                      <Text>No hay imagen disponible</Text>
                    )}
                  </View>
                  {/* <View style={styles.column}>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Clave Externa:</Text>{' '}
                      {product.prdclaveext}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>UPC:</Text> {product.prdupc}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Línea de Negocio:</Text>{' '}
                      {product.prdlinid}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Familia de Negocio:</Text>{' '}
                      {product.prdfamid}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Tienen Inventario:</Text>{' '}
                      {product.prdinventario ? 'Sí' : 'No'}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Tienen Venta:</Text>{' '}
                      {product.prdventa ? 'Sí' : 'No'}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Producto Compuesto (Kit):</Text>{' '}
                      {product.prdcompuesto ? 'Sí' : 'No'}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Tipo de Producto:</Text>{' '}
                      {product.prdtprid}
                    </Text>
                  </View> */}
                </View>
              </View>

              {/* Sección 2: Detalles del Producto */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detalles del Producto</Text>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Clave Externa:</Text>{' '}
                      {product.prdclaveext}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>UPC:</Text> {product.prdupc}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Línea de Negocio:</Text>{' '}
                      {product.prdlinid}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Familia de Negocio:</Text>{' '}
                      {product.prdfamid}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Tienen Inventario:</Text>{' '}
                      {product.prdinventario ? 'Sí' : 'No'}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Tienen Venta:</Text>{' '}
                      {product.prdventa ? 'Sí' : 'No'}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Producto Compuesto (Kit):</Text>{' '}
                      {product.prdcompuesto ? 'Sí' : 'No'}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Tipo de Producto:</Text>{' '}
                      {product.prdtprid}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sección 3: Precios y Especificaciones */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Precios y Especificaciones
                </Text>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Moneda Costo:</Text>{' '}
                      {product.prdmoncosto}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Costo Unitario:</Text>{' '}
                      {product.prdcosto}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Moneda Precio:</Text>{' '}
                      {product.prdmonprecio}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Precio Unitario:</Text>{' '}
                      {product.prdprecio}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Unidad Volumen:</Text>{' '}
                      {product.prdunivol}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Volumen por Unidad:</Text>{' '}
                      {product.prdvolumen}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sección 3: Precios y Especificaciones */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos Logisticos</Text>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Unidad de Almacenaje:</Text>{' '}
                      {product.prdualid}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Inner:</Text> {product.prdinner}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Unidad Peso:</Text>{' '}
                      {product.prdunipeso}
                    </Text>
                    <Text style={styles.modalDetail}>
                      <Text style={styles.bold}>Peso por Unidad:</Text>{' '}
                      {product.prdpeso}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  closeIcon: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 20,
    color: '#333',
    lineHeight: 30,
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  section: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#007bff',
    paddingBottom: 5,
  },
  modalDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  modalImage: {
    width: '100%',
    height: 320,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductDetailModal;
