import React, { useMemo, useState } from 'react';

import { Table } from '@xbotvn/react-ui/components';
import {
  IconButton,
  Chip,
  Box,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import PropTypes from 'prop-types';

import * as Icons from '../../../Icons';
import Group from './Group';

function Groups({ staffs, groups, onChange }) {
  const [group, setGroup] = useState();
  const columns = useMemo(() => [
    {
      Header: 'Tên Nhóm',
      accessor: 'name',
      width: 300,
    },
    {
      Header: 'Nhân Sự',
      accessor: 'staffs',
      width: 100,
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => {
        const total = (value || []).length;
        if (total === 0) return '';
        return (
          <Chip
            label={total}
            color="primary"
          />
        );
      },
    },
    {
      Header: ' ',
      accessor: 'id',
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <>
          <IconButton size="small" onClick={() => setGroup(value)}>
            <Icons.XEdit />
          </IconButton>
          <IconButton size="small" onClick={() => onChange(value)}>
            <Icons.XBin stroke={colors.red[400]} />
          </IconButton>
        </>
      ),
      action: true,
      width: 80,
    },
  ], []);

  const rows = useMemo(() => Object.entries(groups).map(([id, values]) => ({
    id,
    ...values,
  })), [groups]);

  return (
    <>
      {group ? (
        <Group
          onClose={(name, emails = []) => {
            if (name) onChange(group, name, emails);
            setGroup();
          }}
          id={group}
          name={groups?.[group]?.name ?? ''}
          members={groups?.[group]?.staffs ?? []}
          staffs={staffs.map(({ email }) => email)}
          groups={groups}
        />
      ) : null}
      <Box
        mt={2}
        width={500}
        ml="auto"
        mr="auto"
      >
        <Table
          columns={columns}
          data={rows}
          disableFilters
          disableGlobalFilter
          disableGroupBy
          height={window.innerHeight - 260}
          usePagination={false}
          rowHeight={56}
        />
      </Box>
    </>
  );
}

Groups.propTypes = {
  onChange: PropTypes.func.isRequired,
  groups: PropTypes.object,
  staffs: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
    gender: PropTypes.bool,
  })),
};

Groups.defaultProps = {
  groups: {},
  staffs: [],
};

export default Groups;
