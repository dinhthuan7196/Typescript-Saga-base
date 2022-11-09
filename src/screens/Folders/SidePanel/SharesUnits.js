import React, { useMemo } from 'react';

import {
  Panel,
  Table,
} from '@xbotvn/react-ui/components';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

function SharesUnits({ onClose, folderId }) {
  const {
    shares,
    funits,
    units,
    unitTypesOptions,
  } = useSelector(({ folders, units: unitsStore, catalogs }) => ({
    shares: folders?.data?.[folderId]?.shares ?? [],
    units: unitsStore?.data ?? {},
    funits: folders?.units ?? {},
    unitTypesOptions: catalogs.system?.product?.data?.config?.unitTypes ?? {},
  }));

  const columns = useMemo(() => [
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
  ], []);

  const rows = useMemo(() => shares.map((id) => ({
    id,
    name: funits?.[id]?.name ?? (units?.[id]?.name ?? id),
    type: unitTypesOptions?.[funits?.[id]?.type ?? (units?.[id]?.type ?? '')]?.name ?? '',
  })), [shares, units, funits]);

  return (
    <Panel
      anchor="right"
      open
      onClose={onClose}
      title="Danh sách chia sẻ"
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

SharesUnits.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
};

export default SharesUnits;
