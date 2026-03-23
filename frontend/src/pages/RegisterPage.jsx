import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    name: false
  });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    if (!email) {
      return 'Email не может быть пустым';
    }
    
    if (email.length < 10) {
      return 'Email должен содержать минимум 10 символов';
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Неверный формат email';
    }
    
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Пароль не может быть пустым';
    }
    
    if (password.length < 8) {
      return 'Пароль должен содержать минимум 8 символов';
    }
    
    if (!/[A-Z]/.test(password)) {
      return 'Пароль должен содержать хотя бы одну заглавную букву';
    }
    
    if (!/[a-z]/.test(password)) {
      return 'Пароль должен содержать хотя бы одну строчную букву';
    }
    
    if (!/\d/.test(password)) {
      return 'Пароль должен содержать хотя бы одну цифру';
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Пароль должен содержать хотя бы один специальный символ';
    }
    
    return '';
  };

  const validateName = (name) => {
    if (!name) {
      return 'Имя не может быть пустым';
    }
    
    if (name.length < 2) {
      return 'Имя должно содержать минимум 2 символа';
    }
    
    if (name.length > 70) {
      return 'Имя не должно превышать 70 символов';
    }
    
    const nameRegex = /^[a-zA-Zа-яА-Я\s\-]+$/;
    if (!nameRegex.test(name)) {
      return 'Имя может содержать только буквы, пробелы и дефисы';
    }
    
    return '';
  };

  useEffect(() => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nameError = validateName(name);
    
    setErrors({
      email: emailError,
      password: passwordError,
      name: nameError
    });
    
    const isValid = !emailError && !passwordError && !nameError && 
                    email && password && name;
    setIsFormValid(isValid);
  }, [email, password, name]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      email: true,
      password: true,
      name: true
    });
    
    if (!isFormValid) {
      return;
    }
    
    setSubmitError('');
    setLoading(true);

    try {
      const response = await register(email, password, name);
      if (response.id) {
        navigate('/login');
      } else {
        setSubmitError(response.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setSubmitError('Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Регистрация</h2>
        {submitError && <div className="error-message">{submitError}</div>}
        <form onSubmit={handleSubmit} onValidate>
          <div className="form-group">
            <label htmlFor='name'>Имя</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              className={touched.name && errors.name ? 'input-error' : ''}
              required
            />
            {touched.name && errors.name && (
              <div className="field-error">{errors.name}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor='email'>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={touched.email && errors.email ? 'input-error' : ''}
              required
            />
            {touched.email && errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              className={touched.password && errors.password ? 'input-error' : ''}
              required
            />
            {touched.password && errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>
          <button type="submit" disabled={loading || !isFormValid} className="btn-primary">
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;