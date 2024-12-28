import React, { useEffect, useState } from 'react';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import UserPanel from '../user-panel/UserPanel';
import axios from 'axios';
import './Header.scss';

import { Template } from 'devextreme-react/core/template';
const API_URL = 'http://localhost:5000';
const token = localStorage.getItem("token");
const roles = localStorage.getItem("roles");
const userId = localStorage.getItem("userId");

export default function Header({ menuToggleEnabled, title, toggleMenu }) {
  const [remainingBalances, setRemainingBalances] = useState([]);
  const [teamLeadId, setTeamLeadId] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);

  useEffect(() => {
    const fetchTeamLeadId = async () => {
      try {
        const response = await axios.get(`${API_URL}/employees/teamlead-id/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTeamLeadId(response.data);
      } catch (error) {
        console.error('Error fetching team lead ID:', error);
      }
    };

    fetchTeamLeadId();
  }, [userId, token]);

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      if (teamLeadId) {
        try {
          const response = await axios.get(`${API_URL}/employees/${teamLeadId}/leave-balances`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setLeaveBalances(response.data.leaveBalances);
        } catch (error) {
          console.error('Error fetching leave balances:', error);
        }
      }
    };

    fetchLeaveBalances();
  }, [teamLeadId, token]);


  return (
    <header className={'header-component'}>
      <Toolbar className={'header-toolbar'}>
        <Item
          visible={menuToggleEnabled}
          location={'before'}
          widget={'dxButton'}
          cssClass={'menu-button'}
        >
          <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
        </Item>
        <Item
          location={'before'}
          cssClass={'header-title'}
          text={title}
          visible={!!title}
        />
        <Item
          location={'after'}
          cssClass={'leave-balances'}
        >
        
          <div className={'leave-balances-container'}>
        {leaveBalances.map(balance => (
          <span 
            key={balance.leaveTypeId}
            className={'leave-balance-item'} 
            style={{ 
            //  backgroundColor: '#007bff', 
              color: 'white',
              marginRight: '10px',
              padding: '5px 10px',
              borderRadius: '4px'
            }}
          >
            {balance.leaveTypeName}: {balance.balance}d
          </span>
        ))}
          </div>
        </Item>
      
        <Item
          location={'after'}
          locateInMenu={'auto'}
        >
          <Button
            className={'user-button authorization'}
            width={210}
            height={'100%'}
            stylingMode={'text'}
          >
            <UserPanel menuMode={'context'} />
          </Button>
        </Item>
        <Template name={'userPanelTemplate'}>
          <UserPanel menuMode={'list'} />
        </Template>
      </Toolbar>
    </header>
  );
}
