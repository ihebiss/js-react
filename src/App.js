/* import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import './dx-styles.scss';
import LoadPanel from 'devextreme-react/load-panel';
import { NavigationProvider } from './contexts/navigation';
import { AuthProvider, useAuth } from './contexts/auth';
import { useScreenSizeClass } from './utils/media-query';
import Content from './Content';
import UnauthenticatedContent from './UnauthenticatedContent';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadPanel visible={true} />;
  }

  if (user) {
    return <Content />;
  }

  return <UnauthenticatedContent />;
}

export default function Root() {
  const screenSizeClass = useScreenSizeClass();

  return (
    <Router>
      <AuthProvider>
        <NavigationProvider>
          <div className={`app ${screenSizeClass}`}>
            <App />
          </div>
        </NavigationProvider>
      </AuthProvider>
    </Router>
  );
}
 */
/////////////



////////////////

import React from 'react';
import './dx-styles.scss';
import { NavigationProvider } from './contexts/navigation';
import { AuthProvider } from './contexts/auth';
import { useScreenSizeClass } from './utils/media-query';
import Protected from './componentss/Protected';
import Public from './componentss/Public';
import useAuth from './hooks/useAuth';
import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import { navigation } from './app-navigation';
import { SideNavigationMenu } from './components';
const App = () => {
  const {isLogin, token, roles,userId} = useAuth();
console.log('token',token);
console.log('roles',roles);
console.log('Id',userId);
  const filteredNavigation = navigation.filter((item) => {
    if (item.visible) {
      return item.visible(roles);
    }
    return true;
  });

  return (
    <NavigationProvider navigation={filteredNavigation}>
      {isLogin ? <Protected /> : <Public />}
    </NavigationProvider>
  );
};


export default function Root() {
  const screenSizeClass = useScreenSizeClass();

  return (
    <AuthProvider>
      <NavigationProvider>
        <div className={`app ${screenSizeClass}`}>
          <App />
        </div>
      </NavigationProvider>
    </AuthProvider>
  );
}
/*

export default function Root() {
  const screenSizeClass = useScreenSizeClass();

  return (
    <AuthProvider>
      <NavigationProvider>
      <div className={`app ${screenSizeClass}`}>
        <App />
      </div>
      </NavigationProvider>
    </AuthProvider>
  );
}


  /*const [isLogin, token] = useAuth();
  console.log("isLogin : ", isLogin)
  console.log("token : ", token)
  return isLogin ? <Protected token ={token} /> : <Public />;*/
  