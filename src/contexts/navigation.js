
import React, { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext();

const NavigationProvider = ({ navigation, children }) => {
    const [navigationData, setNavigationData] = useState({ currentPath: '' });

    return (
        <NavigationContext.Provider value={{ navigation, navigationData, setNavigationData }}>
            {children}
        </NavigationContext.Provider>
    );
};

const useNavigation = () => useContext(NavigationContext);

function withNavigationWatcher(Component, path) {
  const WrappedComponent = function (props) {
    const { setNavigationData } = useNavigation();

    useEffect(() => {
      setNavigationData({ currentPath: path });
    }, [setNavigationData]);

    return <Component {...props} />;
  }
  return <WrappedComponent />;
}

export { NavigationProvider, useNavigation, withNavigationWatcher };
