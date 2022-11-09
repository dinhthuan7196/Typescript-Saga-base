import React, { useState, useMemo } from 'react';

import { AutoComplete, Table } from '@xbotvn/react-ui/components';
import {
  TextField,
  MenuItem,

  FormControlLabel,

  IconButton,

  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  Box,
  Checkbox,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles/index';
import { uniqBy } from '@xbotvn/utils/collection';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Icons } from '../../../../components';
import { handleUpdatePermissions } from '../../../../redux/actions/folders';

function Permissions({ onClose, folderId }) {
  const dispatch = useDispatch();
  const {
    groups,
    permissions: initPermissions,
    permissionOptions,
  } = useSelector(({ user, folders, catalogs }) => {
    const allGroups = {
      staffs: 'Tất cả',
    };
    (user?.unit?.staffs ?? []).forEach(({ email }) => {
      allGroups[email] = email;
    });
    Object.entries(user?.unit?.groups ?? []).forEach(([id, { name }]) => {
      allGroups[id] = name;
    });
    return {
      groups: allGroups,
      permissions: (folders?.data?.[folderId]?.permissions ?? []).filter(
        ({ group }) => allGroups[group],
      ),
      permissionOptions: Object.entries(
        catalogs.system?.product?.data?.config?.permissions ?? {},
      ).map(([value, text]) => ({
        value,
        text,
      })),
    };
  });

  const [related, setRelated] = useState(false);
  const [permissions, setPermissions] = useState(initPermissions);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [pendingPermission, setPendingPermission] = useState('view');

  const groupOptions = useMemo(() => {
    if (pendingGroups.includes('staffs')) return ['staffs'];
    return Object.keys(groups).filter((value) => !permissions.find(({ group }) => group === value));
  }, [groups, permissions, pendingGroups]);

  const columns = useMemo(() => [
    {
      Header: 'Nhóm Người Dùng/Nhân Sự',
      accessor: 'group',
      disableEdit: true,
      width: 600,
    },
    {
      Header: 'Phân quyền',
      accessor: 'permissions',
      disableEdit: true,
      width: 150,
    },
    {
      Header: ' ',
      accessor: 'id',
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <IconButton
          size="small"
          onClick={() => setPermissions(
            (prevPermissions) => prevPermissions.filter(({ group }) => group !== value),
          )}
        >
          <Icons.XBin stroke={colors.red[400]} />
        </IconButton>
      ),
      action: true,
      width: 100,
    },
  ], []);

  const rows = useMemo(() => permissions.map(({ group, permissions: allowance }) => ({
    group: groups[group],
    id: group,
    permissions: allowance.map((p) => (permissionOptions.find(({ value }) => value === p))?.text ?? '').join(', '),
  })), [permissions]);

  return (
    <Dialog
      open
      maxWidth="md"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle
        onClose={onClose}
        title="Phân Quyền"
        icon={<Icons.XUserSettings />}
      />
      <DialogContent dividers>
        <Box display="flex" mb={5} alignItems="flex-end">
          <Box flexGrow={1}>
            <AutoComplete
              fullWidth
              value={pendingGroups}
              options={groupOptions}
              getOptionLabel={(val) => groups[val]}
              multiple
              inputProps={{
                label: 'Nhóm Người Dùng/Nhân Sự',
              }}
              onChange={(e, values) => setPendingGroups(values)}
              disableCloseOnSelect
            />
          </Box>
          <Box ml={1} mr={1} width={240}>
            <TextField
              label="Phân Quyền"
              value={pendingPermission}
              fullWidth
              onChange={(e) => setPendingPermission(e.target.value)}
              select
              SelectProps={{}}
              variant="outlined"
            >
              {permissionOptions.map(({ value, text }) => (
                <MenuItem key={value} value={value}>{text}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Button
            color="primary"
            onClick={() => {
              if (!pendingGroups.length) return;
              const append = pendingGroups.map((group) => ({
                group,
                permissions: [pendingPermission],
              }));
              setPermissions((prevPermissions) => uniqBy([
                ...append,
                ...prevPermissions,
              ], 'group'));
              setPendingGroups([]);
            }}
          >
            <Icons.XPlus fill={colors.primary[400]} stroke="white" />
          </Button>
        </Box>
        <Box width={850}>
          <Table
            columns={columns}
            data={rows}
            disableGlobalFilter
            disableFilters
            disableGroupBy
            width={850}
            height={window.innerHeight - 500}
            rowHeight={56}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex" width={1}>
          <Box flexGrow={1}>
            <FormControlLabel
              label="Áp dụng cho thư mục con"
              labelPlacement="end"
              control={(
                <Checkbox
                  checked={related}
                  onChange={() => setRelated((prevRelated) => !prevRelated)}
                />
              )}
            />
          </Box>
          <Button
            color="primary"
            onClick={() => {
              const append = pendingGroups.map((group) => ({
                group,
                permissions: [pendingPermission],
              }));
              dispatch(handleUpdatePermissions(
                folderId,
                uniqBy([...permissions, ...append], 'group'),
                related,
                onClose,
              ));
            }}
            startIcon={<Icons.XPlus stroke="white" />}
          >
            Cập Nhật
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

Permissions.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
};

export default Permissions;
