"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import Link from "next/link";
import { loginUser } from "@/lib/api/auth";
import { useToggle } from "@/lib/hooks/useToggle";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PROTECTED_ROUTES } from "@/lib/constants/routes";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Некорректный email" }),
  password: z.string().min(1, { message: "Пароль обязателен" }),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [isLoading, toggleLoading] = useToggle();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = async (data: FormValues) => {
    toggleLoading();

    try {
      await loginUser(data);
      router.push(PROTECTED_ROUTES.Rooms);
    } catch (_) {
      toast.error("При входе произошла ошибка");
    } finally {
      toggleLoading();
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>Введите свои данные для входа</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Пароль</FieldLabel>
                <PasswordInput
                  id="password"
                  placeholder="********"
                  {...register("password")}
                  disabled={isLoading}
                />
                <FieldError errors={[errors.password]} />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
            <div className="text-center text-sm">
              <Link
                href="/register"
                className="text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Нет аккаунта? Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
