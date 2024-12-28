import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './profile.scss';
import Form from 'devextreme-react/form';
import DataGrid, { Column, Paging, FilterRow } from 'devextreme-react/data-grid';

const API_URL = 'http://localhost:5000';

export default function Profile() {
  const [employee, setEmployee] = useState(null);
  const [notes, setNotes] = useState('');
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const fetchEmployeeId = async () => {
          const response = await axios.get(`${API_URL}/employees/teamlead-id/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
          });
          return response.data;
        };

        const employeeId = await fetchEmployeeId();

        // Fetch employee details
        const employeeResponse = await axios.get(`${API_URL}/employees/${employeeId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
        });
        const employeeData = employeeResponse.data;

        if (employeeData) {
          setEmployee({
            FirstName: employeeData.firstName,
            LastName: employeeData.lastName,
            Email: employeeData.email,
            Role: employeeData.role,
            Department: employeeData.department,
            Color: employeeData.color,
            Picture: employeeData.Picture || 'default.png',
          });
          setNotes(employeeData.Notes || '');
        }

        // Fetch leave balances
        const leaveBalancesResponse = await axios.get(`${API_URL}/employees/${employeeId}/leave-balances`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
        });
        setLeaveBalances(leaveBalancesResponse.data.leaveBalances);

        // Fetch leave types
        const leaveTypesResponse = await axios.get(`${API_URL}/leave-types`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
        });
        setLeaveTypes(leaveTypesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchEmployeeData();
  }, [userId]);

  if (!employee) return <div>Loading...</div>;

  // Create a map of leave type IDs to names
  const leaveTypeMap = leaveTypes.reduce((map, type) => {
    map[type._id] = type.name;
    return map;
  }, {});

  // Update leave balances to include leave type names and subtypes
  const leaveBalancesWithDetails = leaveBalances.map(balance => ({
    ...balance,
    leaveTypeName: leaveTypeMap[balance.leaveTypeId] || 'Unknown',
    subtypes: balance.subtypes || []
  }));

  return (
    <React.Fragment>
      <h2 className={'content-block'}>Profile</h2>
      <div className={'content-block dx-card responsive-paddings'}>
        <Form
          id={'form'}
          defaultFormData={employee}
          onFieldDataChanged={e => e.dataField === 'Notes' && setNotes(e.value)}
          labelLocation={'top'}
          colCountByScreen={colCountByScreen}
          items={[
            { dataField: 'FirstName', label: { text: 'First Name' } },
            { dataField: 'LastName', label: { text: 'Last Name' } },
            { dataField: 'Email', label: { text: 'Email' } },
            { dataField: 'Role', label: { text: 'Role' } },
            { dataField: 'Department', label: { text: 'Department' } },
          ]}
        />
      </div>
      <div className={'content-block dx-card responsive-paddings'}>
        <DataGrid
          dataSource={leaveBalancesWithDetails}
          showBorders={true}
          columnAutoWidth={true}
        >
          <Column dataField="leaveTypeName" caption="Leave Type" />
          <Column dataField="balance" caption="Balance" />
          <Column
            dataField="subtypes"
            caption="Subtypes"
            cellRender={({ data }) => (
              <div>
                {data.subtypes.map((subtype, index) => (
                  <div key={index}>
                    {subtype.name}: {subtype.nbdays} days
                  </div>
                ))}
              </div>
            )}
          />
          <Paging defaultPageSize={10} />
          <FilterRow visible={true} />
        </DataGrid>
      </div>
    </React.Fragment>
  );
}

const colCountByScreen = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4
};
