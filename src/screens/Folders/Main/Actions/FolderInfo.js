import React, { useState, useMemo } from 'react';

import { AutoComplete, Notification } from '@xbotvn/react-ui/components';
import {
  Breadcrumbs,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  FormControl,
  Typography,
  FormLabel,
  Grid,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Icons } from '../../../../components';
import { handleUpdateFolder } from '../../../../redux/actions/folders';
import { traceToRoot } from '../../utils';

function FolderInfo({
  onClose,
  folderId,
  unit: ownerUnit,
}) {
  const dispatch = useDispatch();
  const {
    unit,
    folder,
    folders,
  } = useSelector(({ folders: foldersStore, user }) => ({
    folders: foldersStore?.data ?? {},
    folder: foldersStore?.data?.[folderId] ?? {},
    unit: user?.unit ?? {},
  }));

  const [name, setName] = useState(folder?.name || '');
  const [labels, setLabels] = useState(folder?.labels ?? []);

  const paths = useMemo(() => {
    const tail = traceToRoot(folderId, folders).map((f) => f?.name ?? '???');

    if (folder.unit === unit.id) return ['Hồ sơ đơn vị', ...tail];
    return ['Khác', ...tail];
  }, [folders, folder]);

  const labelsOptions = useMemo(() => unit?.labels ?? [], [unit]);

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle
        icon={<Icons.XInformation />}
        title="Thông tin"
        onClose={onClose}
      />
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              disabled={ownerUnit !== unit.id}
              label="Tên thư mục"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl>
              <FormLabel>Đường dẫn</FormLabel>
              <Breadcrumbs
                itemsBeforeCollapse={0}
                maxItems={3}
                separator="/"
              >
                {paths.map((fname, idx) => <Typography key={idx}>{fname}</Typography>)}
              </Breadcrumbs>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <AutoComplete
              disabled={ownerUnit !== unit.id}
              value={labels}
              options={labelsOptions}
              multiple
              onChange={(e, values) => setLabels(values)}
              disableCloseOnSelect
              inputProps={{
                label: 'Nhãn',
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      {(ownerUnit === unit.id) ? (
        <DialogActions>
          <Button
            color="primary"
            startIcon={<Icons.XSave stroke="white" />}
            onClick={() => {
              const isDuplicated = Object.entries(folders).map((f) => f[1]).some(
                ({ name: fName, parent, unit: funit }) => fName.toLowerCase() === name.toLowerCase()
                  && parent === folder.parent && funit === unit.id,
              );
              if ((folder?.name ?? '').toLowerCase() !== name.toLowerCase() && isDuplicated) {
                Notification.warn('Tên thư mục đã tồn tại!');
                return;
              }
              if (name.trim()) {
                dispatch(handleUpdateFolder(
                  folderId,
                  {
                    name,
                    labels,
                  },
                  false,
                  onClose,
                ));
              } else Notification.error('Tên thư mục không được bỏ trống');
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}

FolderInfo.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
};

export default FolderInfo;
