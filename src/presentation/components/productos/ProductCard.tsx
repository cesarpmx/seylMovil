import React from 'react';
import { Layout, Text } from '@ui-kitten/components';
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native';

interface Product {
  prdid: string;
  prdclave: string;
  prdnombre: string;
  prdcosto: string;
  prdualid: string;
  prdinner: string;
}

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void; 
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(product)}>
      <Layout style={styles.card}>
        <Layout style={{ flexDirection: 'row', marginBottom: 10 }}>
            
          {/* <Image
            source={{
              uri: 'https://via.placeholder.com/150',
            }}
            style={styles.image}
          /> */}

          {/* Detalles del Producto */}
          <Layout style={{ flex: 1 }}>
            {/* Título del Producto */}
            <Text style={styles.productTitle}>{product.prdnombre}</Text>

            {/* Detalles organizados en dos columnas */}
            <View style={styles.detailsContainer}>
              <View style={styles.column}>
                <Text style={styles.productDetail}>ID: {product.prdid}</Text>
                <Text style={styles.productDetail}>Clave: {product.prdclave}</Text>
                <Text style={styles.productDetail}>Línea: {product.prdcosto}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.productDetail}>Unidad: {product.prdualid}</Text>
                <Text style={styles.productDetail}>Inner: {product.prdinner}</Text>
                <Text style={styles.productDetail}>Estatus: {product.prdualid}</Text>
              </View>
            </View>
          </Layout>
        </Layout>
      </Layout>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ProductCard;