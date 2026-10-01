import { FarmerOrder, MarketplaceProduct } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface SubmitOrderResult {
  success: boolean;
  errorMessage?: string;
}

export async function submitFarmerOrder(order: FarmerOrder, product: MarketplaceProduct): Promise<SubmitOrderResult> {
  try {
    const prev = JSON.parse(localStorage.getItem('dr_plant_farmer_orders') || '[]');
    localStorage.setItem('dr_plant_farmer_orders', JSON.stringify([order, ...prev]));
  } catch {
    return { success: false, errorMessage: 'Could not save the order on this device.' };
  }

  if (!isSupabaseConfigured || !supabase || !product.shopId) {
    return { success: true };
  }

  const { error } = await supabase.from('orders').insert({
    order_code: order.orderId,
    product_id: order.productId,
    shop_id: product.shopId,
    farmer_name: order.farmerName,
    village_address: order.villageAddress,
    phone: order.phone,
    quantity: order.quantity,
    total_amount: order.totalAmount,
    payment_method: order.paymentMethod,
    status: order.status,
  });

  if (error) {
    return { success: false, errorMessage: error.message };
  }

  return { success: true };
}
