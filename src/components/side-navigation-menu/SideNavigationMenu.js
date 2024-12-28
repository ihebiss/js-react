import React, { useState, useEffect, useRef, useCallback } from 'react';
import TreeView from 'devextreme-react/tree-view';
import { useNavigation } from '../../contexts/navigation';
import { useScreenSize } from '../../utils/media-query';
import './SideNavigationMenu.scss';
import * as events from 'devextreme/events';
import { useNavigate } from 'react-router-dom';

const SideNavigationMenu = ({ children, openMenu, compactMode, onMenuReady }) => {
  const { isLarge } = useScreenSize();
  const { navigation } = useNavigation();
  const navigate = useNavigate();

  const normalizePath = () => {
    return navigation.map((item) => ({
      ...item,
      expanded: isLarge,
      path: item.path && !(/^\//.test(item.path)) ? `/${item.path}` : item.path,
    }));
  };

  const items = normalizePath();

  const treeViewRef = useRef(null);
  const wrapperRef = useRef();

  const getWrapperRef = useCallback((element) => {
    const prevElement = wrapperRef.current;
    if (prevElement) {
      events.off(prevElement, 'dxclick');
    }

    wrapperRef.current = element;
    if (element) {
      events.on(element, 'dxclick', (e) => {
        console.log('Click event:', e);
        if (typeof openMenu === 'function') {
          openMenu(e);
        } else {
          console.error('openMenu is not a function');
        }
      });
    }
  }, [openMenu]);

  const onItemClick = (e) => {
    const item = e.itemData;
    if (item.path) {
      navigate(item.path);
    }
  };

  useEffect(() => {
    const treeView = treeViewRef.current && treeViewRef.current.instance;
    if (!treeView) return;

    if (compactMode) {
      treeView.collapseAll();
    }
  }, [compactMode]);

  return (
    <div className={'dx-swatch-additional side-navigation-menu'} ref={getWrapperRef}>
      {children}
      <div className={'menu-container'}>
        <TreeView
          ref={treeViewRef}
          items={items}
          keyExpr={'path'}
          selectionMode={'single'}
          focusStateEnabled={false}
          expandEvent={'click'}
          onItemClick={onItemClick}
          onContentReady={onMenuReady}
          width={'100%'}
        />
      </div>
    </div>
  );
};

export default SideNavigationMenu;