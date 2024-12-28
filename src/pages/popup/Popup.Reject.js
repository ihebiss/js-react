import React from 'react';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import TextBox from 'devextreme-react/text-box';

const PopupReject = ({ visible, onClose, onReject, rejectionReason, setRejectionReason }) => {
  return (
    <Popup
      visible={visible}
      onHiding={onClose}
      dragEnabled={false}
      showCloseButton={true}
      showTitle={true}
      title="Reject Leave"
      width={300}
      height={250}
    >
      <div>
        <TextBox
          placeholder="Reason for rejection"
          value={rejectionReason}
          onValueChanged={(e) => setRejectionReason(e.value)}
        />
        <Button
          text="Submit"
          type="default"
          onClick={() => onReject(rejectionReason)}
        />
      </div>
    </Popup>
  );
};

export default PopupReject;
