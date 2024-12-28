import React, { useState, useCallback, useEffect } from 'react';
import SelectBox from 'devextreme-react/select-box';
import Calendar from 'devextreme-react/calendar';
import ToggleButton from './toogle';
import AlertComponent from './alertBox';
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import './style.css'; 
import { fetchLeaveTypes, createLeaveRequest, updateLeaveRequest } from '../../api/api';
import axios from 'axios';

const today = new Date();
const initialValue = [today, new Date(today.getTime())];
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const userRole = localStorage.getItem("roles");
const FormDemande = ({  employeeId, rowData, handleSaveLeave, setFormDemandeVisible }) => {
const [selectWeekOnClick, setSelectWeekOnClick] = useState(true);
const [selectionMode, setSelectionMode] = useState('range');
const [selectedLeaveType, setSelectedLeaveType] = useState(null);
const [startDate, setStartDate] = useState(today);
const [endDate, setEndDate] = useState(today);
const [calendarValue, setCalendarValue] = useState(initialValue);
const [selectedPeriod, setSelectedPeriod] = useState('morning');
const [selectedEndPeriod, setSelectedEndPeriod] = useState('morning');
const [weekendOption, setWeekendOption] = useState('saturday-sunday');
const [selectedSubtype, setSelectedSubtype] = useState(null);
const [showFileUpload, setShowFileUpload] = useState(false);
const [formData, setFormData] = useState(null);
const [showAlert, setShowAlert] = useState(false);
const [status, setStatus] = useState('');
const [explanation, setExplanation] = useState('');
const [attachment, setAttachment] = useState(null);
const [leaveTypes, setLeaveTypes] = useState([]);
const [subtypes, setSubtypes] = useState([]);
const [teamMembers, setTeamMembers] = useState([]);
const [selectedEmployee, setSelectedEmployee] = useState(employeeId);
const [teamLeadId, setTeamLeadId] = useState(null);
const [employees, setEmployees] = useState(null);
const API_URL = 'http://localhost:5000';

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
    const fetchEmployeesByTeamLead = async () => {
      try {
        let response;
  
        if (userRole.includes('TeamLead') && teamLeadId) {
           response = await axios.get(`${API_URL}/employees/teamlead/${teamLeadId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        const employeesWithNames = response.data.map(employee => ({
          ...employee,
          name: `${employee.firstName} ${employee.lastName}`
        }));
          if (teamLeadId && !employeesWithNames.some(emp => emp._id === teamLeadId)) {
          const teamLeadResponse = await axios.get(`${API_URL}/employees/${teamLeadId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const teamLead = {
            ...teamLeadResponse.data,
            name: `${teamLeadResponse.data.firstName} ${teamLeadResponse.data.lastName}`
          };
          employeesWithNames.unshift(teamLead);
        }
  
        setEmployees(employeesWithNames);
        setSelectedEmployee(teamLeadId); 
  
        } else if (userRole.includes('Manager')) {
          response = await axios.get(`${API_URL}/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const employeesWithNames = response.data.map(employee => ({
            ...employee,
            name: `${employee.firstName || ''} ${employee.lastName || ''}`
          }));

          const managerIdResponse = await axios.get(`${API_URL}/employees/teamlead-id/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const managerId = managerIdResponse.data;
          const managerResponse = await axios.get(`${API_URL}/employees/${managerId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const managerDetails = {
            _id: managerResponse.data._id,
            name: `${managerResponse.data.firstName || ''} ${managerResponse.data.lastName || ''}`
          };
          const updatedEmployees = employeesWithNames.filter(emp => emp._id !== managerId);
          updatedEmployees.unshift(managerDetails); 
          setEmployees(updatedEmployees);
          setSelectedEmployee(managerDetails._id);

        } else   if (userRole.includes('Employee')) {
          response = await axios.get(`${API_URL}/employees/teamlead-id/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
  
          const currentEmployeeId = response.data;
          const employeeResponse = await axios.get(`${API_URL}/employees/${currentEmployeeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
  
          const currentEmployee = employeeResponse.data;
          const employeesWithNames = [{
            _id: currentEmployee._id,
            name: `${currentEmployee.firstName || ''} ${currentEmployee.lastName || ''}`
          }];
          
          setEmployees(employeesWithNames);
          setSelectedEmployee(currentEmployee._id);
        }  
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployeesByTeamLead();
  }, [userRole, token, userId,teamLeadId]);
  
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const types = await fetchLeaveTypes(token);
        setLeaveTypes(types || []); 
      } catch (error) {
        console.error('Error fetching leave types:', error);
        setLeaveTypes([]); 
      }
    };
    
    fetchTypes();
  }, []);

  useEffect(() => {
    if (rowData && leaveTypes.length > 0) {
      const leaveType = leaveTypes.find(type => type._id === rowData.leaveTypeId);
      if (leaveType) {
        setSubtypes(leaveType.subtypes || []);
        setSelectedSubtype(rowData.subtype);
      } else {
        setSubtypes([]);
        setSelectedSubtype(null);
      }
      setSelectedLeaveType(rowData.leaveTypeId)
      setStartDate(rowData.startDate);
      setEndDate(rowData.endDate);
      setSelectedPeriod(rowData.startPeriod);
      setSelectedEndPeriod(rowData.endPeriod);
      setExplanation(rowData.explanation);
      setAttachment(rowData.attachment || null);
      setStatus(rowData.status);
      setSelectedEmployee(rowData.employeeId || employeeId);
    }
  }, [rowData, leaveTypes,employeeId]);
  
  useEffect(() => {
    setCalendarValue([startDate, endDate]);
  }, [startDate, endDate]);

  const resetFields = () => {
    setStartDate(today);
    setEndDate(today);
    setCalendarValue(initialValue);
    setSelectedPeriod('morning');
    setSelectedEndPeriod('morning');
    setShowFileUpload(false);
    setSelectedLeaveType(null);
    setSelectedSubtype(null);
    setExplanation('');
    setSubtypes([]);
    
  };

  const handlePeriodToggle = useCallback((period) => {
    setSelectedPeriod(period);
  }, []);

  const handleCalendarValueChange = useCallback((e) => {
    if (e && e.value && Array.isArray(e.value) && e.value.length > 0) {
      const newDates = e.value
        .map(date => date instanceof Date ? date : null)
        .filter(Boolean);
      if (newDates.length === 2) {
        const [newStartDate, newEndDate] = newDates;
        setStartDate(newStartDate);
        setEndDate(newEndDate);
      } else if (newDates.length === 1) {
        const newStartDate = newDates[0];
        if (newStartDate > endDate) {
          setEndDate(newStartDate);
        } else {
          setStartDate(newStartDate);
        }
        setCalendarValue([newDates]);
      }

    
        }},[]);
   
  const handleEndPeriodToggle = useCallback((period) => {
    setSelectedEndPeriod(period);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setAttachment(file.name);
    } else {
      setAttachment(null);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const data = {
      employeeId: selectedEmployee, 
      leaveTypeId: selectedLeaveType,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      startPeriod: selectedPeriod,
      endPeriod: selectedEndPeriod,
      explanation: explanation || '',
      attachment: attachment || '',
      subtype: selectedSubtype || '',
      keycloakId: localStorage.getItem('userId') || '',
    };
    try {
      if (rowData) {
        await updateLeaveRequest(rowData._id, data);
        handleSaveLeave({ ...rowData, ...data });
      } else {
        await createLeaveRequest(data);
        setFormData(data);
        setShowAlert(true);
      }
      setFormDemandeVisible(false);
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  }, [selectedEmployee, selectedLeaveType, selectedSubtype, startDate, endDate, selectedPeriod, selectedEndPeriod, explanation, attachment, rowData]);
  const handleModify = () => {
    setShowAlert(false);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    setFormData(null);
  };

  const onClearButtonClick = () => {
    resetFields();
  };

  const handleLeaveTypeChange = useCallback((value) => {
    setSelectedLeaveType(value);
    const leaveType = leaveTypes.find(type => type._id === value);
    if (leaveType) {
      setSubtypes(leaveType.subtypes || []); 
      setSelectedSubtype(null);
    } else {
      setSubtypes([]);
      setSelectedSubtype(null);
    }
  }, [leaveTypes]);
  return (
    <form onSubmit={handleSubmit} className="form-container">
    <div className="column-container">
      {/* Left Column */}
      <div className="left-column">
      <div className="form-group">
  <label>Employee</label>
  <SelectBox
    dataSource={employees}
    value={selectedEmployee}
    displayExpr="name" 
    valueExpr="_id" 
    onValueChanged={(e) => setSelectedEmployee(e.value)}
  />
</div>
        <div className="form-group">
          <label>Start Date</label>
          <div className="field-with-toggle">
            <DateBox
              value={startDate}
              displayFormat="dd-MM-yyyy"
              min={today}
              onValueChanged={(e) => {
                const newStartDate = e.value;
                setStartDate(newStartDate);
                if (newStartDate > endDate) {
                  setEndDate(newStartDate);
                }
              }}
            />
            <ToggleButton selected={selectedPeriod} onToggle={handlePeriodToggle} />
          </div>
        </div>
        <div className="form-group">
          <label>End Date</label>
          <div className="field-with-toggle">
            <DateBox
              value={endDate}
              displayFormat="dd-MM-yyyy"
              min={startDate}
              onValueChanged={(e) => setEndDate(e.value)}
            />
            <ToggleButton selected={selectedEndPeriod} onToggle={handleEndPeriodToggle} />
          </div>
        </div>
        <div className="form-group">
          <label>Leave Type</label>
          <SelectBox
            dataSource={leaveTypes}
            value={selectedLeaveType}
            displayExpr="name"
            valueExpr="_id"
            onValueChanged={(e) => handleLeaveTypeChange(e.value)}
          />
        </div>
        {selectedLeaveType && subtypes.length > 0 && (
  <SelectBox
    dataSource={subtypes}
    displayExpr="name"
    valueExpr="_id"
    value={selectedSubtype}
    onValueChanged={(e) => setSelectedSubtype(e.value)}
  />
)}
        <div className="form-group">
          <label>Upload File</label><br/>
          <input type="file" onChange={handleFileChange} />
          {attachment && <span>{attachment}</span>}
        </div>
      </div>
      {/* Right Column */}
      <div className="right-column">
        <div className="calendar-container">
          <Calendar
            value={calendarValue}
            onValueChanged={handleCalendarValueChange}
            selectionMode={selectionMode}
            width="100%"
          />
        </div>
      </div>
    </div>
    <div className="form-group">
          <label>Explanation</label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>
    <div className="form-group">
      <Button type="submit" className='form-buttons1' text="Soumettre" useSubmitBehavior={true}/>
      <Button className='form-buttons2' text="Reset" onClick={onClearButtonClick} />
    </div>
    {showAlert && formData && (
        <AlertComponent
          message="Votre demande a été soumise !"
          onClose={handleAlertClose}
          formData={formData}
          leaveTypes={leaveTypes} 
          subtypes={subtypes}  
          onModify={handleModify}  
        />
      )}
  </form>
 );
};
export default FormDemande;