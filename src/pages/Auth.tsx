import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import spiritLogo from '@/assets/spirit-logo.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, signIn, signUp } = useAuth();
  const { t } = useLanguage();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(emailOrUsername, password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
        }
      } else {
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return;
        }
        
        const { error } = await signUp(emailOrUsername, password, firstName, lastName, username);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success!",
            description: "Please check your email to verify your account.",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/40">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={spiritLogo} 
              alt="Spirit Logo" 
              className="h-16 w-16 object-contain filter brightness-0 invert"
            />
          </div>
          <CardTitle className="font-playfair text-2xl text-foreground">
            {isLogin ? t('signIn') : t('signUp')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? 'Welcome back to Spirit of Candles' : 'Join the Spirit of Candles family'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder={t('firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-background/50 border-border/40"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder={t('lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-background/50 border-border/40"
                  />
                </div>
              </div>
            )}
            
            {!isLogin && (
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-background/50 border-border/40"
                />
              </div>
            )}
            
            <div>
              <Input
                type={isLogin ? "text" : "email"}
                placeholder={isLogin ? "Email or Username" : t('email')}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="bg-background/50 border-border/40"
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 border-border/40"
              />
            </div>
            
            {!isLogin && (
              <div>
                <Input
                  type="password"
                  placeholder={t('confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border/40"
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isLogin ? t('signIn') : t('signUp'))}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              <Button
                variant="link"
                className="p-0 ml-1 text-primary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? t('signUp') : t('signIn')}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;