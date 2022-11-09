/* eslint-disable react/prop-types */
import React, { useState, useMemo, useEffect } from 'react';

import {
  Panel,
  Notification,
  Table,
} from '@xbotvn/react-ui/components';
import {

  Icon,
  IconButton,
  Box,
} from '@xbotvn/react-ui/core';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  callAPI,
  callFileAPI,
} from '../../../libs/backend';

function Documents({ onClose }) {
  const {
    isSupport,
    unitID,
  } = useSelector(({ user }) => ({
    isSupport: user?.account?.xbot?.support ?? false,
    unitID: user?.activeUnit ?? '',
  }));

  const [data, setData] = useState({});

  useEffect(async () => {
    const { documents } = await callAPI('api/documents');
    setData(documents);
  }, []);

  const columns = useMemo(() => [
    {
      Header: 'Số/Ký hiệu',
      accessor: 'symbol',
      width: 200,
      sticky: 'left',
    },
    {
      Header: 'Tên văn bản',
      accessor: 'name',
      width: 350,
    },
    {
      Header: 'Ngày ban hành',
      accessor: 'date',
      width: 200,
    },
    {
      Header: 'Cơ quan ban hành',
      accessor: 'company',
      width: 200,
    },
    {
      Header: ' ',
      accessor: 'file',
      width: 100,
      Cell: ({ cell: { value } }) => (
        <IconButton
          style={{ marginRight: 7 }}
          size="small"
          onClick={async () => {
            try {
              const content = await callFileAPI(
                'file/download',
                {
                  document: value,
                  unitID,
                },
                true,
              );
              saveAs(new Blob([content]), value);
              Notification.success('Tải văn bản thành công');
            } catch ({ message }) {
              Notification.error(message);
            }
          }}
        >
          <Icon>download</Icon>
        </IconButton>
      ),
    },
  ], [isSupport, data]);

  return (
    <Panel
      open
      anchor="right"
      onClose={onClose}
      title="Thư viện văn bản"
    >
      <Box ml={2} mr={2}>
        <Table
          columns={columns}
          data={Object.entries(data).map(([file, values]) => ({
            file,
            ...values,
          }))}
          getRowId={(row) => row.file}
          disableGlobalFilter
          disableFilters
          disableGroupBy
        />
      </Box>
    </Panel>
  );
}

Documents.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Documents;
