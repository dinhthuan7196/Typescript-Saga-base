import React from 'react';

import {
  IconButton,
  Icon,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';

import * as Styles from './styles';

function Signature({ onRemove, signature }) {
  return (
    <Styles.ImgDiv>
      <img src={signature} alt="signature" />
      {onRemove ? (
        <IconButton
          style={{
            position: 'absolute',
            right: 0,
          }}
          onClick={onRemove}
          size="small"
        >
          <Styles.ClearIcon>
            <Icon sixe="small">clear</Icon>
          </Styles.ClearIcon>
        </IconButton>
      ) : null}
    </Styles.ImgDiv>
  );
}

Signature.propTypes = {
  onRemove: PropTypes.func,
  signature: PropTypes.string.isRequired,
};

Signature.defaultProps = {
  onRemove: undefined,
};

export default Signature;
