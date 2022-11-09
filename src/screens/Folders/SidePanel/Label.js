import React, { useState } from 'react';

import { Notification, Waiting } from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { uniq } from '@xbotvn/utils/collection';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Icons } from '../../../components';
import { handleUpdateUnit } from '../../../redux/actions/user';

function Label({ onClose, label }) {
  const dispatch = useDispatch();
  const {
    staffs,
    admins,
    groups,
    labels,
    handling,
  } = useSelector(({ user }) => ({
    staffs: user?.unit?.staffs ?? [],
    admins: user?.unit?.admins ?? [],
    groups: user?.unit?.groups ?? {},
    labels: user?.unit?.labels ?? [],
    handling: user?.handling ?? false,
  }));

  const [name, setName] = useState(label || '');

  const updateUnit = () => {
    if (!name) {
      Notification.warn('Tên không được bỏ trống.');
      return;
    }
    if (label !== name) {
      dispatch(handleUpdateUnit(
        staffs,
        admins,
        groups,
        uniq([...labels, name]).filter((val) => val !== label),
        (error) => {
          if (!error) onClose();
        },
      ));
    } else onClose();
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      onClose={onClose}
    >
      <DialogTitle
        icon={<Icons.XManager />}
        title={label ? 'Chinh sửa nhãn' : 'Tạo nhãn'}
        onClose={onClose}
      />
      <DialogContent dividers>
        {handling ? <Waiting fullscreen /> : null}
        <TextField
          label="Tên nhãn"
          autoFocus
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={({ keyCode }) => {
            if (keyCode === 13) {
              updateUnit();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        {label ? (
          <Button
            color="secondary"
            startIcon={<Icons.XBin stroke={colors.primary[400]} fill={colors.primary[50]} />}
            onClick={() => {
              dispatch(handleUpdateUnit(
                staffs,
                admins,
                groups,
                labels.filter((val) => val !== label),
                (error) => {
                  if (!error) onClose();
                },
              ));
            }}
          >
            Xóa
          </Button>
        ) : null}
        <Button
          color="primary"
          startIcon={<Icons.XSave stroke="white" />}
          onClick={() => updateUnit()}
        >
          {label ? 'Cập nhật' : 'Tạo nhãn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

Label.propTypes = {
  onClose: PropTypes.func.isRequired,
  label: PropTypes.string,
};

Label.defaultProps = {
  label: '',
};

export default Label;
