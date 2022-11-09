import React, { useState } from 'react';

import { TextField } from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';

function Authority({ onChange }) {
  const [value, setValue] = useState('');

  return (
    <TextField
      label="Người Ký"
      fullWidth
      value={value}
      onChange={(e) => setValue(e.target.value)}
      inputProps={{
        onBlur: () => onChange(value),
      }}
    />
  );
}

Authority.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default Authority;
