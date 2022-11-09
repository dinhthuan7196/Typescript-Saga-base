import React from 'react';

import { Box, Typography } from '@xbotvn/react-ui/core';

export default function Empty() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
    >
      <Box
        width="208px"
        height="208px"
      >
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" viewBox="0 0 208 208">
          <path
            d="M60.8 137l-61 12.2 54.4 24.5 17.3-4.5z"
            opacity="0.12"
            enableBackground="new"
          />
          <path d="M102.7 69.1l-3.5 8.1-57.6 11.6 12.6 84.9 103.4-23.2-9.1-89.8z" fill="#C1C1C1" />
          <path d="M54.2 173.7l17-74.8 49.9-11.4 5.2 7.5 40.1-6.5-8.8 62z" fill="#EAEAE9" />
        </svg>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="h6" gutterBottom>Thư mục này rỗng</Typography>
        <Typography>Hãy tải tài liệu của bạn lên để sử dụng</Typography>
      </Box>
    </Box>
  );
}
