
import React from 'react';
import { format } from 'date-fns'; 
import './alertBox.css'; 
const AlertComponent = ({ formData, onClose, leaveTypes, subtypes,onModify }) => {
  const [showToast, setShowToast] = React.useState(false);


  const formatDate = (date) => {
    if (date instanceof Date) {
      return format(date, 'dd-MM-yyyy');
    }
    return '';
  };

  const handleSend = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 3000);
  };

  const handleModify = () => {
    setShowToast(false);
    onModify();
  };

  if (!formData) {
    return null;
  }

  // Get the leave type and subtype names
  const leaveType = leaveTypes.find(type => type._id === formData.leaveTypeId);
  const leaveTypeName = leaveType ? leaveType.name : 'Unknown Leave Type';
  const subtype = subtypes.find(subtype => subtype._id === formData.subtype);
  const subtypeName = subtype ? subtype.name : 'Unknown Subtype';

  return (
    <div>
      {!showToast && (
        <div className="alert-container">
          <h6>Vos données soumises :</h6>
          <p><strong>Start date :</strong> {formatDate(new Date(formData.startDate))}</p>
          <p><strong>End date :</strong> {formatDate(new Date(formData.endDate))}</p>
          <p><strong>Start period :</strong> {formData.startPeriod}</p>
          <p><strong>End period :</strong> {formData.endPeriod}</p>
          <p><strong>Leave Type :</strong> {leaveTypeName}</p>
          {subtypeName && <p>Sub-type : {subtypeName}</p>}
          <p><strong>Explanation:</strong> {formData.explanation}</p>
          <p><strong>Attachment :</strong> {formData.attachment}</p>
          <div className="alert-buttons">
            <button className='form-buttons1' onClick={handleSend}>Submit</button>
            <button className='form-buttons2' onClick={handleModify}>Modify</button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="custom-alert">
          <p>Votre demande a été soumise !</p>
        </div>
      )}
    </div>
  );
};

export default AlertComponent;
