import { loginApi } from "../../config/api/loginApi";
import { ProductImageItem, ProductsItems, ServidorItem } from "../../domain/entities/products";
import { ImagenProductMapper } from "../../infrastructure/mappers/almacen/Inventario/imagenProducto/imagenProducto.mapper";
import { ProductMapper } from "../../infrastructure/mappers/product.mapper";
import { ServidorProductMapper } from "../../infrastructure/mappers/servidor/ServidorProductMapper";

export const getProductsByPage = async (page: number, descripcion: string, empresa: string, limit: number = 20) => {
    const offset = page * limit;
    const desc = (descripcion ?? '').trim();
    const params = new URLSearchParams({
        empresa,
        estatus: 'A',
        limit: String(limit),
        offset: String(offset),
    });
    if (desc) {
        params.append('descripcion', desc);
    }
    const url = `/productos/productos/?${params.toString()}`;
    try {
        console.log('[getProductsByPage] GET', url);
        const { data } = await loginApi.get<ProductsItems>(url);

        if (!data || !Array.isArray(data.items)) {
            console.error('[getProductsByPage] respuesta sin items:', data);
            throw new Error('Invalid response structure');
        }

        const totalrecsFromResponse = Math.max(
            ...data.items.map(item => Number(item.totalrecs) || 0),
            0,
        );

        const filteredItems = data.items.filter(item => item.prdid !== 0 && item.prdclave !== "-1");
        const products = filteredItems.map(item => ProductMapper.productToEntity(item));

        return {
            products,
            hasMore: data.hasMore ?? false,
            totalrecs: totalrecsFromResponse,
        };
    } catch (error: any) {
        console.error('[getProductsByPage] URL:', url);
        console.error('[getProductsByPage] status:', error?.response?.status);
        console.error('[getProductsByPage] data:', JSON.stringify(error?.response?.data));
        console.error('[getProductsByPage] message:', error?.message);
        throw error;
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