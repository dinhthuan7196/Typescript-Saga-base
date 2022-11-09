import { colors } from '@xbotvn/react-ui/styles';
import styled from 'styled-components';

export const UnitContainer = styled.div`
width: 95%;
margin: 10px auto;
.MuiTab-textColorPrimary.Mui-selected {
  color: white;
  background: ${colors.primary[600]};
}
.MuiTab-textColorPrimary {
  color: ${colors.primary[500]};
  border: 1px solid ${colors.grey[200]};
}

`;
