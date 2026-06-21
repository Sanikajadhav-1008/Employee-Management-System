import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children, role }) => {
  const isValid = localStorage.getItem('valid')
  if (!isValid) {
    return <Navigate to={role === 'admin' ? '/adminlogin' : '/employee_login'} />
  }
  return children
}

export default PrivateRoute
