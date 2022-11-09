import React, {
  useEffect,
  useMemo,
  Suspense,
  useState,
} from 'react';

import { Notification, Waiting } from '@xbotvn/react-ui/components';
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@xbotvn/react-ui/core';
import { ThemeProvider, Themes } from '@xbotvn/react-ui/styles';
import axios from 'axios';
import Parser from 'html-react-parser';
import { useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter,
  Route,
  Switch as RouterSwitch,
} from 'react-router-dom';

import packageJson from '../package.json';
import AuthorizedRoute from './AuthorizedRoute';
import { AppBar } from './components';
import { COMPANY, NOTIFICATIONS } from './config';
import { app } from './libs/firebase';
import { handleUpdateSettings } from './redux/actions/settings';
import { handleUserSignedIn } from './redux/actions/user';

const Folders = React.lazy(() => import('./screens/Folders'));
const NotFound = React.lazy(() => import('./screens/NotFound'));
const Welcome = React.lazy(() => import('./screens/Welcome'));

export default function App() {
  const dispatch = useDispatch();
  const {
    settings: { darkMode },
    logged,
    authorizing,
  } = useSelector(({
    settings,
    user,
  }) => ({
    settings,
    logged: user.email && user.unit?.id,
    authorizing: user?.authorizing ?? false,
  }));

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const cached = localStorage.getItem('settings');
    if (cached) {
      const parsed = JSON.parse(cached);
      dispatch(handleUpdateSettings(parsed));
      if (parsed.dark) { document.body.style.backgroundColor = '#30404d'; }
    }
    return app.auth().onAuthStateChanged((user) => {
      dispatch(handleUserSignedIn(user));
    });
  }, []);

  useEffect(() => {
    if (process.env.REACT_APP_STAGE !== 'development') {
      axios.post(NOTIFICATIONS, { product: 'fbot' }).then((results) => {
        setNotifications(results?.data ?? []);
      }).catch();
    }
  }, []);

  const ready = useMemo(() => !authorizing, [authorizing]);

  return ready ? (
    <ThemeProvider theme={Themes.default[darkMode ? 'dark' : 'light']}>
      {(logged && notifications.length) ? (
        <Dialog
          onClose={() => setNotifications((prev) => prev.shift())}
          open
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            title={notifications[0].title}
            onClose={() => setNotifications((prev) => prev.shift())}
          />
          <DialogContent>{Parser(notifications[0].content)}</DialogContent>
        </Dialog>
      ) : null}
      <BrowserRouter>
        <Suspense fallback={<Waiting fullscreen />}>
          <AppBar />
          <RouterSwitch>
            <Route exact path="/"><Welcome /></Route>
            <Route exact path="/welcome"><Welcome /></Route>
            <AuthorizedRoute exact path="/folders/:unit/:folder" component={Folders} />
            <Route component={() => <NotFound />} />
          </RouterSwitch>
        </Suspense>
      </BrowserRouter>
      <Box
        zIndex={998}
        height={50}
        bgcolor="#394b59"
        color="#f5f8fa"
        p={1}
        position="fixed"
        right={0}
        bottom={0}
        left={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption">
          {`FBOT v${packageJson.version} - © 2020, ${COMPANY.toUpperCase()} Technology JSC. All Rights Reserved.`}
        </Typography>
        {window.fcWidget ? (
          <Button
            size="small"
            style={{
              zIndex: 999,
              position: 'fixed',
              bottom: 10,
              right: 10,
              opacity: 0.9,
            }}
            onClick={() => window.fcWidget.open()}
          >
            Hỗ trợ
          </Button>
        ) : null}
      </Box>
      <Notification.Container />
    </ThemeProvider>
  ) : <Waiting fullscreen />;
}
