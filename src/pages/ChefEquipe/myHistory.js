import React, { useState, useEffect } from 'react';
import DataGrid, { Column, Pager, Paging, FilterRow } from 'devextreme-react/data-grid';
import { Popup } from 'devextreme-react/popup';
import ExplanationForm from '../Employe/ExplanationForm';
import { Button } from 'devextreme-react/button';
import FormDemande from '../Form/formDemande';
import { format } from 'date-fns';

const MyHistory = () => {
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [formDemandeVisible, setFormDemandeVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const API_BASE_URL = 'http://localhost:5000';
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const loadEmployeeLeaves = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/employees-leaves/by-keycloak-id/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLeaves(data);
        if (data.length > 0) {
          setEmployeeId(data[0].employeeId);
        }
        setLoading(false);
      } catch (error) {
        setError('Error fetching employee leaves');
        setLoading(false);
      }
    };

    const loadLeaveTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/leave-types`, {
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
        setError('Error fetching leave types');
      }
    };
    if (userId) {
      loadEmployeeLeaves();
      loadLeaveTypes();
    }
  }, [userId, token]);

  const handleEditClick = (rowData) => {
    setSelectedRowData(rowData);
    if (rowData.status === 'Approved') {
      setPopupVisible(true);
    } else if (rowData.status === 'Pending') {
      setFormDemandeVisible(true);
    }
  };

  const plusClick = () => {
    setFormDemandeVisible(true);
    setSelectedRowData(null);
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const closeFormDemande = () => {
    setFormDemandeVisible(false);
  };

  const handleSaveLeave = async (updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees-leaves/${updatedData._id}`, {
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
      setError('Error saving leave request');
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
  const columns = [
    { 
      dataField: 'startDate', 
      caption: 'Start Date', 
      dataType: 'date',
      cellRender: ({ data }) => <span>{format(new Date(data.startDate), 'dd-MM-yyyy')}</span>,
    },
    { 
      dataField: 'endDate', 
      caption: 'Due Date', 
      dataType: 'date',
      cellRender: ({ data }) => <span>{format(new Date(data.endDate), 'dd-MM-yyyy')}</span>,
    },
    { dataField: 'startPeriod', caption: 'Start Period' },
    { dataField: 'endPeriod', caption: 'End Period' },
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
    { dataField: 'explanation', caption: 'Explanation', hidingPriority: 1 },
    { dataField: 'attachment', caption: 'Attachment', hidingPriority: 4 },
    { dataField: 'status', width: 190, caption: 'Status' },
    {
      caption: 'Actions',
      type: 'buttons',
      buttons: [
        {
          hint: 'Update',
          icon: 'edit',
          onClick: ({ row }) => handleEditClick(row.data),
          visible: ({ row }) => row.data.status !== 'Rejected',
        },
      ],
    },
  ];

  return (
    <React.Fragment>
      <h2 className={'content-block'}>My History</h2>
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
          rowData={selectedRowData}
          onSave={handleSaveLeave}
          setPopupVisible={setPopupVisible}
        />
      </Popup>
      <Popup
        visible={formDemandeVisible}
        onHiding={closeFormDemande}
        showCloseButton={true}
        title="Leave Request Form"
        width={1100}
        height={700}
      >
        <FormDemande
          handleSaveLeave={handleSaveLeave}
          rowData={selectedRowData}
          onClose={closeFormDemande}
          employeeId={employeeId}
        />
      </Popup>
    </React.Fragment>
  );
};

export default MyHistory;
