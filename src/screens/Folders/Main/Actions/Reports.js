import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';

import { DatePickerInput, Waiting, Table } from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  IconButton,
  Typography,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { cloneDeep, set, unset } from '@xbotvn/utils/collection';
import { startOfDay } from '@xbotvn/utils/date';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Icons, Units } from '../../../../components';
import { handleUpdateFolder } from '../../../../redux/actions/folders';

function Reports({
  onClose,
  folderId,
}) {
  const dispatch = useDispatch();
  const skipPageResetRef = useRef();
  const {
    folder,
    funits,
    units,
    handling,
  } = useSelector(({ folders, units: unitsStore }) => ({
    folder: folders?.data?.[folderId] ?? {},
    units: unitsStore?.data ?? {},
    funits: folders?.units ?? {},
    handling: folders?.handling ?? false,
  }));

  const [expire, setExpire] = useState(folder.expire ? new Date(folder.expire) : null);
  const [extend, setExtend] = useState(folder.extend || {});
  const [reports, setReports] = useState(folder.reports || []);
  const [selectUnits, setSelectUnits] = useState(false);

  const columns = useMemo(() => [
    {
      Header: 'Tên Đơn vị',
      accessor: 'name',
      disableEdit: true,
      width: 400,
    },
    {
      Header: 'Gia Hạn',
      accessor: 'extend',
      type: 'date',
      width: 200,
    },
    {
      Header: ' ',
      accessor: 'id',
      action: true,
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <IconButton size="small" onClick={() => setReports((prevReports) => prevReports.filter((id) => id !== value))}>
          <Icons.XBin stroke={colors.red[400]} />
        </IconButton>
      ),
      width: 50,
    },
  ], []);

  const data = useMemo(() => reports.map((unitId) => ({
    name: funits?.[unitId]?.name ?? (units?.[unitId]?.name ?? unitId),
    extend: extend?.[unitId] ? new Date(extend[unitId]) : null,
    id: unitId,
  })), [funits, reports, extend]);

  useEffect(() => {
    skipPageResetRef.current = false;
  }, [data]);

  return (
    <Dialog
      open
      maxWidth="md"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle
        onClose={onClose}
        title="Phân Công"
        icon={<Icons.XManagerList />}
      />
      <DialogContent dividers>
        {handling ? <Waiting fullscreen /> : null}
        {selectUnits ? (
          <Units
            onClose={() => setSelectUnits(false)}
            selected={reports}
            onSelectChanged={(selected) => setReports(selected)}
          />
        ) : null}
        <Grid container>
          <Grid item xs={6} style={{ zIndex: 10, paddingLeft: '16px' }}>
            <DatePickerInput
              value={expire}
              onDayChange={(date) => setExpire(date ? (date || startOfDay(date)) : null)}
              inputProps={{
                label: 'Thời hạn',
                fullWidth: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            {
              data.length ? (
                <Table
                  columns={columns}
                  data={data}
                  height={400}
                  disableGlobalFilter
                  disableGroupBy
                  autoResetPage={!skipPageResetRef.current}
                  autoResetExpanded={!skipPageResetRef.current}
                  autoResetGroupBy={!skipPageResetRef.current}
                  autoResetSelectedRows={!skipPageResetRef.current}
                  autoResetSortBy={!skipPageResetRef.current}
                  autoResetFilters={!skipPageResetRef.current}
                  autoResetRowState={!skipPageResetRef.current}
                  rowHeight={56}
                  updateHandler={(rowId, column, newValue) => {
                    skipPageResetRef.current = true;
                    if (column === 'extend') {
                      setExtend((prevExtend) => {
                        const cloned = cloneDeep(prevExtend);
                        if (newValue) {
                          set(cloned, rowId, startOfDay(newValue).getTime());
                        } else unset(cloned, rowId);
                        return cloned;
                      });
                    }
                  }}
                />
              ) : (
                <Box
                  height={400}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Typography>Chưa có danh sách, vui lòng thêm đơn vị được phân công</Typography>
                </Box>
              )
            }
          </Grid>
        </Grid>
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
                reports,
                expire: expire ? expire.getTime() : '',
                extend,
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

Reports.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
};

export default Reports;
