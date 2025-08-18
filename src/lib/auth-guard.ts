import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const ensureAuthenticated = (next: () => void) => {
    if (user) {
      next();
    } else {
      navigate('/registrazione');
    }
  };

  return { ensureAuthenticated };
};