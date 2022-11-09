import React, { useMemo, useState } from 'react';

import { Notification, Panel } from '@xbotvn/react-ui/components';
import {

  Button,
  Box,
  Typography,
  Breadcrumbs,
  Icon,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { Explorer, Icons } from '../../../../components';
import { traceToRoot, hasPermission } from '../../utils';

function FolderSelect({
  onClose,
  onSelect,
  folderIds,
  title,
}) {
  const {
    folder,
    folders,
    unitId,
    userData,
  } = useSelector(({ folders: foldersStore, user }) => ({
    folders: foldersStore?.data ?? {},
    folder: foldersStore?.data?.[folderIds[0]] ?? {},
    unitId: user?.unit?.id ?? '',
    userData: user,
  }));

  const [selected, setSelected] = useState();

  const expanded = useMemo(
    () => traceToRoot(folder.parent, folders).map(({ id }) => id),
    [folders, folder],
  );
  const paths = useMemo(() => {
    const tail = traceToRoot(selected, folders).map((f) => f?.name ?? '???');

    return ['Hồ sơ đơn vị', ...tail];
  }, [folders, selected]);

  const findInvalidChild = (parentId, allFolders) => {
    const childs = Object.values(allFolders).filter(
      ({ parent }) => parent === parentId,
    ).map(({ id }) => id);
    if (!childs.length) return [];
    return [...childs, ...childs.map((id) => findInvalidChild(id, allFolders))].flat(Infinity);
  };
  const filtered = useMemo(() => {
    const parentFolders = Object.values(folders).map(({ id }) => {
      if (folderIds.includes(id)) {
        return id;
      }
      return null;
    }).filter((value) => value);
    const invalidChildFolders = [];
    parentFolders.forEach((id) => invalidChildFolders.push(...findInvalidChild(id, folders)));
    const temp = parentFolders.concat(invalidChildFolders);
    return Object.values(folders).filter(({ id, unit }) => (
      !temp.includes(id) && unit === unitId && hasPermission('full', folders?.[id]?.permissions, userData)
    ));
  }, [folders, unitId]);

  return (
    <Panel
      open
      onClose={onClose}
      anchor="right"
      title={title}
      actions={(
        <Box display="flex" justifyContent="flex-end" width={1}>
          <Button
            startIcon={<Icon>drive_file_move_rtl</Icon>}
            variant="text"
            color="primary"
            onClick={() => {
              onSelect('unit');
            }}
          >
            Di chuyển ra HSĐV
          </Button>
          <Button
            startIcon={<Icons.XArrangeArrow stroke={colors.primary[400]} />}
            variant="text"
            color="primary"
            onClick={() => {
              if (!selected) {
                Notification.warn('Vui lòng chọn thư mục để dời đến!');
                return;
              }
              onSelect(selected);
            }}
          >
            Di chuyển
          </Button>
        </Box>
      )}
    >
      <Box
        width={500}
        padding="20px"
      >
        <Typography>
          Di Chuyển vào
        </Typography>
        <Breadcrumbs
          itemsBeforeCollapse={0}
          maxItems={3}
          separator="/"
        >
          {paths.map((fname, idx) => <Typography variant="h6" key={idx}>{fname}</Typography>)}
        </Breadcrumbs>
        <Box
          height={300}
          mt={2}
        >
          <Explorer
            onSelectedChanged={(id) => setSelected(id)}
            selected={selected}
            expanded={expanded}
            folders={filtered}
          />
        </Box>
      </Box>
    </Panel>
  );
}

FolderSelect.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  folderIds: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};

export default FolderSelect;
