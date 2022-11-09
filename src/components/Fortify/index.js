import React, { useRef, useEffect } from 'react';

import PropTypes from 'prop-types';

function Fortify({ onClose, onContinue }) {
  const pecRef = useRef(null);

  useEffect(() => {
    pecRef.current.addEventListener('continue', async (event) => {
      onContinue(event.detail);
    });
    pecRef.current.addEventListener('cancel', () => {
      onClose();
    });
  }, []);

  return <peculiar-fortify-certificates ref={pecRef} />;
}

Fortify.propTypes = {
  onClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
};

export default Fortify;
