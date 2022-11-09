import { Button } from '@xbotvn/react-ui/core';
import styled from 'styled-components';

import { BACKEND } from '../../config';

export const Container = styled.div`
  color: #191423;
  background: url(${BACKEND}/images/Frame.jpg);
  background-position: 100% 30%;
  height: 100%;
  max-width: 1430px;
  margin-left: auto;
  margin-right: auto;
  position: fixed;
  background-repeat: no-repeat;

  h1 {
    text-transform: uppercase;
    font-size: 38px;
    margin-top: 16px;
  }

  strong {
    color: #0083ff;
  }
  .subContainer {
    width: 85vw;
    margin: 10px auto;
    overflow: auto;
    min-height: 100%;
    .introContainer {
      font-size: 18px;
      font-weight: 600;
      line-height: 28px;
      font-style: normal;
      margin-top: 18px;
      margin-bottom: 24px;
      li {
        margin: 12px 0;
      }
    }

    .login-by {
      font-style: normal;
      font-weight: 600;
      font-size: 18px;
      line-height: 28px;
    }
    .fail-login {
      font-style: normal;
      font-weight: bold;
      font-size: 16px;
      line-height: 24px;
    }
  }


  @media (max-width: 1600px ) {
    .subContainer {
      h1 {
        font-size: 28px;
      }
      .login-by  {
        font-size: 16px;
      }
      .fail-login {
        font-size: 14px;
      }
      .introContainer {
        line-height: 18px;
        font-size: 16px;
      }
    }
    p, li, span,  {
      font-size: 16px;
    }
    
    button {
      span {
        font-size: 12px;
      }
    }
    .information {
      margin-bottom: 50px;
      .sub {
        font-size: 14px;
      }
    }
  }
  @media (max-width: 1366px ) {
    & {
      position: relative;
    }
    .subContainer {
      width: 100%;
    }
  }
  
`;

export const DescriptionText = styled.div`
  p {
    font-size: 18px;
    font-weight: 600;
    line-height: 28px;
    font-style: normal;
    color: #6f5b99;
    margin-bottom: 0;
    margin-top: 0;
  }
  @media (max-width: 1280px ) {
    p {
      font-size: 16px;
      line-height: 26px;
    }
  }
`;

export const Logo = styled.img`
  width: 64px;
  height: auto;
`;

export const LoginContainer = styled.div`
  display: flex;
  margin-top: 16px;
  margin-bottom: 24px;
`;

export const LoginButton = styled(Button)`
  && {
    background-color: ${(props) => props.background};
    color: white;
    width: 150px;
    height: 40px;
    margin-right: 15px;
  }
  &&:hover {
    background-color: ${(props) => props.hover};
  }
`;

export const Information = styled.div`
  display: flex;
  margin-top: 12px;
  color: #454545;
  strong {
    padding-right: 5px;
  }
  .sub {
    margin-left: 10px;
    margin-right: 10px;
  }
  ul {
    padding-left: 20px;
  }
`;
