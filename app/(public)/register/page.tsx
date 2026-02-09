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
import { registerUser } from "@/lib/api/auth";
import { useToggle } from "@/lib/hooks/useToggle";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PROTECTED_ROUTES } from "@/lib/constants/routes";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Имя обязательно" }),
    email: z.string().email({ message: "Некорректный email" }),
    password: z
      .string()
      .min(8, { message: "Пароль должен содержать минимум 8 символов" })
      .regex(/[A-Z]/, {
        message: "Пароль должен содержать хотя бы одну заглавную букву",
      })
      .regex(/[0-9]/, { message: "Пароль должен содержать хотя бы одну цифру" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Пароль должен содержать хотя бы один специальный символ",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
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
    const { confirmPassword, ...payload } = data;

    toggleLoading();

    try {
      await registerUser(payload);
      router.push(PROTECTED_ROUTES.Rooms);
    } catch (_) {
      toast.error("При регистрации произошла ошибка");
    } finally {
      toggleLoading();
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>Создайте новый аккаунт</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Имя</FieldLabel>
                <Input
                  id="name"
                  placeholder="Введите ваше имя"
                  {...register("name")}
                  disabled={isLoading}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  disabled={isLoading}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Пароль</FieldLabel>
                <PasswordInput
                  id="password"
                  placeholder="********"
                  disabled={isLoading}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Подтвердите пароль
                </FieldLabel>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="********"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Зарегистрироваться
            </Button>
            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                У меня уже есть аккаунт
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
