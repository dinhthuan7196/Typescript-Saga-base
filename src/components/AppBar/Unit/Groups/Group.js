import React, { useState } from 'react';

import { Notification, AutoComplete } from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';

import * as Icons from '../../../Icons';

function Group({
  onClose,
  id,
  name: initName,
  members: initMembers,
  staffs,
  groups,
}) {
  const [name, setName] = useState(initName);
  const [members, setMembers] = useState(initMembers);

  return (
    <Dialog fullWidth open onClose={() => onClose()}>
      <DialogTitle
        icon={<Icons.XGroup />}
        onClose={() => onClose()}
        title={id ? initName : 'Tạo Nhóm'}
        onClose={() => onClose()}
      />
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Tên Nhóm"
              variant="outlined"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên nhóm"
            />
          </Grid>
          <Grid item xs={12}>
            <AutoComplete
              value={members}
              options={staffs}
              multiple
              required
              onChange={(e, values) => setMembers(values)}
              disableCloseOnSelect
              inputProps={{
                label: 'Nhân Sự',
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() => {
            if (!name.trim()) {
              Notification.warn('Tên nhóm không được bỏ trống.');
              return;
            }
            const isDuplicate = Object.values(groups).some(
              ({ name: fname }) => name.toLowerCase() === fname.toLowerCase(),
            );
            if ((!id && isDuplicate)
              || (id && initName.toLowerCase() !== name.toLowerCase() && isDuplicate)
            ) {
              Notification.warn('Tên nhóm đã tồn tại.');
              return;
            }
            onClose(name, members);
          }}
          startIcon={<Icons.XGroup stroke="white" />}
        >
          {id ? 'Áp Dụng' : 'Thêm Nhóm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

Group.propTypes = {
  onClose: PropTypes.func.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  members: PropTypes.arrayOf(PropTypes.string),
  staffs: PropTypes.arrayOf(PropTypes.string),
  groups: PropTypes.object,
};

Group.defaultProps = {
  id: '',
  name: '',
  members: [],
  staffs: [],
  groups: {},
};

export default Group;
