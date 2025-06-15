import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('tokenType', 'bearer');
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate('/chat');
    } else {
      toast({
        title: "Login Failed",
        description: "Authentication failed",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
    </div>
  );
};

export default GoogleCallback;