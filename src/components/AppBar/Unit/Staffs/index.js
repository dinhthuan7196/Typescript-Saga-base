import React, {
  useMemo, useRef, useEffect, useState,
} from 'react';

import { Table, Confirmation } from '@xbotvn/react-ui/components';
import { IconButton } from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import * as Icons from '../../../Icons';

function Staffs({ staffs, admins, onChange }) {
  const skipPageResetRef = useRef();
  const [confirmation, setConfirmation] = useState();
  const {
    userEmail,
  } = useSelector(({ user }) => ({
    userEmail: user?.email,
  }));

  const columns = useMemo(() => [
    {
      Header: 'Họ và Tên',
      accessor: 'displayName',
      width: 220,
      disableEdit: true,
    },
    {
      Header: 'Email',
      accessor: 'email',
      disableEdit: true,
      width: 240,
    },
    {
      Header: 'Giới Tính',
      accessor: 'gender',
      lookup: {
        m: 'Nam',
        f: 'Nữ',
      },
      width: 100,
      disableEdit: true,
    },
    {
      Header: 'Quản Trị',
      accessor: 'admin',
      type: 'checkbox',
      width: 90,
    },
    {
      Header: ' ',
      accessor: 'id',
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        value !== userEmail ? (
          <IconButton size="small" onClick={() => setConfirmation(value)}>
            <Icons.XBin stroke={colors.red[400]} />
          </IconButton>
        ) : null
      ),
      action: true,
      width: 50,
      sticky: 'right',
    },
  ], []);

  const rows = useMemo(() => staffs.map((staff) => ({
    id: staff.email,
    ...staff,
    gender: staff.male ? 'm' : 'f',
    admin: admins.includes(staff.email),
  })), [staffs, admins]);

  useEffect(() => {
    skipPageResetRef.current = false;
  }, [rows]);

  return (
    <>
      {confirmation ? (
        <Confirmation
          severity="warning"
          description="Sau khi xóa thì tài khoản sẽ không có quyền đăng nhập."
          onClose={() => setConfirmation()}
          primaryAction={() => {
            onChange(confirmation);
            setConfirmation();
          }}
        />
      ) : null}
      <Table
        columns={columns}
        data={rows}
        updateHandler={(rowId, column, newValue) => {
          skipPageResetRef.current = true;
          onChange(rowId, newValue);
        }}
        disableGlobalFilter
        disableGroupBy
        autoResetPage={!skipPageResetRef.current}
        autoResetExpanded={!skipPageResetRef.current}
        autoResetGroupBy={!skipPageResetRef.current}
        autoResetSelectedRows={!skipPageResetRef.current}
        autoResetSortBy={!skipPageResetRef.current}
        autoResetFilters={!skipPageResetRef.current}
        autoResetRowState={!skipPageResetRef.current}
        height={window.innerHeight - 260}
        usePagination={false}
        rowHeight={56}
      />
    </>
  );
}

Staffs.propTypes = {
  onChange: PropTypes.func.isRequired,
  staffs: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
    gender: PropTypes.bool,
    phoneNumber: PropTypes.string,
  })),
  admins: PropTypes.arrayOf(PropTypes.string),
};

Staffs.defaultProps = {
  staffs: [],
  admins: [],
};

export default Staffs;
