import React from 'react';
import MobileAiAssistant from '../components/MobileAiAssistant';
import { useRouter } from 'expo-router';
import { getInitialApiUrl } from '../services/api';

export default function AssistantRoute() {
  const router = useRouter();
  const apiBase = getInitialApiUrl();

  return (
    <MobileAiAssistant 
      visible={true}
      onClose={() => router.back()}
      apiBase={apiBase}
      token=""
      user={null}
      cart={[]}
      addToCart={() => {}}
      pincode=""
      serviceable={false}
      showToastMsg={(msg) => console.log(msg)}
    />
  );
}
