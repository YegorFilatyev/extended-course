import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserById, updateUser } from '../services/api';

const ProfilePage = () => {
  const { user, checkAuth } = useAuth();
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await getUserById(user.id);
      if (response.user) {
        setUserData(response.user);
        setEmail(response.user.email);
        setName(response.user.user_name);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await updateUser(user.id, email, name);
      if (response.message) {
        setMessage('Данные успешно обновлены');

        setTimeout(async () => {await checkAuth();}, 2000);
        await fetchUserData();
      } else {
        setMessage('Ошибка при обновлении');
      }
    } catch (error) {
      setMessage('Ошибка при обновлении');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="profile-container">
      <h2>Профиль пользователя</h2>
      
      {message && (
        <div className={message.includes('Ошибка') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;