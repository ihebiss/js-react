import React, { useState, useEffect } from 'react';
import Scheduler, { Editing, Resource } from 'devextreme-react/scheduler';
import axios from 'axios';
import 'devextreme/dist/css/dx.light.css';
import { format } from 'date-fns';

const API_URL = 'http://localhost:3000';
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const userRole = localStorage.getItem("roles") || '';

export default function MyScheduler() {
  const [appointments, setAppointments] = useState([]);
  const [resources, setResources] = useState([]);
  const [teamLeadId, setTeamLeadId] = useState(null);
  const [employees, setEmployees] = useState([]);

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

    if (userRole.includes('TeamLead')) {
      fetchTeamLeadId();
    }
  }, [userId, userRole]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${API_URL}/employees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setEmployees(response.data);

        // Prepare resources with employee colors
        const resourcesData = response.data.map(employee => ({
          id: employee._id,
          text: `${employee.firstName} ${employee.lastName}`,
          color: employee.color // Assume each employee has a 'color' field
        }));
        setResources(resourcesData);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        let filteredAppointments = [];
  
        // Vérifier si l'utilisateur est un employé
        if (userRole.includes('Employee')) {
          const response = await axios.get(`${API_URL}/employees-leaves/by-keycloak-id/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
  
          filteredAppointments = response.data
            .filter(leave => leave.status === 'Approved')
            .map(leave => {
              const employee = employees.find(emp => emp._id === leave.employeeId);
              return {
                id: leave._id,
                text: `Leave by ${employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}`,
                startDate: new Date(leave.startDate),
                endDate: new Date(leave.endDate),
                employeeId: leave.employeeId,
                startPeriod: leave.startPeriod,
                endPeriod: leave.endPeriod,
                color: resources.find(resource => resource.id === leave.employeeId)?.color || '#000'
              };
            });
        } else if (userRole.includes('TeamLead') && teamLeadId) {
          const teamMembers = employees.filter(emp => emp.TeamLeadId === teamLeadId);
  
          const response = await axios.get(`${API_URL}/employees-leaves`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
  
          filteredAppointments = response.data
            .filter(leave =>
              leave.status === 'Approved' && teamMembers.some(member => member._id === leave.employeeId)
            )
            .map(leave => {
              const employee = teamMembers.find(member => member._id === leave.employeeId);
              return {
                id: leave._id,
                text: `Leave by ${employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}`,
                startDate: new Date(leave.startDate),
                endDate: new Date(leave.endDate),
                employeeId: leave.employeeId,
                startPeriod: leave.startPeriod,
                endPeriod: leave.endPeriod,
                color: employee?.color || '#000'
              };
            });
        } else if (userRole.includes('Manager')) {
          const response = await axios.get(`${API_URL}/employees-leaves`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
  
          filteredAppointments = response.data
            .filter(leave => leave.status === 'Approved')
            .map(leave => {
              const employee = employees.find(emp => emp._id === leave.employeeId);
              return {
                id: leave._id,
                text: `Leave by ${employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}`,
                startDate: new Date(leave.startDate),
                endDate: new Date(leave.endDate),
                employeeId: leave.employeeId,
                startPeriod: leave.startPeriod,
                endPeriod: leave.endPeriod,
                color: resources.find(resource => resource.id === leave.employeeId)?.color || '#000'
              };
            });
        }
  
        setAppointments(filteredAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
  
    fetchAppointments();
  }, [teamLeadId, employees, userRole]);
  

  const onAppointmentFormOpening = (e) => {
    const { form } = e;

    form.option('items', [
      {
        dataField: 'startDate',
        editorType: 'dxDateBox',
        label: { text: 'Start Date' },
        editorOptions: {
          readOnly: true,
          style: { width: '100%' },
          value: format(e.appointmentData.startDate, 'dd-MM-yyyy')
        }
      },
      {
        dataField: 'endDate',
        editorType: 'dxDateBox',
        label: { text: 'End Date' },
        editorOptions: {
          readOnly: true,
          style: { width: '100%' },
          value: format(e.appointmentData.endDate, 'dd-MM-yyyy')
        }
      },
      {
        dataField: 'startPeriod',
        label: { text: 'Start Period' },
        editorOptions: {
          readOnly: true,
          style: { width: '100%' }
        }
      },
      {
        dataField: 'endPeriod',
        label: { text: 'End Period' },
        editorOptions: {
          readOnly: true,
          style: { width: '100%' }
        }
      }
    ]);

    form.option('items').push({
      itemType: 'button',
      buttonOptions: {
        text: 'OK',
        onClick: () => {
          form.hide();
        }
      }
    });
  };

  const onAppointmentClick = (e) => {
    e.cancel = true;
    e.component.showAppointmentPopup(e.appointmentData);
  };

  return (
    <Scheduler
      dataSource={appointments}
      height={600}
      onAppointmentClick={onAppointmentClick}
      onAppointmentFormOpening={onAppointmentFormOpening}
      defaultCurrentView="month"
      views={['month']}
      maxAppointmentsPerCell={2}
    >
      <Editing
        allowAdding={false}
        allowUpdating={false}
        allowDeleting={false}
      />
      <Resource
        fieldExpr="employeeId"
        idField="id"
        label="Employee"
        dataSource={resources}
        colorField="color"
      />
    </Scheduler>
  );
}
