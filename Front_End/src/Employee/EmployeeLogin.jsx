import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const EmployeeLogin = () => {
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  axios.defaults.withCredentials = true

  const handleSubmit = (event) => {
    event.preventDefault()
    axios.post('http://localhost:5000/employee/employee_login', values)
      .then(result => {
        if (result.data.loginStatus) {
          localStorage.setItem('valid', true)
          localStorage.setItem('employeeId', result.data.id)
          navigate('/employee')
        } else {
          setError(result.data.Error)
        }
      })
      .catch(() => {
        setError('Server error. Please try again.')
      })
  }

  return (
    <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
      <div className='p-4 rounded w-25 border loginForm'>
        <div className='text-center mb-4'>
          <div style={{ fontSize: '42px' }}>👤</div>
          <h3 className='mt-2'>Employee Login</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Access your personal dashboard</p>
        </div>
        {error && <div className='alert alert-warning py-2'>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='form-label'><strong>Email</strong></label>
            <input type='email' placeholder='Enter Email' autoComplete='off'
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className='form-control rounded-3' />
          </div>
          <div className='mb-4'>
            <label className='form-label'><strong>Password</strong></label>
            <input type='password' placeholder='Enter Password'
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              className='form-control rounded-3' />
          </div>
          <button className='btn btn-primary w-100 mb-2 rounded-3'>Login</button>
          <button type='button' className='btn btn-outline-light w-100 rounded-3'
            onClick={() => navigate('/')}>← Back to Home</button>
        </form>
      </div>
    </div>
  )
}

export default EmployeeLogin
