import axios from 'axios';
import UseAuth from '../hooks/useAuth';
const token = localStorage.getItem("token")
const API_URL = 'http://localhost:3000';
export const fetchLeaveTypes = async () => {
  try {
    const response = await fetch(`${API_URL}/leave-types`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); 
    return data;
  } catch (error) {
    console.error('Error fetching leave types:', error);
    return []; 
  }
};
export const fetchLeaveRequest = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/leaves/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave request:', error);
    throw error;
  }
};
export const createLeaveRequest = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/employees-leaves`, data, {
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating leave request:', error);
    throw error;
  }
};

export const updateLeaveRequest = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/employees-leaves/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating leave request:', error);
    throw error;
  }
};

export const getTeamLeaves = async (teamLeadId) => {
  try {
    const response = await axios.get(`${API_URL}/team/${teamLeadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching team leaves:', error);
    throw error; 
  }
};