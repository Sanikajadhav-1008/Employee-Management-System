import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [values, setValues] = useState({ email: '', password: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()
  axios.defaults.withCredentials = true

  const switchMode = (newMode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
    setValues({ email: '', password: '' })
    setConfirmPassword('')
  }

  const handleLogin = (event) => {
    event.preventDefault()
    setError(null)
    axios.post('http://localhost:5000/auth/adminlogin', values)
      .then(result => {
        if (result.data.loginStatus) {
          localStorage.setItem('valid', true)
          navigate('/dashboard')
        } else {
          setError(result.data.Error)
        }
      })
      .catch(err => console.log(err))
  }

  const handleRegister = (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (values.password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    axios.post('http://localhost:5000/auth/register', values)
      .then(result => {
        if (result.data.Status) {
          setSuccess('Registration successful! You can now log in.')
          setValues({ email: values.email, password: '' })
          setConfirmPassword('')
          setMode('login')
        } else {
          setError(result.data.Error)
        }
      })
      .catch(() => setError('Server error. Please try again.'))
  }

  return (
    <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
      <div className='p-4 rounded w-25 border loginForm'>
        <div className='text-center mb-4'>
          <div style={{ fontSize: '42px' }}>🛡️</div>
          <h3 className='mt-2'>{mode === 'login' ? 'Admin Login' : 'Admin Registration'}</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Employee Management System</p>
        </div>

        {/* Tab switcher */}
        <div className='d-flex mb-3 rounded-3 overflow-hidden border'>
          <button
            type='button'
            className={`btn w-50 rounded-0 ${mode === 'login' ? 'btn-success' : 'btn-outline-light'}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type='button'
            className={`btn w-50 rounded-0 ${mode === 'register' ? 'btn-success' : 'btn-outline-light'}`}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>

        {error && <div className='alert alert-warning py-2'>{error}</div>}
        {success && <div className='alert alert-success py-2'>{success}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className='mb-3'>
              <label className='form-label'><strong>Email</strong></label>
              <input type='email' placeholder='Enter Email' autoComplete='off'
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                className='form-control rounded-3' />
            </div>
            <div className='mb-4'>
              <label className='form-label'><strong>Password</strong></label>
              <input type='password' placeholder='Enter Password'
                value={values.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                className='form-control rounded-3' />
            </div>
            <button className='btn btn-success w-100 mb-2 rounded-3'>Login</button>
            <button type='button' className='btn btn-outline-light w-100 rounded-3'
              onClick={() => navigate('/')}>← Back to Home</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className='mb-3'>
              <label className='form-label'><strong>Email</strong></label>
              <input type='email' placeholder='Enter Email' autoComplete='off'
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                className='form-control rounded-3' />
            </div>
            <div className='mb-3'>
              <label className='form-label'><strong>Password</strong></label>
              <input type='password' placeholder='Set Password (min. 6 characters)'
                value={values.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                className='form-control rounded-3' />
            </div>
            <div className='mb-4'>
              <label className='form-label'><strong>Confirm Password</strong></label>
              <input type='password' placeholder='Re-enter Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='form-control rounded-3' />
            </div>
            <button className='btn btn-success w-100 mb-2 rounded-3'>Register</button>
            <button type='button' className='btn btn-outline-light w-100 rounded-3'
              onClick={() => navigate('/')}>← Back to Home</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
