import React from 'react';
import OrdersScreen from '../screens/OrdersScreen';
import { useRouter } from 'expo-router';
import { getInitialApiUrl } from '../services/api';

export default function OrdersRoute() {
  const router = useRouter();
  const apiBase = getInitialApiUrl();

  return (
    <OrdersScreen 
      apiBase={apiBase}
      token=""
      onBack={() => router.back()}
    />
  );
}
