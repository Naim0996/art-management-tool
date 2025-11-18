import { useState, useCallback } from 'react';
import { adminShopAPI, Product } from '@/services/AdminShopAPIService';

interface VariantData {
  sku: string;
  name: string;
  attributes: string;
  price_adjustment: number;
  stock: number;
}

interface UseShopProductManagementProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  refetch: () => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export function useShopProductManagement({
  onSuccess,
  onError,
  refetch,
  setProducts,
}: UseShopProductManagementProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variantData, setVariantData] = useState<VariantData>({
    sku: '',
    name: '',
    attributes: '{}',
    price_adjustment: 0,
    stock: 0,
  });

  const handleManageVariants = useCallback(async (product: Product) => {
    try {
      const fullProduct = await adminShopAPI.getProduct(product.id);
      setSelectedProduct(fullProduct);
      setVariantData({
        sku: '',
        name: '',
        attributes: '{}',
        price_adjustment: 0,
        stock: 0,
      });
      return fullProduct;
    } catch {
      onError('Failed to load product details');
      return null;
    }
  }, [onError]);

  const handleAddVariant = useCallback(async () => {
    if (!selectedProduct || !variantData.name || !variantData.sku) {
      onError('Name and SKU are required');
      return false;
    }

    try {
      await adminShopAPI.addVariant(selectedProduct.id, variantData);
      onSuccess('Variant added successfully');
      
      const updated = await adminShopAPI.getProduct(selectedProduct.id);
      setSelectedProduct(updated);
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === updated.id ? updated : p)
      );
      setVariantData({
        sku: '',
        name: '',
        attributes: '{}',
        price_adjustment: 0,
        stock: 0,
      });
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add variant';
      onError(message);
      return false;
    }
  }, [selectedProduct, variantData, onSuccess, onError, setProducts]);

  const handleUpdateInventory = useCallback(async (
    variantId: number,
    quantity: number,
    operation: 'set' | 'add' | 'subtract'
  ) => {
    try {
      await adminShopAPI.adjustInventory({ variant_id: variantId, quantity, operation });
      onSuccess('Inventory updated successfully');
      
      if (selectedProduct) {
        const updated = await adminShopAPI.getProduct(selectedProduct.id);
        setSelectedProduct(updated);
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === updated.id ? updated : p)
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update inventory';
      onError(message);
    }
  }, [selectedProduct, onSuccess, onError, setProducts]);

  const handleImagesChange = useCallback((updatedImages: Product['images']) => {
    if (selectedProduct) {
      setSelectedProduct({ ...selectedProduct, images: updatedImages });
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === selectedProduct.id ? { ...p, images: updatedImages } : p
        )
      );
    }
  }, [selectedProduct, setProducts]);

  return {
    selectedProduct,
    setSelectedProduct,
    variantData,
    setVariantData,
    handleManageVariants,
    handleAddVariant,
    handleUpdateInventory,
    handleImagesChange,
  };
}
