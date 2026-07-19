import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Checkbox, Input } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/Feedback';
import { applyFieldErrors, useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const notice =
    searchParams.get('reason') === 'password-changed'
      ? 'Your password was changed. Please sign in again.'
      : null;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await login.mutateAsync(values);
    } catch (error) {
      setFormError(applyFieldErrors<LoginForm>(error, setError));
    }
  });

  return (
    <div className="flex min-h-screen bg-surface-page">
      {/* Brand panel. Decorative, so it is hidden from assistive tech and on mobile. */}
      <div className="relative hidden w-1/2 overflow-hidden bg-surface-dark lg:flex" aria-hidden="true">
        <img
          src="/bg-login.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/*
          The overlay runs on the navy ramp rather than one-off hexes, so the panel
          stays the same blue as the sidebar and the landing page hero.
        */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-dark via-primary/90 to-primary-500/75" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <img src="/Searah-logo-white.png" alt="" className="h-20 w-auto self-start" />

          <div className="max-w-md">
            {/* primary-300 is a fill-only tone on white, but on navy it is the light
                side of the pair and carries the contrast. */}
            <p className="text-label uppercase text-primary-300">Content management</p>

            <h1 className="mt-4 text-display leading-tight">Energy that moves two nations forward.</h1>

            <div className="mt-8 h-1 w-16 rounded-full bg-orange" />

            <p className="mt-6 text-white/80">
              The content management system behind the Searah corporate portal, publishing across
              Indonesia and Malaysia.
            </p>
          </div>

          <p className="text-sm text-white/60">© {new Date().getFullYear()} Searah Energy Holdings</p>
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[600px]    sm:p-10">
          <img src="/Searah-logo-flat-colour.png" alt="Searah" className="mb-8 h-10 w-auto lg:hidden" />

          <p className="text-label uppercase text-primary-500">Welcome back</p>
          <h1 className="mt-2 text-h2 text-gray-900">Sign in</h1>
          <p className="mt-2 text-sm text-gray-500">Access the Searah content management system.</p>

          {notice && (
            <div className="mt-6 rounded-field border border-primary/20 bg-primary-100 px-4 py-3 text-sm text-primary-700">
              {notice}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate>
            {formError && <FormAlert message={formError} />}

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@searah.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                required
                error={errors.password?.message}
                className="[&_input]:pr-11"
                {...register('password')}
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                // Positioned to sit on the input row, allowing for the label above.
                className="absolute right-3 top-[38px] rounded p-1 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            <Checkbox
              label="Keep me signed in"
              hint="Only on a device you trust."
              {...register('rememberMe')}
            />

            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting || login.isPending}>
              Sign in
            </Button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-8 rounded-field border border-gray-200 bg-surface-page p-4">
              <p className="text-label uppercase text-gray-500">Development accounts</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>superadmin@searah.com — SearahSuper2026!</li>
                <li>admin@searah.com — SearahAdmin2026!</li>
                <li>editor@searah.com — SearahEditor2026!</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
