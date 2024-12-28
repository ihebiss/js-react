import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataGrid, { Column, Pager, Paging, FilterRow } from 'devextreme-react/data-grid';
import { format } from 'date-fns';
import { Button } from 'devextreme-react/button';
import { Popup } from 'devextreme-react/popup';
import FormDemande from '../Form/formDemande';
import ExplanationForm from '../Employe/ExplanationForm';
import PopupReject from '../popup/Popup.Reject';

const API_URL = 'http://localhost:5000';
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const userRole = localStorage.getItem("roles");
export default function VueConges() {
  const [leaves, setLeaves] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [formDemandeVisible, setFormDemandeVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentLeave, setCurrentLeave] = useState(null);
  const [teamLeadId, setTeamLeadId] = useState(null);
  const [popupRejectVisible, setPopupRejectVisible] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState(null);
  const [data, setData] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
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
  }, [userId]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${API_URL}/employees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setEmployees(response.data);  
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);
  useEffect(() => {
    fetchData();
  }, {teamLeadId, employees});
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        let response;
  
        if (userRole === 'TeamLead' && teamLeadId) {
          response = await axios.get(`${API_URL}/employees-leaves/team/${teamLeadId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          response = await axios.get(`${API_URL}/employees-leaves`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
  
          if (userRole === 'Manager') {
            response.data = response.data.filter(leave => leave.employeeId !== userId);
          }
        }
        const leavesArray = Array.isArray(response.data) ? response.data : [];
        if (Array.isArray(leavesArray)) {
          const leavesWithNames = leavesArray
            .filter(leave => {
              const employee = employees.find(emp => emp._id === leave.employeeId);
              return employee && employee.role !== 'Manager';
            })
            .map(leave => {
              const employee = employees.find(emp => emp._id === leave.employeeId);
              return {
                ...leave,
                employeeName: employee ? `${employee.firstName} ${employee.lastName}` : ''
              };
            });

          setLeaves(leavesWithNames);
        } else {
          console.error('Response data is not an array:', response.data);
          setError('Invalid response format from the server.');
        }
      } catch (error) {
        console.error('Error fetching leaves:', error);
        setError('Error fetching leaves');
      }
    };
  
    fetchLeaves();
  }, [userId, userRole, teamLeadId, employees, token]);
  
  

  const loadLeaveTypes = async () => {
    if (!token) {
      console.error('Token is not available');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/leave-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setLeaveTypes(data);
      const allSubtypes = data.flatMap(type => type.subtypes);
      setSubtypes(allSubtypes);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      setError('Error fetching leave types');
    }
  };

  useEffect(() => {
    loadLeaveTypes();
  }, [token]);

  const updateLeaveStatus = (id, status, reason = '') => {
    setLeaves(prevLeaves => 
      prevLeaves.map(leave =>
        leave._id === id ? { ...leave, status, rejectionReason: reason } : leave
      )
    );
  };

  const plusClick = () => {
    setFormDemandeVisible(true);
    setSelectedRowData(null);
  };

  const closeFormDemande = () => {
    setFormDemandeVisible(false);
  };
  const showRejectPopup = (leave) => {
    setCurrentLeave(leave);
    setPopupRejectVisible(true);
  };
  const handleReject = async (reason, leave) => {
    try {
      const response = await axios.put(`${API_URL}/employees-leaves/${leave._id}`, {
        status: 'Rejected',
        rejectionReason: reason
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employeeResponse = await axios.get(`${API_URL}/employees/${leave.employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employee = employeeResponse.data;
      if (!employee || !employee.email || !employee.firstName) {
        console.error('Email address or first name is missing');
        return;
      }
      await axios.post(`${API_URL}/notifications/send-notification`, {
        to: employee.email,
        subject: 'Your leave request has been rejected',
        text: `Dear ${employee.firstName}, your leave request has been rejected. Reason: ${reason}`,
        html: `<p>Dear ${employee.firstName},<br>Your leave request has been <strong>rejected</strong>.<br>Reason: ${reason}.<br>Sincerely,<br>Your Leave Management System</p>;`
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLeaves(prevLeaves => prevLeaves.map(item =>
        item._id === leave._id ? { ...item, status: 'Rejected', rejectionReason: reason } : item
      ));
      setPopupRejectVisible(false);
    } catch (error) {
      console.error('Error rejecting leave request:', error.response || error.message);
    }
  };
  
  const handleEditClick = (rowData) => {
    setSelectedRowData(rowData);
    if (rowData.status === 'Approved') {
      setPopupVisible(true);
    } else if (rowData.status === 'Pending') {
      setFormDemandeVisible(true);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const handleSaveLeave = async (updatedData) => {
    try {
      const response = await fetch(`${API_URL}/employees-leaves/${updatedData._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setLeaves(prevLeaves =>
        prevLeaves.map(leave =>
          leave._id === data._id ? { ...leave, ...data } : leave
        )
      );
      setFormDemandeVisible(false);
      setPopupVisible(false);
    } catch (error) {
      console.error('Error saving leave request:', error);
      setError('Error saving leave request');
    }
  };

  const fetchData = async () => {
    if (!teamLeadId) return;
  
    try {
      const leavesResponse = await axios.get(`${API_URL}/employees-leaves/team/${teamLeadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });    
      const leavesWithNames = leavesResponse.data.map(leave => {
        const employee = employees.find(emp => emp._id === leave.employeeId);
        return {
          ...leave,
          employeeName: employee ? employee.firstName + ' ' + employee.lastName : ''
        };
      });
      setLeaves(leavesWithNames);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const handleApprove = async (rowData) => {
    if (!rowData || !rowData._id) {
      console.error('Invalid rowData or missing ID');
      return;
    }
    try {
      const startDateISO = new Date(rowData.startDate).toISOString();
      const endDateISO = new Date(rowData.endDate).toISOString();
      let newStatus;
      if (userRole.includes('TeamLead')) {
        if (rowData.status === 'Pending') {
          newStatus = 'Approved by TeamLead';
        } else {
          console.error('Invalid status for TeamLead:', rowData.status);
          return;
        }
      } 
      else if (userRole.includes('Manager')) {
        if (rowData.status === 'Approved by TeamLead') {
          newStatus = 'Approved';
        } else if (rowData.status === 'Pending') {
          newStatus = 'Approved';
        } else {
          console.error('Invalid status for Manager:', rowData.status);
          return;
        }
      } else {
        console.error('Invalid user role:', userRole);
        return;
      }
      if (!newStatus) {
        console.error('New status is undefined');
        return;
      }
      const response = await axios.put(`${API_URL}/employees-leaves/${rowData._id}`, {
        status: newStatus,
        startDate: startDateISO,
        endDate: endDateISO,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 200) {
       
        const employeeResponse = await axios.get(`${API_URL}/employees/${rowData.employeeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const employee = employeeResponse.data;
  
        if (!employee || !employee.email || !employee.firstName) {
          console.error('Email address or first name is missing');
          return;
        }
        await axios.post(`${API_URL}/notifications/send-notification`, {
          to: employee.email,
          subject: 'Your leave request has been approved',
          text: `Dear ${employee.firstName}, your leave request has been approved.`,
          html: `<p>Dear ${employee.firstName},<br>Your leave request has been <strong>approved</strong>.<br>Sincerely,<br>Your Leave Management System</p>`
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        updateLeaveStatus(rowData._id, newStatus);
      } else {
        console.error('Failed to update leave status');
      }
    } catch (error) {
      console.error('Error approving leave request:', error.response || error.message);
    }
  };
  const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.find(type => type._id === leaveTypeId);
    return leaveType ? leaveType.name : '';
  };
 const getSubtypeName = (subtypeId) => {
    if (!subtypeId) return '';
    const subtype = subtypes.find(subtype => subtype._id === subtypeId);
    return subtype ? subtype.name : '';
  };
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp._id === employeeId);

    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  }; 
  const shouldShowReasonColumn = leaves.some(leave => leave.status === 'Rejected');
  const columns = [
    {
      dataField: 'employeeId',
      caption: 'Name',
      cellRender: ({ data }) => <span>{getEmployeeName(data.employeeId)}</span>,
    },
    {
      dataField: 'startDate',
      caption: 'Start Date',
      dataType: 'date',
      cellRender: (data) => <span>{format(data.data.startDate, 'dd-MM-yyyy')}</span>,
    },
    {
      dataField: 'endDate',
      caption: 'Due Date',
      dataType: 'date',
      cellRender: (data) => <span>{format(data.data.endDate, 'dd-MM-yyyy')}</span>,
    },
    {
      dataField: 'startPeriod',
      caption: 'Start Period',
    },
    {
      dataField: 'endPeriod',
      caption: 'End Period',
    },
    {
      dataField: 'leaveTypeId',
      caption: 'Type',
      cellRender: ({ data }) => <span>{getLeaveTypeName(data.leaveTypeId)}</span>,
    },
    {
      dataField: 'subtype',
      caption: 'Subtype',
      hidingPriority: 3,
      cellRender: ({ data }) => <span>{getSubtypeName(data.subtype)}</span>,
    },
    {
      dataField: 'explanation',
      caption: 'Explanation',
      hidingPriority: 1,
    },
    {
      dataField: 'attachment',
      caption: 'Attachment',
      hidingPriority: 4,
    },
    {
      dataField: 'status',
      width: 190,
      caption: 'Status',
    },
    ...(shouldShowReasonColumn ? [{
      dataField: 'reason',
      caption: 'Reason for Rejection',
      hidingPriority: 3,
      cellRender: ({ data }) => <span>{data.reason || 'N/A'}</span>
    }] : []),

    {
      caption: 'Actions',
      type: 'buttons',
      buttons: [
        {
          hint: 'Update',
          icon: 'edit',
          onClick: ({ row }) => handleEditClick(row.data),
          visible: ({ row }) => row.data.status !== 'Rejected'
        },
        {
          hint: 'Check',
          icon: 'check',
          onClick: ({ row }) => {
           
            handleApprove(row.data);
          },
          visible: ({ row }) => {
            const status = row.data.status;
            return status === 'Pending' || (status === 'Approved by TeamLead' && userRole.includes('Manager'));
          }
        },
        {
          hint: 'Remove',
          icon: 'remove',
          onClick: ({ row }) => showRejectPopup(row.data),
          visible: ({ row }) => row.data.status === 'Pending'
        }
      ]
    }];
  return (
    <React.Fragment>
      <h2 className={'content-block'}>Management of Leave Requests</h2>
      <div className="dx-field">
        <div className="dx-field-label"></div>
        <div className="dx-field-value">
          <Button
            icon="plus"
            stylingMode="text"
            text="Add Demand"
            elementAttr={{ style: { fontSize: '34px', backgroundColor: '#ff6200d3', borderRadius: '30%', color: '#ffffff' } }}
            onClick={plusClick}
          />
        </div>
      </div>
      <DataGrid
        className={'dx-card wide-card'}
        dataSource={leaves}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        columnAutoWidth={true}
        columnHidingEnabled={true}
        keyExpr="_id"
      >
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        {columns.map((col, index) => (
          <Column key={index} {...col} />
        ))}
      </DataGrid>
      <Popup
  visible={popupVisible && selectedRowData && selectedRowData.status === 'Approved'}
  onHiding={closePopup}
  showCloseButton={true}
  title="Explanation Form"
  width={600}
  height={400}
>
  <ExplanationForm
    setPopupVisible={setPopupVisible}
    handleSaveLeave={handleSaveLeave}
    rowData={selectedRowData}
  />
</Popup>
   <Popup
        visible={formDemandeVisible}
        onHiding={closeFormDemande}
        showCloseButton={true}
        title={selectedRowData ? 'Edit Leave Request' : 'Add Leave Request'}
        width={1100}
        height={700}
      >
        <FormDemande
          handleSaveLeave={handleSaveLeave}
          rowData={selectedRowData}
          onClose={closeFormDemande}
        />
      </Popup>
      <PopupReject
  visible={popupRejectVisible}
  onClose={() => setPopupRejectVisible(false)}
  onReject={(reason) => handleReject(reason, currentLeave)}
  rejectionReason={rejectionReason}
  setRejectionReason={setRejectionReason}
/> 
    </React.Fragment>
  );
}
