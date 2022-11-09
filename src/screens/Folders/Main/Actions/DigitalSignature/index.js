import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Waiting,
  Notification,
} from '@xbotvn/react-ui/components';
import {
  Grid,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  FormControl,
  Typography,
  Icon,
} from '@xbotvn/react-ui/core';
import interact from 'interactjs';
import PropTypes from 'prop-types';
import { pdfjs } from 'react-pdf';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Icons, Fortify, Signature } from '../../../../../components';
import { callFileAPI, callSignServer, callAPI } from '../../../../../libs/backend';
import { handleUploadFiles } from '../../../../../redux/actions/files';
import { CustomDialog } from './styles';
import {
  readCertificate,
  getSignature,
  signatureToBuffer,
  ondropActivate,
  onDragEnter,
  onDragLeave,
  onDropDeacTivate,
} from './utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function DigitalSignature({ onClose, file }) {
  const {
    email,
    signature: userSignature,
    unit,
    connectors,
  } = useSelector(({ user, catalogs }) => ({
    ...user,
    connectors: catalogs?.system?.product?.data?.config?.connectors ?? [],
  }));

  const [handling, setHandling] = useState(false);
  const [contact, setContact] = useState(email);
  const [location, setLocation] = useState(unit?.name ?? '');
  const [display, setDisplay] = useState(true);
  const [reason, setReason] = useState('');
  const [showFortify, setShowFortify] = useState(false);
  const [pdf, setPDF] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [rotation, setRotation] = useState(0);
  const dialogRef = document.querySelector('.dialogcontent');
  const canvasContainerRef = useRef();
  const imageOuterRef = useRef();
  const signatureRef = useRef();
  const imageRef = useRef();
  const canvasRef = useRef();
  const routerParams = useParams();
  const dispatch = useDispatch();
  const {
    folder: folderId,
  } = routerParams || {};

  const renderPage = useCallback(
    async ({ pdfDoc, pageNum }) => {
      const pageToRead = await pdfDoc.getPage(pageNum);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const viewport = pageToRead.getViewport({ scale: 1 });
        setRotation(viewport.rotation);
        canvasRef.current.width = viewport.width;
        canvasRef.current.height = viewport.height;
        pageToRead.render({
          canvasContext: ctx,
          viewport,
        });
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.width);
          ctx.beginPath();
        }
      }
    },
    [canvasRef],
  );
  const prevPage = () => {
    if (currentPage > 1) {
      renderPage({ pdfDoc: pdf, pageNum: currentPage - 1, scale: 1 });
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < numPages) {
      renderPage({ pdfDoc: pdf, pageNum: currentPage + 1, scale: 1 });
      setCurrentPage(currentPage + 1);
    }
  };

  const mousePosition = { x: 10, y: 10 };
  const dragMoveListener = (event) => {
    const { target } = event;
    mousePosition.x += event.dx;
    mousePosition.y += event.dy;
    target.setAttribute('data-x', mousePosition.x);
    target.setAttribute('data-y', mousePosition.y);
    target.style.transform = `translate(${mousePosition.x}px, ${mousePosition.y}px)`;
  };

  useEffect(() => {
    const fetchPdf = async () => {
      setHandling(true);
      try {
        const useConnector = connectors.includes(file.unit);
        const suffix = useConnector ? 'connector/downloadFile' : 'file/download';
        const params = useConnector ? { keys: file.keys || [], connector: file.unit } : {
          id: file.id,
          unitID: unit?.id ?? '',
        };
        const fileData = await callFileAPI(suffix, params, true);
        if (file.name.includes('.pdf') && fileData) {
          const temp = await fileData.arrayBuffer().then((buffer) => buffer);
          const data = new Uint8Array(temp);
          const loadingTask = pdfjs.getDocument({ data });
          const pdfDoc = await loadingTask.promise;
          setPDF(pdfDoc);
          setNumPages(pdfDoc._pdfInfo.numPages);
          renderPage({ pdfDoc, pageNum: 1, scale: 1 });
          setHandling(false);
        } else {
          setHandling(false);
          onClose();
          Notification.error('file không hợp lệ');
        }
      } catch (error) {
        setHandling(false);
        onClose();
        Notification.warn('file không tồn tại');
      }
    };
    fetchPdf();
  }, [renderPage, canvasRef]);

  interact('.dropzone').dropzone({
    accept: '.drag-drop',
    overlap: 1,
    ondropactivate: ondropActivate,
    ondragenter: onDragEnter,
    ondragleave: onDragLeave,
    ondropdeactivate: onDropDeacTivate,
  });
  interact('.drag-drop')
    .draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: '#selectorContainer',
          endOnly: true,
          elementRect: {
            top: 0, left: 0, bottom: 1, right: 1,
          },
        }),
      ],
      autoScroll: true,
      onmove: dragMoveListener,
    })
    .resizable({
      edges: {
        top: true, left: true, bottom: true, right: true,
      },
      listeners: {
        move(event) {
          let { x, y } = event.target.dataset;
          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;
          Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            transform: `translate(${x}px, ${y}px)`,
          });
          Object.assign(event.target.dataset, { x, y });
        },
      },
    });

  const getSignParams = () => {
    const useConnector = connectors.includes(file.unit);
    const signatureWidth = signatureRef?.current?.offsetWidth;
    const maxPDFy = canvasRef?.current?.height;
    const offsetY = 7;
    const { x, y } = imageOuterRef?.current?.dataset ?? 0;
    const pdfY = parseFloat(y);
    const offsetHeight = imageRef?.current?.height ?? imageOuterRef?.current?.clientHeight ?? 0;
    const defaultPY = maxPDFy - offsetY - dialogRef?.scrollTop - offsetHeight;
    const pY = maxPDFy - offsetY - pdfY - offsetHeight - 8 - dialogRef?.scrollTop;
    const pX = parseFloat(x) - signatureWidth - 8;
    let actualX = pX || 0;
    let actualY = pY || defaultPY;
    let width = imageRef?.current?.width ?? imageOuterRef?.current?.clientWidth;
    let height = imageRef?.current?.height ?? imageOuterRef?.current?.clientHeight;
    const tempX = actualX;
    const tempY = actualY;
    switch (rotation) {
      case 90:
        actualX = canvasRef?.current?.height - tempY - height;
        actualY = tempX;
        [width, height] = [height, width];
        break;
      case 180:
        actualX = canvasRef?.current?.width - tempX - width;
        actualY = defaultPY - tempY;
        break;
      case 270:
        actualX = actualY - 8;
        actualY = canvasRef?.current?.width - tempX - width;
        [width, height] = [height, width];
        break;
      default:
        break;
    }

    if (useConnector) {
      return ({
        connector: file.unit,
        id: file.id,
        unitID: file.unit,
        keys: JSON.stringify(file?.keys),
        signerType: showFortify ? 'dsign' : 'esign',
        signer: JSON.stringify({
          contact,
          location,
          reason,
          signature: userSignature,
          display,
          page: currentPage,
          position: {
            x: actualX,
            y: actualY,
            width,
            height,
          },
        }),
      });
    }
    return ({
      id: file.id,
      unitID: file.unit,
      signer: JSON.stringify({
        contact,
        location,
        reason,
        signature: userSignature,
        display,
        page: currentPage,
        position: {
          x: actualX,
          y: actualY,
          width,
          height,
        },
      }),
    });
  };

  return (
    <CustomDialog
      open
      fullScreen
      onClose={onClose}
    >
      <DialogTitle
        title="Ký Số"
        icon={<Icons.XPen />}
        onClose={onClose}
      />
      <DialogContent
        dividers
        className="dialogcontent"
      >
        {handling ? <Waiting fullscreen /> : null}
        <Grid container spacing={1}>
          <Grid
            container
            item
            lg={4}
            md={4}
          >
            {showFortify ? (
              <Grid item xs={12}>
                <Fortify
                  onClose={() => setShowFortify(false)}
                  onContinue={async (certificate) => {
                    try {
                      if (certificate) {
                        setHandling(true);
                        const cert = await readCertificate(certificate);
                        const { temp, hash } = await callSignServer('prepare', cert.x509, getSignParams());
                        const signature = await getSignature(cert, hash);
                        const signedData = await signatureToBuffer(signature);
                        /*
                        const valid = await verifySignature(cert, signedData, hash);
                        if (!valid) {
                          Notification.error('Could not verify signature');
                        }
                        */

                        const result = connectors.includes(file?.unit) ? await callAPI('connector/signFile', getSignParams()) : await callSignServer(
                          'sign',
                          signedData,
                          { temp, hash },
                          'blob',
                        );
                        const fileName = (file.name.split('.'))[0];
                        const signedFile = new File([new Blob([result])], `${fileName}_signed.pdf`);
                        dispatch(handleUploadFiles(folderId, [signedFile], false, true));
                        const downloadUrl = URL.createObjectURL(new Blob([result], { type: 'application/pdf', name: file.name }));
                        window.open(downloadUrl);
                        setHandling(false);
                        onClose();
                      }
                      setShowFortify(false);
                    } catch ({ message }) {
                      setHandling(false);
                      Notification.error(message);
                    }
                  }}
                />
              </Grid>
            ) : null}
            <Grid item xs={6}>
              <TextField
                label="Nơi Ký"
                fullWidth
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Liên Hệ"
                fullWidth
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ghi Chú"
                fullWidth
                multiline
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
                  Chữ Ký Điện Tử
                </Typography>
                <Signature signature={userSignature} />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                label="Hiển thị mô tả cạnh chữ ký"
                control={(
                  <Checkbox
                    checked={display}
                    onChange={() => setDisplay((prevDisplay) => !prevDisplay)}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid
            item lg={8}
            md={8}
            className="viewer"
            id="selectorContainer"
          >
            <div ref={signatureRef}>
              <p
                ref={imageOuterRef}
                className="drag-drop"
              >
                {
                  userSignature ? (
                    <img
                      className="signature"
                      ref={imageRef}
                      width="100%"
                      height="100%"
                      src={userSignature}
                      alt="signature"
                    />
                  ) : 'vị trí chữ ký'
                }
              </p>
            </div>
            <div>
              <div className="canvas-container" ref={canvasContainerRef}>
                <div className="dropzone">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
          </Grid>
        </Grid>

      </DialogContent>
      <DialogActions>
        {
          numPages > 1 ? (
            <>
              <Button onClick={prevPage} size="small">
                <Icon>skip_previous</Icon>
              </Button>
              <Button onClick={nextPage} size="small">
                <Icon>skip_next</Icon>
              </Button>
            </>
          ) : null
        }
        <div className="pagination">
          Trang
          {currentPage}
          /
          {numPages}
        </div>
        <Button
          color="primary"
          onClick={() => setShowFortify(true)}
        >
          Ký Số
        </Button>
        <Button
          color="primary"
          onClick={async () => {
            if (userSignature) {
              try {
                setHandling(true);
                const signed = connectors.includes(file?.unit) ? await callAPI('connector/signFile', getSignParams()) : await callSignServer(
                  'esign',
                  '',
                  getSignParams(),
                  'blob',
                );
                setHandling(false);
                const fileName = (file.name.split('.'))[0];
                const signedFile = new File([new Blob([signed])], `${fileName}_signed.pdf`);
                dispatch(handleUploadFiles(folderId, [signedFile], false, true));
                const downloadUrl = URL.createObjectURL(new Blob([signed], { type: 'application/pdf', name: file.name }));
                window.open(downloadUrl);
                onClose();
              } catch ({ message }) {
                setHandling(false);
                Notification.error(message);
              }
            } else Notification.error('Chưa có chữ ký, vui lòng tải lên chữ ký để tiếp tục.');
          }}
        >
          Ký Điện Tử
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

DigitalSignature.propTypes = {
  onClose: PropTypes.func.isRequired,
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    keys: PropTypes.array,
  }).isRequired,
};

export default DigitalSignature;
