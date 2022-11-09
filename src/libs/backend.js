import axios from 'axios';

import { BACKEND } from '../config';
import { getToken } from './firebase';

export async function callAPI(path, params, buffer) {
  const data = new FormData();
  Object.entries(params || {}).forEach(([field, val]) => {
    data.append(field, val);
  });
  if (buffer) {
    data.append('files', new Blob([buffer]));
  }
  const result = await axios.post(`${BACKEND}/${path}`, data, { withCredentials: true });
  if (result.data) return result.data;
  throw Error('Tài khoản không có quyền truy cập');
}

export async function callSignServer(
  action,
  buffer,
  params = {},
  responseType = 'json',
) {
  const data = new FormData();
  Object.entries(params).forEach(([field, val]) => {
    data.append(field, val);
  });
  data.append('files', new Blob([buffer]));
  const options = {
    withCredentials: true,
    responseType,
  };

  const result = await axios.post(`${BACKEND}/file/${action}`, data, options);
  return result.data;
}

export async function uploadFiles(params, files, connector) {
  const data = new FormData();
  Object.entries(params).forEach(([field, val]) => {
    data.append(field, val);
  });
  if (connector) {
    data.append('file', files[0]);
  } else {
    Object.values(files).forEach((file) => {
      data.append('files', file);
    });
  }
  const suffix = connector ? 'connector/uploadFile' : 'file/upload';
  const result = await axios.post(`${BACKEND}/${suffix}`, data, {
    withCredentials: true,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  if (result.data) return result.data;
  throw Error('Tài khoản không có quyền truy cập.');
}

export async function callFileAPI(
  suffix,
  params,
  isDownload = false,
) {
  const options = { withCredentials: true };
  if (isDownload) options.responseType = 'blob';
  const result = await axios.post(`${BACKEND}/${suffix}`, params, options);
  if (result.data) return result.data;
  throw Error('Tài khoản không có quyền truy cập');
}

export const auth = (email, uid) => new Promise((resolve, reject) => {
  getToken(
    (token) => {
      axios.post(`${BACKEND}/api/auth`, {
        email,
        token,
        uid,
      }, { withCredentials: true }).then((user) => {
        if (user.data) resolve(user.data);
        else reject(Error('Tài khoản không có quyền truy cập'));
      }).catch(({ message }) => reject(Error(message)));
    },
    (message) => reject(Error(`Không lấy được token: ${message}`)),
  );
});

export const signedOut = () => {
  axios.post(`${BACKEND}/api/signedOut`, {}, { withCredentials: true }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });
};

export async function graphQLCaller(collection, query, variables) {
  const res = await axios.post(`${BACKEND}/database/${collection}`, {
    query,
    variables,
  }, {
    withCredentials: true,
  });
  const { data } = res;
  const errors = data?.errors ?? [];
  if (errors.length) {
    throw Error(`Lỗi: ${errors.map((err) => err?.message ?? '').join(', ')}`);
  } else {
    return data?.data ?? {};
  }
}
