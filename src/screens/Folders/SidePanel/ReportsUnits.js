import React, { useEffect, useMemo } from 'react';

import {
  Panel,
  Table,
} from '@xbotvn/react-ui/components';
import {
  Typography,
  Icon,
  Box,
} from '@xbotvn/react-ui/core';
import { compareAsc } from '@xbotvn/utils/date';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { handleGetFiles } from '../../../redux/actions/files';

function ReportsUnits({ onClose, folderId }) {
  const dispatch = useDispatch();
  const {
    folder,
    files,
    funits,
    units,
    unitTypesOptions,
  } = useSelector(({
    folders,
    units: unitsStore,
    files: filesStore,
    catalogs,
  }) => ({
    units: unitsStore?.data ?? {},
    funits: folders?.units ?? {},
    folder: folders?.data?.[folderId] ?? {},
    files: Object.values(filesStore?.data?.[folderId] ?? {}),
    unitTypesOptions: catalogs.system?.product?.data?.config?.unitTypes ?? {},
  }));

  useEffect(() => {
    if (!files.length) {
      dispatch(handleGetFiles(folderId));
    }
  }, []);

  const getStatus = (u = {}) => {
    const uploaded = files.filter(({ unit }) => unit === u?.id);
    if (uploaded.length) return 'uploaded';
    if (u.expire && compareAsc(u.expire, new Date().getTime()) === -1) return 'expired';
    return '';
  };

  const columns = useMemo(() => [
    {
      Header: 'Tên Đơn vị',
      accessor: 'name',
      width: 300,
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value }, row: { original } }) => {
        const status = getStatus(original);
        let icon;
        switch (status) {
          case 'uploaded':
            icon = <Icon color="primary">check_circle</Icon>;
            break;
          case 'commented':
            icon = <Icon color="secondary">feedback</Icon>;
            break;
          case 'expired':
            icon = <Icon color="error">error</Icon>;
            break;
          default:
            icon = <Icon color="action">pending</Icon>;
        }
        return (
          <Box display="flex">
            {icon ? <Box mr={1}>{icon}</Box> : null}
            <Typography>{value}</Typography>
          </Box>
        );
      },
    },
    {
      Header: 'Loại hình',
      accessor: 'type',
      width: 200,
    },
    {
      Header: 'Thời hạn',
      accessor: 'expire',
      width: 200,
      type: 'date',
    },
  ], [files]);

  const rows = useMemo(() => {
    const { reports, expire, extend } = folder;
    return (reports || []).map((id) => ({
      id,
      name: funits?.[id]?.name ?? (units?.[id]?.name ?? id),
      type: unitTypesOptions?.[funits?.[id]?.type ?? (units?.[id]?.type ?? '')]?.name ?? '',
      expire: extend?.[id] ?? expire ?? '',
    }));
  }, [units, folder, funits]);

  return (
    <Panel
      anchor="right"
      open
      onClose={onClose}
      title="Tiến độ báo cáo"
    >
      <Table
        columns={columns}
        data={rows}
        disableGlobalFilter
        disableGroupBy
        rowHeight={56}
      />
    </Panel>
  );
}

ReportsUnits.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
};

export default ReportsUnits;
