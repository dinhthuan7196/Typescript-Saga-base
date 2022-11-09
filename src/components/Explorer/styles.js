import { TreeView } from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import styled from 'styled-components';

export const StyledTree = styled(TreeView)`
  .Mui-selected {
    background: ${colors.primary[400]};
    color: white;
  }
`;
