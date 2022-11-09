import React from 'react';

import {
  ListItemText,
  Box,
  ListItem,
  ListItemIcon,
  Typography,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';

function Row({
  header,
  icon,
  name,
  created,
  modified,
  expire,
  size,
  labels,
}) {
  const commonProps = header
    ? {
      variant: 'subtitle2',
      style: {
        fontWeight: 'bold',
      },
    } : {
      variant: 'body1',
    };

  return (
    <ListItem>
      {icon ? (
        <ListItemIcon style={{ minWidth: 0 }}>{icon}</ListItemIcon>
      ) : null}
      <ListItemText
        primary={(
          <Box display="inline-block">
            <Box display="inline-flex" width={300}>
              <Typography {...commonProps}>
                {name}
              </Typography>
            </Box>
            <Box display="inline-flex" width={200}>
              <Typography {...commonProps}>
                {created}
              </Typography>
            </Box>
            <Box display="inline-flex" width={150}>
              <Typography {...commonProps}>
                {modified}
              </Typography>
            </Box>
            <Box display="inline-flex">
              <Typography {...commonProps}>
                {expire}
              </Typography>
            </Box>
            <Box display="inline-flex">
              <Typography {...commonProps}>
                {size}
              </Typography>
            </Box>
            <Box display="inline-flex">
              <Typography {...commonProps}>
                {labels}
              </Typography>
            </Box>
          </Box>
        )}
      />
    </ListItem>
  );
}

Row.propTypes = {
  header: PropTypes.bool,
  icon: PropTypes.node,
  name: PropTypes.node,
  created: PropTypes.node,
  modified: PropTypes.node,
  expire: PropTypes.node,
  size: PropTypes.node,
  labels: PropTypes.node,
};

Row.defaultProps = {
  header: false,
  icon: null,
  name: null,
  created: null,
  modified: null,
  expire: null,
  size: null,
  labels: null,
};

export default Row;
