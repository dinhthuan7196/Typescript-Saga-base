import React, { useState } from 'react';

import {
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  Icon,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Icons } from '../../../../components';
import { handleWriteComment } from '../../../../redux/actions/files';

function Comment({
  onClose,
  fileId,
  folderId,
  comment: initComment,
}) {
  const dispatch = useDispatch();

  const [comment, setComment] = useState(initComment?.content ?? '');

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle
        icon={<Icon color="action">comment</Icon>}
        title="Nhận Xét"
        onClose={onClose}
      />
      <DialogContent dividers>
        <TextField
          label="Nội Dung"
          multiline
          rows={7}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          startIcon={<Icons.XSave stroke="white" />}
          onClick={() => {
            dispatch(handleWriteComment(
              fileId,
              folderId,
              comment,
              onClose,
            ));
          }}
        >
          Cập Nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}

Comment.propTypes = {
  onClose: PropTypes.func.isRequired,
  fileId: PropTypes.string.isRequired,
  folderId: PropTypes.string.isRequired,
  comment: PropTypes.shape({
    content: PropTypes.string,
  }),
};

Comment.defaultProps = {
  comment: {},
};

export default Comment;
