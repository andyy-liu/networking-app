import React, { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, signInWithOAuth } = useAuth();

  const handleEmailAuth = async (
    e: React.FormEvent,
    mode: "login" | "signup" | "reset"
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (mode === "login") {
        result = await signIn(email, password);
      } else if (mode === "signup") {
        result = await signUp(email, password);
      } else if (mode === "reset") {
        result = await resetPassword(email);
      }

      if (result?.error) {
        toast({
          title: "Authentication error",
          description: result.error.message,
          variant: "destructive",
        });
      } else if (mode === "signup") {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
      } else if (mode === "reset") {
        toast({
          title: "Password reset email sent",
          description:
            "Please check your email for password reset instructions.",
        });
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast({
        title: "Authentication error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google") => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      toast({
        title: "Authentication error",
        description: `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Networking App
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="login"
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={(e) => handleEmailAuth(e, "login")}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password-login">Password</Label>
                    <Button
                      variant="link"
                      type="button"
                      className="p-0 h-auto text-xs"
                      onClick={() =>
                        handleEmailAuth(new Event("click") as never, "reset")
                      }
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password-login"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={(e) => handleEmailAuth(e, "signup")}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4 grid">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                type="button"
                disabled={loading}
              >
                <Mail className="h-4 w-4" />
                Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
