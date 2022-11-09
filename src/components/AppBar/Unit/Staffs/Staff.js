import React, { useState } from 'react';

import { Notification } from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Icon,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';

import * as Icons from '../../../Icons';

function Staff({ onClose }) {
  const [email, setEmail] = useState('');
  const [admin, setAdmin] = useState(false);

  return (
    <Dialog
      maxWidth="xs"
      fullWidth
      open
      onClose={onClose}
    >
      <DialogTitle icon={<Icons.XUser />} title="Nhân Sự" onClose={onClose} />
      <DialogContent>
        <TextField
          label="Email"
          required
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email nhân sự"
        />
        <FormControlLabel
          label="Quản Trị"
          control={(
            <Checkbox
              checked={admin}
              onChange={() => setAdmin((prevAdmin) => !prevAdmin)}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          startIcon={<Icon.XUser stroke="white" />}
          onClick={() => {
            if (!email) {
              Notification.warn('Địa chỉ email không được bỏ trống.');
              return;
            }
            onClose(email, admin);
          }}
        >
          Thêm Nhân Sự
        </Button>
      </DialogActions>
    </Dialog>
  );
}

Staff.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Staff;
