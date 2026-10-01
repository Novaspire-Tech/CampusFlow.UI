import { useState, useEffect } from 'react';
import { staffService } from '../../../services/hr/staffDirectoryService';

export const useStaffPhoto = (photoPath?: string) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!photoPath || photoPath.trim() === '') {
        setPhotoUrl(null);
        setError(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const blob = await staffService.getProfilePicture(photoPath);
        
        if (!blob || blob.size === 0) {
          throw new Error('Received empty blob');
        }

        const url = URL.createObjectURL(blob);
        setPhotoUrl(url);
      } catch (error: any) {
        console.error('Error fetching staff photo:', error);
        setError(true);
        setPhotoUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();

    // Cleanup function
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoPath]);

  return { photoUrl, loading, error };
};