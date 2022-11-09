import { Box } from '@xbotvn/react-ui/core';
import styled from 'styled-components';

export const Info = styled(Box)`
  border: 1px dashed #0083ff;
  box-sizing: border-box;
  border-radius: 16px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  height: 72px;
`;

export const CustomInput = styled.div`
  .MuiInputBase-root {
    width: auto;
  }
  .create-signature {
    margin-top: 1rem;
  }
`;

export const SignaturePadCotainer = styled(Box)`
  canvas {
    border: 1px dashed;
  }
`;
