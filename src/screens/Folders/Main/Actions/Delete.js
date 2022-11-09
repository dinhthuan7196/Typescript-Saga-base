import React, { useMemo } from 'react';

import { Confirmation } from '@xbotvn/react-ui/components';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { handleRemoveFiles } from '../../../../redux/actions/files';
import { handleRemoveFolders } from '../../../../redux/actions/folders';

function Delete({
  onClose,
  folderId,
  selected,
}) {
  const dispatch = useDispatch();

  const groupData = useMemo(() => {
    const files = [];
    const folders = [];
    Object.values(selected).forEach(({ id, type }) => {
      if (type === 'folder') {
        folders.push(id);
      } else {
        files.push(id);
      }
    });
    return {
      files,
      folders,
    };
  }, [selected]);

  const description = useMemo(() => {
    const { files, folders } = groupData;
    if (files.length && !folders.length) { return 'Tất cả lịch sử và nhận xét (nếu có) cũng sẽ bị xóa.'; }
    return 'Tất cả thư mục con và files sẽ bị xóa theo.';
  }, [groupData]);

  return (
    <Confirmation
      onClose={onClose}
      severity="warning"
      description={description}
      primaryAction={() => {
        const { files, folders } = groupData;
        if (folders.length) {
          dispatch(handleRemoveFolders(folders, () => onClose(true)));
        }
        if (files.length) {
          dispatch(handleRemoveFiles(
            folderId,
            files,
            true,
            () => onClose(true),
          ));
        }
      }}
    />
  );
}

Delete.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
  selected: PropTypes.array.isRequired,
};

export default Delete;
