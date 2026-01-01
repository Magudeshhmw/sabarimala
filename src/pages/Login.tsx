import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/LoginForm';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'owner':
          navigate('/owner');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'user':
          navigate('/user');
          break;
      }
    }
  }, [user, navigate]);

  return <LoginForm />;
}
