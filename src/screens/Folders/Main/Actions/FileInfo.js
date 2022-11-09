import React, { useState, useMemo } from 'react';

import { AutoComplete, Notification, DatePickerInput } from '@xbotvn/react-ui/components';
import {
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  Grid,
} from '@xbotvn/react-ui/core';
import { startOfDay } from '@xbotvn/utils/date';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Icons } from '../../../../components';
import { handleUpdateFile } from '../../../../redux/actions/files';

function FileInfo({
  onClose,
  fileId,
  folderId,
  unit: ownerUnit,
  name: initName,
  description: initDescription,
  labels: initLabels,
  docType: initDocType,
  docNo: initDocNo,
  category: initCategory,
  date: initDate,
  authority: initAuthority,
}) {
  const dispatch = useDispatch();
  const {
    unit,
    folder,
    categoriesOptions,
    docTypesOptions,
  } = useSelector(({ user, folders, catalogs }) => ({
    unit: user?.unit ?? {},
    folder: folders?.data?.[folderId] ?? {},
    categoriesOptions: catalogs.system?.product?.data?.config?.categories ?? {},
    docTypesOptions: catalogs.system?.product?.data?.config?.docTypes ?? {},
  }));

  const splitedFileName = initName.split('.');
  const fileExtened = splitedFileName[splitedFileName.length - 1];
  const initFileName = initName.replace(`.${fileExtened}`, '');

  const [name, setName] = useState(initFileName);
  const [description, setDescription] = useState(initDescription || '');
  const [labels, setLabels] = useState(initLabels);
  const [docType, setDocType] = useState(initDocType);
  const [docNo, setDocNo] = useState(initDocNo);
  const [category, setCategory] = useState(initCategory);
  const [date, setDate] = useState(initDate ? new Date(initDate) : new Date());
  const [authority, setAuthority] = useState(initAuthority);

  const labelsOptions = useMemo(() => unit?.labels ?? [], [unit]);
  const docMode = useMemo(() => folder.storeType === 'document', [folder]);

  const categories = useMemo(() => {
    const temp = docTypesOptions[docType]?.categories ?? [];
    if (temp.length) setCategory(temp[0]);
    return temp;
  }, [docType, categoriesOptions, docTypesOptions]);

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
              label="Tên file"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          {docMode ? (
            <>
              <Grid item xs={7}>
                <AutoComplete
                  value={docType || null}
                  options={Object.keys(docTypesOptions)}
                  getOptionLabel={(value) => docTypesOptions?.[value].name}
                  onChange={(e, value) => setDocType(value)}
                  inputProps={{
                    label: 'Tên Văn Bản',
                    placeholder: 'Chọn Tên Văn Bản',
                    required: true,
                  }}
                />
              </Grid>
              {categories.length ? (
                <Grid item xs={5}>
                  <AutoComplete
                    disabled={ownerUnit !== unit.id}
                    value={category}
                    options={categories}
                    getOptionLabel={(value) => categoriesOptions?.[value]}
                    onChange={(e, value) => setCategory(value)}
                    inputProps={{
                      label: 'Thể loại văn bản',
                    }}
                  />
                </Grid>
              ) : null}
              <Grid item xs={7}>
                <TextField
                  disabled={ownerUnit !== unit.id}
                  label="Số/Ký hiệu"
                  required
                  fullWidth
                  value={docNo}
                  onChange={(e) => setDocNo(e.target.value)}
                />
              </Grid>
              <Grid item xs={5}>
                <DatePickerInput
                  value={date}
                  onDayChange={(d) => setDate(d || null)}
                  inputProps={{
                    label: 'Ngày ban hành',
                    fullWidth: true,
                    required: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={ownerUnit !== unit.id}
                  label="Người Ký"
                  fullWidth
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                />
              </Grid>
            </>
          ) : null}
          <Grid item xs={12}>
            <TextField
              disabled={ownerUnit !== unit.id}
              label={folder.storeType === 'document' ? 'Trích lục' : 'Mô tả'}
              multiline
              rows={7}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          {folder.storeType !== 'document' ? (
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
          ) : null}
        </Grid>
      </DialogContent>
      {(ownerUnit === unit.id) ? (
        <DialogActions>
          <Button
            color="primary"
            startIcon={<Icons.XSave stroke="white" />}
            onClick={() => {
              const missing = [];

              if (!name.trim()) missing.push('Tên file');

              if (folder.storeType === 'document') {
                if (!docType) missing.push('Tên văn bản');
                if (!docNo) missing.push('Số/Ký hiệu');
                if (!date) missing.push('Ngày ban hành');
              }

              if (missing.length) Notification.error(`${missing.join(', ')} không được bỏ trống.`);
              else {
                const joinedName = [name.trim(), fileExtened].join('.');
                const content = {
                  name: joinedName,
                  description,
                  labels,
                };
                if (folder.storeType === 'document') {
                  content.docNo = docNo;
                  content.docType = docType;
                  content.category = category;
                  content.date = date ? startOfDay(date).getTime() : null;
                  if (date) content.year = date.getFullYear();
                  content.authority = authority;
                }

                dispatch(handleUpdateFile(
                  fileId,
                  folderId,
                  content,
                  onClose,
                ));
              }
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}

FileInfo.propTypes = {
  onClose: PropTypes.func.isRequired,
  fileId: PropTypes.string.isRequired,
  folderId: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
  labels: PropTypes.arrayOf(PropTypes.string),
  docType: PropTypes.string,
  docNo: PropTypes.string,
  category: PropTypes.string,
  date: PropTypes.number,
  authority: PropTypes.string,
};

FileInfo.defaultProps = {
  name: '',
  description: '',
  labels: [],
  docType: '',
  docNo: '',
  category: '',
  date: null,
  authority: '',
};

export default FileInfo;
