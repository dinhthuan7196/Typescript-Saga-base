import React, {
  useState,
  useMemo,
} from 'react';

import {
  Waiting,
  Table,
} from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  DialogActions,
  Box,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Icons, Units } from '../../../../components';
import { handleUpdateFolder } from '../../../../redux/actions/folders';

function Shares({
  onClose,
  folderId,
}) {
  const dispatch = useDispatch();
  const {
    folder,
    funits,
    units,
    unitTypesOptions,
    handling,
  } = useSelector(({ folders, units: unitsStore, catalogs }) => ({
    folder: folders?.data?.[folderId] ?? {},
    units: unitsStore?.data ?? {},
    funits: folders?.units ?? {},
    unitTypesOptions: catalogs.system?.product?.data?.config?.unitTypes ?? {},
    handling: folders?.handling ?? false,
  }));

  const [shares, setShares] = useState(folder.shares || []);
  const [selectUnits, setSelectUnits] = useState(false);

  const columns = useMemo(() => ([
    {
      Header: 'Tên Đơn vị',
      accessor: 'name',
      width: 300,
    },
    {
      Header: 'Loại hình',
      accessor: 'type',
      width: 200,
    },
    {
      Header: ' ',
      accessor: 'id',
      action: true,
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <IconButton size="small" onClick={() => setShares((prevShares) => prevShares.filter((id) => id !== value))}>
          <Icons.XBin stroke={colors.red[400]} />
        </IconButton>
      ),
      width: 50,
    },
  ]), []);

  const data = useMemo(() => shares.map((unitId) => ({
    name: funits?.[unitId]?.name ?? (units?.[unitId]?.name ?? unitId),
    type: unitTypesOptions?.[funits?.[unitId]?.type ?? (units?.[unitId]?.type ?? '')]?.name ?? '',
    id: unitId,
  })), [funits, shares]);

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle
        onClose={onClose}
        title="Chia Sẻ"
        icon={<Icons.XShare />}
      />
      <DialogContent dividers>
        {handling ? <Waiting fullscreen /> : null}
        {selectUnits ? (
          <Units
            onClose={() => setSelectUnits(false)}
            selected={shares}
            onSelectChanged={(selected) => setShares(selected)}
          />
        ) : null}
        <Table
          columns={columns}
          data={data}
          height={300}
          disableGlobalFilter
          disableGroupBy
          rowHeight={56}
        />
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box flexGrow={1}>
            <Button
              color="secondary"
              style={{ marginRight: 10 }}
              startIcon={<Icons.XPlus stroke={colors.primary[400]} />}
              onClick={() => setSelectUnits(true)}
            >
              Thêm Đơn Vị
            </Button>
          </Box>
          <Button
            color="primary"
            startIcon={<Icons.XSave stroke="white" />}
            onClick={() => dispatch(handleUpdateFolder(
              folderId,
              {
                shares,
              },
              true,
              (err) => {
                if (!err) onClose();
              },
            ))}
          >
            Cập Nhật
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

Shares.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
};

export default Shares;
