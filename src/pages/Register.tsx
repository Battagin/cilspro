import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Mail, Lock, User, ArrowLeft, Chrome } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle, user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("error"),
        description: "Le password non corrispondono",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: t("error"),
        description: "Devi accettare i termini e condizioni",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.name);

    if (error) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("success"),
        description: "Registrazione completata! Controlla la tua email per confermare l'account.",
      });
      // Don't navigate immediately, let them check email first
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth">
            <ArrowLeft className="w-4 h-4" />
            Torna alla home
          </Link>
          
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-gradient-hero rounded-lg shadow-card">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold">
              <span className="text-primary">CILS</span>
              <span className="text-secondary font-light">pro</span>
            </div>
          </div>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">{t("register")}</CardTitle>
              <CardDescription>
                Crea il tuo account CILSpro gratuitamente
              </CardDescription>
            </div>
            <LanguageSelector variant="compact" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hide Google OAuth button if not configured */}
            <div className="text-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              Accesso con Google non disponibile al momento
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  oppure
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Il tuo nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@esempio.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimo 6 caratteri"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ripeti la password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Accetto i{" "}
                  <Link to="/termini" className="text-secondary hover:underline">
                    termini e condizioni
                  </Link>{" "}
                  e la{" "}
                  <Link to="/privacy" className="text-secondary hover:underline">
                    privacy policy
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !formData.acceptTerms}>
                {isLoading ? t("loading") : t("register")}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Hai già un account? </span>
              <Link to="/login" className="text-secondary hover:underline font-medium">
                {t("login")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;