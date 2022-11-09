import React, { useState } from 'react';

import { Waiting, Notification, Confirmation } from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Box,
  Typography,
  IconButton,
  Icon,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { format, formatDistanceToNow } from '@xbotvn/utils/date';
import { formatBytes } from '@xbotvn/utils/string';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Icons } from '../../../../components';
import { callFileAPI } from '../../../../libs/backend';
import { handleRemoveFiles } from '../../../../redux/actions/files';
import { hasPermission } from '../../utils';

function History({
  onClose,
  folderId,
  name,
  history,
  overdue,
}) {
  const dispatch = useDispatch();
  const {
    folder,
    userStore,
    unitId,
  } = useSelector(({ folders, user }) => ({
    userStore: user,
    folder: folders?.data?.[folderId] ?? {},
    unitId: user?.unit?.id ?? '',
  }));

  const fullPermision = hasPermission('full', folder?.permissions ?? [], userStore);

  const [remove, setRemove] = useState(false);
  const [handling, setHandling] = useState(false);
  const [showComment, setShowComment] = useState();

  return (
    <Dialog
      open
      maxWidth="md"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle
        icon={<Icons.XLoadingBack />}
        title={name}
        onClose={onClose}
      />
      <DialogContent dividers>
        {handling ? <Waiting fullscreen /> : null}
        {showComment ? (
          <Dialog
            maxWidth="sm"
            fullWidth
            open
            onClose={() => setShowComment()}
          >
            <DialogTitle
              title="Nhận Xét"
              onClose={() => setShowComment()}
            />
            <DialogContent>
              <Box display="flex" pb={2} alignItems="baseline">
                <Box flexGrow={1}>
                  <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                    {showComment.user || ''}
                  </Typography>
                </Box>
                <Typography variant="caption">
                  {showComment.time ? formatDistanceToNow(showComment.time) : ''}
                </Typography>
              </Box>
              {showComment?.content ?? 'Không có nội dung.'}
            </DialogContent>
          </Dialog>
        ) : null}
        {remove ? (
          <Confirmation
            onClose={() => setRemove()}
            severity="warning"
            description="Sau khi xóa thì sẽ không thể khôi phục lại được"
            primaryAction={() => {
              dispatch(handleRemoveFiles(
                folderId,
                [remove],
                false,
                () => {
                  setRemove();
                  onClose();
                },
              ));
            }}
          />
        ) : null}
        <List style={{ overflow: 'auto' }}>
          {history.map(({
            created,
            modified,
            size,
            id,
            unit,
            comment,
          }) => {
            const time = (modified || created)?.time ?? '';
            const user = (modified || created)?.user ?? '';
            const canRemove = !overdue && (unit === unitId);
            return (
              <ListItem key={id} style={{ boxShadow: 'inset 0px -1px 0px #F4F4F5' }}>
                <Box display="flex" alignItems="baseline" width={1}>
                  <Box flexGrow={1} minWidth={150}>{user || 'Anonymous'}</Box>
                  <Box width={100} display="flex" justifyContent="flex-end">
                    <Typography>{time ? format(time, 'hh:mm:ss') : ''}</Typography>
                  </Box>
                  <Box width={140} display="flex" justifyContent="center">
                    <Typography>{time ? format(time, 'dd/MM/yyyy') : ''}</Typography>
                  </Box>
                  <Box width={120} display="flex" justifyContent="left">
                    <Typography>{formatBytes(size)}</Typography>
                  </Box>
                  <Box width={40}>
                    {comment ? (
                      <IconButton onClick={() => setShowComment(comment)}>
                        <Icon>feedback</Icon>
                      </IconButton>
                    ) : null}
                  </Box>
                  <Box width={40}>
                    <IconButton
                      onClick={async () => {
                        setHandling(true);
                        try {
                          const data = await callFileAPI('file/download', { id, unitID: unit }, true);
                          setHandling(false);
                          saveAs(new Blob([data]), name);
                        } catch ({ message }) {
                          setHandling(false);
                          Notification.warn(`Tải file không thành công: ${message}`);
                        }
                      }}
                    >
                      <Icons.XDownload />
                    </IconButton>
                  </Box>
                  <Box width={40}>
                    {(fullPermision && canRemove) ? (
                      <IconButton onClick={() => setRemove(id)}>
                        <Icons.XBin stroke={colors.red[400]} />
                      </IconButton>
                    ) : null}
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
}

History.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  history: PropTypes.arrayOf(PropTypes.shape({
    created: PropTypes.shape({
      user: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
    }).isRequired,
    modified: PropTypes.shape({
      user: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
    }),
    size: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    comment: PropTypes.string,
  })).isRequired,
  overdue: PropTypes.bool,
};

History.defaultProps = {
  overdue: false,
};

export default History;
