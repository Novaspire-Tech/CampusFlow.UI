import { useState, useEffect } from 'react';
import { whatsappApi } from '../services/WhatsappApi.tsx';

export const useWhatsAppConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await whatsappApi.getConfiguration();
      setConfig(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: any) => {
    try {
      setLoading(true);
      const data = await whatsappApi.saveConfiguration(configData);
      setConfig(data);
      setError(null);
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await whatsappApi.testConnection();
      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    saveConfig,
    testConnection,
    refetch: fetchConfig,
  };
};