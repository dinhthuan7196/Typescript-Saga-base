import React, { useMemo } from 'react';

import {
  TreeItem,
  Typography,
  Box,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';

function Folder({
  id,
  name,
  folders,
}) {
  const {
    children,
    rest,
  } = useMemo(() => ({
    children: folders.filter(({ parent }) => parent === id),
    rest: folders.filter(({ id: fid }) => fid !== id),
  }), [id, folders]);

  return (
    <TreeItem
      nodeId={id}
      label={(
        <Box
          display="flex"
          height={30}
          flexGrow={1}
          alignItems="center"
        >
          <Typography>
            {name}
          </Typography>
        </Box>
      )}
    >
      {children.map(({ id: fid, name: label }) => (
        <Folder
          key={fid}
          id={fid}
          name={label}
          folders={rest}
        />
      ))}
    </TreeItem>
  );
}

Folder.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  folders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired,
  })).isRequired,
};

export default Folder;
