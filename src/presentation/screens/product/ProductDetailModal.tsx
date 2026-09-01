import {Button} from '@ui-kitten/components';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Icon } from '@ui-kitten/components';

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
  isImageLoading?: boolean;
  isUploading?: boolean;
  canInsertImage?: boolean;
  canUpdateImage?: boolean;
  onClose: () => void;
  onPickImageCamera?: () => void;
  onPickImageGallery?: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  productImage,
  isImageLoading = false,
  isUploading = false,
  canInsertImage = true,
  canUpdateImage = true,
  onClose,
  onPickImageCamera,
  onPickImageGallery,
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
                    {isImageLoading ? (
                      <View style={styles.imagePlaceholder}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={styles.imagePlaceholderText}>
                          Cargando imagen...
                        </Text>
                      </View>
                    ) : productImage ? (
                      <View style={{ width: '100%' }}>
                        <View style={styles.imageFrame}>
                          <Image
                            source={{uri: productImage}}
                            style={styles.modalImage}
                            resizeMode="cover"
                          />
                          {isUploading && (
                            <View style={styles.uploadingOverlay}>
                              <ActivityIndicator size="large" color="#FFFFFF" />
                              <Text style={styles.uploadingOverlayText}>
                                Subiendo imagen…
                              </Text>
                            </View>
                          )}
                        </View>
                        {canUpdateImage && (
                        <>
                        <View style={styles.replaceDividerRow}>
                          <View style={styles.replaceDividerLine} />
                          <View style={styles.replaceChip}>
                            <Icon
                              name="refresh-outline"
                              fill="#2563EB"
                              style={styles.replaceChipIcon}
                            />
                            <Text style={styles.replaceChipText}>
                              Reemplazar imagen
                            </Text>
                          </View>
                          <View style={styles.replaceDividerLine} />
                        </View>

                        <View style={styles.replaceCard}>
                          <View style={styles.uploadActions}>
                            <TouchableOpacity
                              activeOpacity={0.85}
                              disabled={isUploading}
                              onPress={onPickImageCamera}
                              style={[styles.primaryBtn, isUploading && styles.btnDisabled]}>
                              <Icon
                                name="camera-outline"
                                fill="#FFFFFF"
                                style={styles.btnIcon}
                              />
                              <Text style={styles.primaryBtnText}>Cámara</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              activeOpacity={0.85}
                              disabled={isUploading}
                              onPress={onPickImageGallery}
                              style={[styles.secondaryBtn, isUploading && styles.btnDisabled]}>
                              <Icon
                                name="image-outline"
                                fill="#2563EB"
                                style={styles.btnIcon}
                              />
                              <Text style={styles.secondaryBtnText}>Galería</Text>
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.replaceHint}>
                            Se sobrescribirá la imagen actual del producto
                          </Text>
                        </View>
                        </>
                        )}
                      </View>
                    ) : !canInsertImage ? (
                      <View style={styles.dropzoneLocked}>
                        <View style={styles.dropzoneLockedIconWrap}>
                          <Icon
                            name="lock-outline"
                            fill="#94A3B8"
                            style={styles.dropzoneIcon}
                          />
                        </View>
                        <Text style={styles.dropzoneLockedTitle}>
                          Sin imagen disponible
                        </Text>
                        <Text style={styles.dropzoneLockedSubtitle}>
                          No tienes permisos para agregar una imagen a este producto
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.dropzone}>
                        <View style={styles.dropzoneIconWrap}>
                          <Icon
                            name="cloud-upload-outline"
                            fill="#2563EB"
                            style={styles.dropzoneIcon}
                          />
                        </View>
                        <Text style={styles.dropzoneTitle}>
                          Sube una imagen del producto
                        </Text>
                        <Text style={styles.dropzoneSubtitle}>
                          Toma una foto o elige una desde tu galería
                        </Text>

                        <View style={styles.uploadActions}>
                          <TouchableOpacity
                            activeOpacity={0.85}
                            disabled={isUploading}
                            onPress={onPickImageCamera}
                            style={[styles.primaryBtn, isUploading && styles.btnDisabled]}>
                            <Icon
                              name="camera-outline"
                              fill="#FFFFFF"
                              style={styles.btnIcon}
                            />
                            <Text style={styles.primaryBtnText}>Cámara</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.85}
                            disabled={isUploading}
                            onPress={onPickImageGallery}
                            style={[styles.secondaryBtn, isUploading && styles.btnDisabled]}>
                            <Icon
                              name="image-outline"
                              fill="#2563EB"
                              style={styles.btnIcon}
                            />
                            <Text style={styles.secondaryBtnText}>Galería</Text>
                          </TouchableOpacity>
                        </View>

                        {isUploading && (
                          <View style={styles.uploadingInline}>
                            <ActivityIndicator size="small" color="#2563EB" />
                            <Text style={styles.uploadingInlineText}>
                              Subiendo imagen…
                            </Text>
                          </View>
                        )}
                      </View>
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
  imagePlaceholder: {
    width: '100%',
    height: 320,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  noImageText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },

  // === Uploader (dropzone) ===
  imageFrame: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadingOverlayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dropzone: {
    width: '100%',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    borderRadius: 14,
    backgroundColor: '#F0F7FF',
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  dropzoneIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  dropzoneIcon: { width: 28, height: 28 },
  dropzoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropzoneSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 10,
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secondaryBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 14,
  },
  btnIcon: { width: 18, height: 18 },
  btnDisabled: { opacity: 0.6 },
  uploadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  uploadingInlineText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  // Separador "or"-style con chip centrado
  replaceDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
    gap: 8,
  },
  replaceDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  replaceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  replaceChipIcon: { width: 14, height: 14 },
  replaceChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.2,
  },
  // Card contenedor para los botones + hint
  replaceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  replaceHint: {
    marginTop: 10,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // === Estados sin permisos ===
  noPermBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  noPermIcon: { width: 14, height: 14 },
  noPermText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  dropzoneLocked: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  dropzoneLockedIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dropzoneLockedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  dropzoneLockedSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default ProductDetailModal;
