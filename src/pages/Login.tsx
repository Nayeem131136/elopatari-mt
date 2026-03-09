import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("ইমেইল ও পাসওয়ার্ড দিন");
      return;
    }
    if (isSignUp) {
      if (!fullName.trim()) { toast.error("নাম লিখুন"); return; }
      if (password !== confirmPassword) { toast.error("পাসওয়ার্ড মিলছে না"); return; }
      if (password.length < 6) { toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"); return; }
    }

    setSubmitting(true);
    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করুন।");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("সফলভাবে লগইন হয়েছে! 🎉");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">✨</span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? "এলোপাতাড়ি - MT তে নতুন অ্যাকাউন্ট তৈরি করুন" : "Sign in to এলোপাতাড়ি - MT"}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                {isSignUp ? "sign up with email" : "sign in with email"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {isSignUp && (
              <div>
                <Label htmlFor="name">নাম</Label>
                <Input id="name" type="text" placeholder="আপনার পুরো নাম" className="rounded-lg mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="rounded-lg mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="rounded-lg mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {isSignUp && (
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" className="rounded-lg mt-1" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            )}
          </div>

          <Button
            className="w-full rounded-full font-semibold btn-glow"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "অপেক্ষা করুন..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>Already have an account?{" "}<button onClick={() => setIsSignUp(false)} className="text-primary hover:underline font-medium">Sign In</button></>
            ) : (
              <>Don't have an account?{" "}<button onClick={() => setIsSignUp(true)} className="text-primary hover:underline font-medium">Sign Up</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
