/* eslint-disable react/prop-types */
import React, { useState, useMemo, useEffect } from 'react';

import { Table, AutoComplete, Waiting } from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  Typography,
  Grid,
} from '@xbotvn/react-ui/core';
import { clone, set } from '@xbotvn/utils/collection';
import { startOfDay } from '@xbotvn/utils/date';
import { formatBytes } from '@xbotvn/utils/string';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Icons } from '../../../../components';
import { handleBatchUpdateFiles } from '../../../../redux/actions/files';
import Authority from './Authority';

function Documents({
  folderId,
  onClose,
}) {
  const dispatch = useDispatch();
  const {
    files,
    docTypesOptions,
    categoriesOptions,
    handling,
  } = useSelector(({
    files: filesStore,
    catalogs,
  }) => ({
    files: filesStore?.data?.[folderId] ?? {},
    docTypesOptions: catalogs.system?.product?.data?.config?.docTypes ?? {},
    categoriesOptions: catalogs.system?.product?.data?.config?.categories ?? {},
    handling: filesStore?.handling ?? false,
  }));

  const [workingFiles, setWorkingFiles] = useState({});
  const [docType, setDocType] = useState('');
  const [category, setCategory] = useState('');
  const [authority, setAuthority] = useState('');

  useEffect(() => {
    const incomplete = {};
    Object.entries(files).forEach(([fid, values]) => {
      if (['docNo', 'docType', 'category', 'date'].some((field) => !values[field])) {
        incomplete[fid] = values;
      }
    });
    setWorkingFiles(incomplete);
  }, [files]);

  const columns = useMemo(() => [
    {
      Header: 'Tên file',
      accessor: 'name',
      width: 250,
      sticky: 'left',
    },
    {
      Header: 'Số/Ký hiệu',
      accessor: 'docNo',
      width: 200,
    },
    {
      Header: 'Ngày ban hành',
      accessor: 'date',
      type: 'date',
      width: 150,
    },
    {
      Header: 'Người ký',
      accessor: 'authority',
      width: 250,
    },
    {
      Header: 'Số trang',
      accessor: 'pageCount',
      width: 100,
      disableEdit: true,
    },
    {
      Header: 'Dung lượng',
      accessor: 'size',
      width: 150,
      disableEdit: true,
      Cell: ({ cell: { value } }) => (
        <Typography variant="body1">{value ? formatBytes(value) : ''}</Typography>
      ),
    },
  ], [categoriesOptions]);

  const categories = useMemo(() => {
    const temp = docTypesOptions[docType]?.categories ?? [];
    if (temp.length) setCategory(temp[0]);
    return temp;
  }, [docType, categoriesOptions, docTypesOptions]);

  const rows = useMemo(() => Object.entries(workingFiles).map(
    ([id, values]) => ({ id, ...values }),
  ), [workingFiles]);

  useEffect(() => {
    setWorkingFiles((prev) => {
      const newWorkingFiles = clone(prev);
      Object.keys(prev).forEach((fid) => set(newWorkingFiles, `${fid}.authority`, authority));
      return newWorkingFiles;
    });
  }, [authority]);

  return (
    <Dialog
      open
      maxWidth="lg"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle
        icon={<Icons.XInformation />}
        title="Văn bản chưa số hoá xong"
        onClose={onClose}
      />
      <DialogContent dividers>
        {handling ? <Waiting fullscreen /> : null}
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <AutoComplete
              value={docType || null}
              options={Object.keys(docTypesOptions)}
              getOptionLabel={(value) => docTypesOptions?.[value].name || ''}
              onChange={(e, value) => setDocType(value)}
              inputProps={{
                label: 'Tên Văn Bản',
                placeholder: 'Chọn Tên Văn Bản',
                required: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <AutoComplete
              disabled={!categories.length}
              value={category}
              options={categories}
              getOptionLabel={(value) => categoriesOptions?.[value] || ''}
              onChange={(e, value) => setCategory(value)}
              inputProps={{
                label: 'Thể loại văn bản',
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <Authority onChange={(value) => setAuthority(value)} />
          </Grid>
        </Grid>
        <Table
          columns={columns}
          data={rows}
          updateHandler={(rowId, column, newValue) => {
            setWorkingFiles((prev) => {
              const updated = clone(prev);
              set(updated, `${rowId}.${column}`, newValue);
              return updated;
            });
          }}
          height={300}
          disableGlobalFilter
          disableFilters
          disableGroupBy
          rowHeight={56}
        />
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          startIcon={<Icons.XSave stroke="white" />}
          onClick={() => {
            const data = Object.entries(workingFiles).map(([fid, values]) => {
              const tmp = { id: fid };
              tmp.docNo = values.docNo || '';
              tmp.docType = values.docType || docType;
              tmp.category = values.category || category;
              tmp.authority = values.authority || '';
              if (values.date) {
                tmp.date = startOfDay(values.date).getTime();
                tmp.year = values.date.getFullYear();
              }
              return tmp;
            });
            dispatch(handleBatchUpdateFiles(folderId, data, onClose));
          }}
        >
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}

Documents.propTypes = {
  folderId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Documents;
