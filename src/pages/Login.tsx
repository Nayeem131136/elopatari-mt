import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🎁</span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? "এলোপাতাড়ি - MT তে নতুন অ্যাকাউন্ট তৈরি করুন" : "Sign in to এলোপাতাড়ি - MT"}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
          <Button
            variant="outline"
            className="w-full rounded-full font-semibold"
            onClick={() => toast.info("Google Sign-in requires Lovable Cloud. Enable it to add authentication.")}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                {isSignUp ? "or sign up with email" : "or sign in with email"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {isSignUp && (
              <div>
                <Label htmlFor="name">নাম</Label>
                <Input id="name" type="text" placeholder="আপনার পুরো নাম" className="rounded-lg mt-1" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="rounded-lg mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="rounded-lg mt-1" />
            </div>
            {isSignUp && (
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" className="rounded-lg mt-1" />
              </div>
            )}
          </div>

          <Button
            className="w-full rounded-full font-semibold btn-glow"
            onClick={() => toast.info("Authentication requires Lovable Cloud. Enable it to add user login.")}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
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
