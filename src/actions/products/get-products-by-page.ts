import { loginApi } from "../../config/api/loginApi";
import { ProductImageItem, ProductsItems, ServidorItem } from "../../domain/entities/products";
import { ImagenProductMapper } from "../../infrastructure/mappers/almacen/Inventario/imagenProducto/imagenProducto.mapper";
import { ProductMapper } from "../../infrastructure/mappers/product.mapper";
import { ServidorProductMapper } from "../../infrastructure/mappers/servidor/ServidorProductMapper";

export const getProductsByPage = async (page: number, descripcion: string, empresa: string, limit: number = 20) => {
    try {
        const { data } = await loginApi.get<ProductsItems>(`/productos/productos/?empresa=${empresa}&estatus=A&descripcion=${descripcion}&limit=${limit}&offset=${page * 10}`);

        if (!data || !Array.isArray(data.items)) {
            console.error('Data does not contain items array:', data);
            throw new Error('Invalid response structure');
        }

        const filteredItems = data.items.filter(item => item.prdid !== 0 && item.prdclave !== "-1");

        const products = filteredItems.map(item => ProductMapper.productToEntity(item));

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error("Error getting products");
    }
};

export const getProductsImage = async (clave: number) => {
    try {
        const { data } = await loginApi.get<ProductImageItem>(`/archivos/productos/?clave=${clave}`);
        
        if (!data || !Array.isArray(data.items)) {
            console.error('Data does not contain items array:', data);
            throw new Error('Invalid response structure');
        }

        const productImage = data.items.map(item => ImagenProductMapper.productImageToEntity(item));

        return productImage;

    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error("Error getting products");
    }
};

export const getServidor = async (clave: string) => {
    try {
        const { data } = await loginApi.get<ServidorItem>(`/configuracion/empresasconf/?clave=${clave}`);
        
        if (!data || !Array.isArray(data.items)) {
            console.error('Data does not contain items array:', data);
            throw new Error('Invalid response structure');
        }

        const productImage = data.items.map(item => ServidorProductMapper.ServidorToEntity(item));

        return productImage;

    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error("Error getting products");
    }
};