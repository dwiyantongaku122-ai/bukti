import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Gamepad2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function AdminLogin() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login(values);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Gamepad2 className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">wieproject</CardTitle>
          <CardDescription className="text-slate-500">Masukkan credentials untuk akses dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} className="bg-slate-50 border-slate-200 text-slate-800" data-testid="input-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} className="bg-slate-50 border-slate-200 text-slate-800" data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-indigo-600 text-white font-semibold mt-6" data-testid="button-login">
                <Lock className="w-4 h-4 mr-2" />
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
