import Keycloak from 'keycloak-js';
import { useEffect,useState,useCallback } from 'react';
const keycloak = new Keycloak({
  url: 'http://localhost:8080/',
  realm: 'myrealm',
  clientId: 'iheb',
});
const useAuth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false,
        });

        console.log('Authenticated:', authenticated);

        if (authenticated) {
          const fetchedToken = keycloak.token;
          const tokenParsed = keycloak.tokenParsed || {};
          const fetchedRoles = tokenParsed.realm_access?.roles || [];
          const userId = tokenParsed.sub;
          const email = tokenParsed.email;
          console.log('Fetched Token:', fetchedToken);
          console.log('Roles:', fetchedRoles);
          console.log('User ID:', userId);
          console.log('email:', email);
          setToken(fetchedToken);
          setRoles(fetchedRoles);
          setUserId(userId);
          setIsLogin(true);
          setEmail(email);
          localStorage.setItem('token', fetchedToken);
          localStorage.setItem('roles', JSON.stringify(fetchedRoles)); 
          localStorage.setItem('userId', userId);
          localStorage.setItem('email',email)

          const refreshToken = async () => {
            try {
              await keycloak.updateToken(70);
              localStorage.setItem('token', keycloak.token);
              setToken(keycloak.token); 
            } catch (error) {
              console.error('Failed to refresh token', error);
            }
          };

          setInterval(refreshToken, 60000);
        } else {
          setIsLogin(false);
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setIsLogin(false);
      }
    };

    initKeycloak();
  }, []);
  const signOut = useCallback(() => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
    localStorage.clear();
    setIsLogin(false);
  }, []);

  return { isLogin, token, roles, userId, email, signOut };
};



export default useAuth;
