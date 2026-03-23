export const getCurrentUser = () => {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('access_token='));
    
    if (tokenCookie) {
      try {
        const token = tokenCookie.split('=')[1].replace('Bearer ', '');
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return { id: parseInt(payload.sub) };
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  export const isAuthenticated = () => {
    return getCurrentUser();
  };