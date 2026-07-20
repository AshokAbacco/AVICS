import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { email: 'ramesh.kulkarni@avics.gov.in', password: '' },
  })
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = (data) => {
    login(data)
    const redirectTo = location.state?.from || '/dashboard'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-500">Sign in to access the claims management portal.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email address"
          icon={Mail}
          type="email"
          placeholder="you@avics.gov.in"
          error={errors.email?.message}
          {...register('email')}
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">Password</span>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-base pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <span className="mt-1 block text-xs text-danger">{errors.password.message}</span>}
        </label>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
            Remember me
          </label>
          <a href="#" className="font-medium text-primary hover:underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        Demo build — any email/password combination will sign you in.
      </p>
    </div>
  )
}