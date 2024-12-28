import React, { useState, useEffect ,useCallback} from 'react';
import { Button } from 'devextreme-react/button';

import { updateLeaveRequest } from '../../api/api';
const API_URL = 'http://localhost:5000';
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const ExplanationForm = ({ setPopupVisible, rowData, handleSaveLeave }) => {
  const [explanation, setExplanation] = useState('');
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (rowData) {
      console.log('rowData:', {rowData
     
      });
      setExplanation(rowData.explanation || '');
      setAttachment(rowData.attachment || null);
    }
  }, [rowData]);

  const handleSubmit = useCallback(async (e) => {
   
    const data = {
   
      explanation: explanation || '',
      attachment: attachment || '',
    
    };
    
    console.log('Submitting leave request with data:', data);
  
    try {
      if (rowData) {
        await updateLeaveRequest(rowData._id, data);
        handleSaveLeave({ ...rowData, ...data });
      }
      setPopupVisible(false);
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  }, [ explanation, attachment, rowData]);
  
  const handleCancel = () => {
    setPopupVisible(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    } else {
      setAttachment(null);
    }
  };

  return (
    <div className="popup-container">
      <div>
        <label>Explanation:</label>
        <textarea
          className="form-control"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>
      <div>
        <label>Attachment:</label>
        <input
          className="form-control"
          type="file"
          onChange={handleFileChange}
        />
      </div>
      <div className="buttons-container">
        <Button className="form-buttons1" text="Save" onClick={handleSubmit} />
        <Button className="form-buttons2" text="Cancel" onClick={handleCancel} />
      </div>
    </div>
  );
};

export default ExplanationForm;
