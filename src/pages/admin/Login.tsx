
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowLeft } from 'lucide-react';
import { login } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialize } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    initialize();
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate, initialize]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message === "Invalid login credentials" 
        ? "Identifiants incorrects." 
        : "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-[40%] bg-secondary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 text-center p-12 text-white">
          <h1 className="font-serif text-5xl font-bold mb-4">Le Gourmet</h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-xl text-accent/80 font-light italic">
            "L'excellence gastronomique au bout des doigts."
          </p>
          <p className="mt-8 text-sm uppercase tracking-widest opacity-60">Administration</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-8 bg-slate-50 relative">
        <Button 
          variant="ghost" 
          className="absolute top-8 left-8 text-slate-500 hover:text-slate-800"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft size={16} />}
        >
          Retour au site
        </Button>

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Connexion</h2>
            <p className="text-slate-500 text-sm">Entrez vos identifiants pour accéder au tableau de bord.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input 
              label="Email" 
              type="email" 
              placeholder="admin@legourmet.fr"
              {...register('email')}
              error={errors.email?.message}
              iconLeft={<Mail size={18} />}
              className="bg-slate-50 border-slate-200 focus:border-primary text-slate-800"
            />

            <div className="relative">
              <Input 
                label="Mot de passe" 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
                iconLeft={<Lock size={18} />}
                className="bg-slate-50 border-slate-200 focus:border-primary text-slate-800"
              />
              <button
                type="button"
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800">
                <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                Se souvenir de moi
              </label>
              <a href="#" className="text-primary hover:underline font-medium">Mot de passe oublié ?</a>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 shadow-lg shadow-primary/20" 
              isLoading={isSubmitting}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Le Gourmet Élégant. Système de gestion sécurisé.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
