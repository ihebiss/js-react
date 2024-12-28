import React from 'react';
import './notification.scss';

const NotificationList = ({ notifications }) => {
  return (
    <div className="notification-list">
      <h3>Notifications</h3>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id} className="notification-item">
            <div className="notification-info">
              <span className="employee">{notification.employee}</span>
              <span className="action">a demandé un congé de  {notification.leaveType}</span>
              <span className="dates">de {notification.startDate} à {notification.endDate}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
