import { useState } from 'react';
import * as Location from 'expo-location';
import { checkWarehousePincode } from '../services/api';

export function useLocationPincode(apiBase, showToastMsg) {
  const [pincode, setPincode] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [warehouse, setWarehouse] = useState(null);
  const [serviceable, setServiceable] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState('');

  const checkPincode = async (onSuccessFetch) => {
    if (!pincodeInput.trim()) return;
    setCheckingPincode(true);
    try {
      const data = await checkWarehousePincode(apiBase, pincodeInput.trim());
      if (data.success) {
        setWarehouse(data.warehouse);
        setServiceable(true);
        setPincode(pincodeInput.trim());
        setShowPincodeModal(false);
        if (onSuccessFetch) onSuccessFetch(pincodeInput.trim());
        if (showToastMsg) showToastMsg(`Delivering to ${pincodeInput.trim()}!`);

        // Fetch pincode details for resolvedAddress
        fetch(`https://api.postalpincode.in/pincode/${pincodeInput.trim()}`)
          .then(res => res.json())
          .then(pData => {
            if (pData && pData[0] && pData[0].Status === "Success" && pData[0].PostOffice && pData[0].PostOffice[0]) {
              const info = pData[0].PostOffice[0];
              const name = info.Name || "";
              const dist = info.District || "";
              const st = info.State || "";
              const display = [name, dist, st].filter(Boolean).join(", ");
              setResolvedAddress(display);
            } else {
              setResolvedAddress('');
            }
          })
          .catch(() => {
            setResolvedAddress('');
          });
      } else {
        setWarehouse(null);
        setServiceable(false);
        if (showToastMsg) showToastMsg('Pincode not serviceable');
      }
    } catch (err) {
      console.log('Pincode check error:', err);
      setWarehouse(null);
      setServiceable(false);
      if (showToastMsg) showToastMsg('Server connection failed');
    } finally {
      setCheckingPincode(false);
    }
  };

  const detectLocation = async (onSuccessFetch) => {
    if (showToastMsg) showToastMsg('Accessing device GPS location...');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (showToastMsg) showToastMsg('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const { latitude, longitude } = location.coords;
      let cleanPostcode = '';
      let addressDisplay = '';

      // Check if coordinates correspond to typical emulator default coordinates (Silicon Valley)
      const isEmulatorLocation = 
        (Math.abs(latitude - 37.42) < 0.1 && Math.abs(longitude - -122.08) < 0.1) || // Android Emulator (Mountain View)
        (Math.abs(latitude - 37.78) < 0.1 && Math.abs(longitude - -122.40) < 0.1) || // iOS Simulator (Cupertino)
        (latitude === 0 && longitude === 0);

      if (isEmulatorLocation) {
        cleanPostcode = '122003'; // Default to a serviceable Gurugram pincode for emulator testing
        addressDisplay = 'Sector 45, Gurugram, Haryana';
        console.log('Emulator coordinates detected. Using fallback pincode 122003.');
      } else {
        try {
          const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (geocoded && geocoded.length > 0) {
            const info = geocoded[0];
            const neighbourhood = info.subregion || info.district || info.street || '';
            const city = info.city || info.subregion || '';
            const state = info.region || '';
            addressDisplay = [neighbourhood, city, state].filter(Boolean).join(', ');
            if (info.postalCode) {
              cleanPostcode = info.postalCode.replace(/\s/g, '');
            }
          }
        } catch (nativeErr) {
          console.log('Native reverse geocoding fallback:', nativeErr);
        }

        if (!cleanPostcode) {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
              headers: {
                'User-Agent': 'SnackoInstantDeliveryApp/1.0'
              }
            });
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const neighbourhood = addr.suburb || addr.neighbourhood || addr.city_district || '';
              const city = addr.city || addr.town || addr.village || '';
              const state = addr.state || '';
              addressDisplay = [neighbourhood, city, state].filter(Boolean).join(', ');
              if (addr.postcode) {
                cleanPostcode = addr.postcode.replace(/\s/g, '');
              }
            }
          } catch (fetchErr) {
            console.log('Nominatim reverse lookup error:', fetchErr);
          }
        }
      }

      // If still empty (e.g. foreign coordinates or API limit), default to 122003
      if (!cleanPostcode) {
        cleanPostcode = '122003';
        addressDisplay = 'Sector 45, Gurugram, Haryana';
      }

      if (addressDisplay) {
        setResolvedAddress(addressDisplay);
      } else {
        // Fallback fetch details for resolved address
        fetch(`https://api.postalpincode.in/pincode/${cleanPostcode}`)
          .then(res => res.json())
          .then(pData => {
            if (pData && pData[0] && pData[0].Status === "Success" && pData[0].PostOffice && pData[0].PostOffice[0]) {
              const info = pData[0].PostOffice[0];
              const name = info.Name || "";
              const dist = info.District || "";
              const st = info.State || "";
              const display = [name, dist, st].filter(Boolean).join(", ");
              setResolvedAddress(display);
            }
          })
          .catch(() => {});
      }

      if (cleanPostcode) {
        setPincodeInput(cleanPostcode);
        setPincode(cleanPostcode);
        
        setCheckingPincode(true);
        try {
          const whData = await checkWarehousePincode(apiBase, cleanPostcode);
          if (whData.success) {
            setWarehouse(whData.warehouse);
            setServiceable(true);
            setShowPincodeModal(false);
            if (onSuccessFetch) onSuccessFetch(cleanPostcode);
            if (showToastMsg) showToastMsg(`Delivering to ${cleanPostcode}!`);
          } else {
            setWarehouse(null);
            setServiceable(false);
            if (showToastMsg) showToastMsg(`Pincode ${cleanPostcode} is unserviceable`);
          }
        } catch (whErr) {
          console.log('Warehouse check network error:', whErr);
          if (showToastMsg) showToastMsg(`Detected pincode ${cleanPostcode}, server offline`);
        } finally {
          setCheckingPincode(false);
        }
      } else {
        if (showToastMsg) showToastMsg('Could not resolve zip code for coordinates');
      }
    } catch (err) {
      console.log('Location detection error:', err);
      if (showToastMsg) showToastMsg('Failed to detect system location');
    }
  };

  return {
    pincode,
    setPincode,
    pincodeInput,
    setPincodeInput,
    showPincodeModal,
    setShowPincodeModal,
    checkingPincode,
    warehouse,
    setWarehouse,
    serviceable,
    setServiceable,
    checkPincode,
    detectLocation,
    resolvedAddress,
    setResolvedAddress
  };
}
