

import React, { useState } from 'react';
import './notification.scss'; 
import NotificationList from './NotificationList'; 

const NotificationIcon = ({ count }) => {
  const [showNotifications, setShowNotifications] = useState(false); 

  const notifications = [
    { employee: 'Mahdi', leaveType: 'sans soldes', startDate: '12/12/2024', endDate: '12/12/2024' },
    { employee: 'Hanen', leaveType: 'maladie', startDate: '15/07/2024', endDate: '16/07/2024' },
  ];


  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="notification-icon">
      <i className="fas fa-bell" style={{ color: "black" }} onClick={toggleNotifications}></i>
      {count > 0 && (
        <span className="notification-count">{count}</span>
      )}
      {showNotifications && (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
};

export default NotificationIcon;
