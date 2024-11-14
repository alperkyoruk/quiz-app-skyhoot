import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken } from '@/pages/services/auth';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if(!token) {
      setIsAuthenticated(false);
      router.push('/login');
      return;
    }
    const decodedToken = jwtDecode(token);
    if(decodedToken.exp * 1000 < new Date().getTime()) {
      console.log('token will expire at: ', new Date(decodedToken.exp * 1000));
      setIsAuthenticated(false);
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

 

  return isAuthenticated;

};
