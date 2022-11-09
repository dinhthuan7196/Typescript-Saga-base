import React, { useMemo, useState } from 'react';

import { Table } from '@xbotvn/react-ui/components';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Icon,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { formatBytes } from '@xbotvn/utils/string';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Delete from '../Main/Actions/Delete';

function InvalidFolders({ invalidFolders, onClose }) {
  const {
    allFolders,
  } = useSelector(({ folders }) => ({
    allFolders: folders?.data ?? {},
  }));
  const [selectedRows, setSelectedRows] = useState({});
  const [showDelete, setShowDelete] = useState();

  const invalidFoldersData = invalidFolders.map(
    ({ id, reason }) => ({ reason, ...allFolders[id] }),
  );

  const columns = useMemo(() => [
    {
      Header: 'Tên Thư mục',
      accessor: 'name',
      width: 300,
    },
    {
      Header: 'Tác giả',
      accessor: 'created',
      width: 300,
    },
    {
      Header: 'Chỉnh sửa',
      accessor: 'modified',
      width: 180,
    },
    {
      Header: 'Dung lượng',
      accessor: 'size',
      width: 180,
    },
    {
      Header: 'Lỗi',
      accessor: 'reason',
      width: 180,
    },
  ], []);

  const data = useMemo(() => invalidFoldersData.map(({
    created,
    modified,
    size,
    ...folder
  }) => ({
    created: created?.user,
    modified: modified?.user,
    type: 'folder',
    size: formatBytes(size),
    ...folder,
  })), []);
  const selected = useMemo(() => {
    const tmp = [];
    Object.entries(selectedRows).forEach(([id, checked]) => {
      if (checked) {
        const found = data.find((row) => row.id === id);
        if (found) {
          tmp.push(found);
        }
      }
    });
    return tmp;
  }, [selectedRows, invalidFolders]);

  return (
    <Dialog open onClose={onClose} maxWidth="lg">
      <DialogTitle title="Thư mục lỗi" onClose={onClose} />
      <DialogContent style={{
        padding: '20px 24px',
      }}
      >
        {showDelete ? (
          <Delete
            onClose={() => setShowDelete()}
            folderId=""
            selected={selected === 'selected' ? selected : data}
          />
        ) : null}
        <Table
          columns={columns}
          data={invalidFolders.length ? data : []}
          height={window.innerHeight - 500}
          disableGlobalFilter
          disableFilters
          disableGroupBy
          onSelect={setSelectedRows}
        />
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          startIcon={<Icon>layers_clear</Icon>}
          onClick={() => setShowDelete('all')}
          style={{
            color: colors.red[400],
          }}
          variant="text"
        >
          Xóa tất cả
        </Button>
        <Button
          startIcon={<Icon stroke={colors.red[400]}>delete_sweep</Icon>}
          onClick={() => setShowDelete('selected')}
          style={{
            color: colors.red[400],
          }}
          variant="text"
        >
          Xóa mục đã chọn
        </Button>
      </DialogActions>
    </Dialog>
  );
}

InvalidFolders.propTypes = {
  invalidFolders: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InvalidFolders;
