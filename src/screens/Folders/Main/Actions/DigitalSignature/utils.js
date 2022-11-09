import { arrayBufferfromHex } from '@xbotvn/utils/string';
import {
  ObjectIdentifier,
  fromBER,
  OctetString,
  Null,
} from 'asn1js';
import {
  Certificate,
  setEngine,
  CryptoEngine,
  Attribute,
  SignedData,
  EncapsulatedContentInfo,
  SignerInfo,
  IssuerAndSerialNumber,
  AlgorithmIdentifier,
  SignedAndUnsignedAttributes,
  ContentInfo,
} from 'pkijs';

export async function readCertificate(fortifyCert) {
  const provider = await fortifyCert.server.getCrypto(fortifyCert.providerId);
  provider.sign = provider.subtle.sign.bind(provider.subtle);
  setEngine(
    'newEngine',
    provider,
    new CryptoEngine({
      name: '',
      crypto: provider,
      subtle: provider.subtle,
    }),
  );

  const cert = await provider.certStorage.getItem(fortifyCert.certificateId);
  // cert binary data X.509
  const x509 = await provider.certStorage.exportCert('raw', cert);
  const privateKey = await provider.keyStorage.getItem(fortifyCert.privateKeyId);
  const pki = new Certificate({
    schema: fromBER(x509).result,
  });

  return {
    x509,
    pki,
    privateKey,
  };
}

async function getSignedExtension(hash) {
  const signedAttr = [];

  // contentType
  signedAttr.push(new Attribute({
    type: '1.2.840.113549.1.9.3',
    values: [
      new ObjectIdentifier({ value: '1.2.840.113549.1.7.1' }),
    ],
  }));

  // messageDigest
  signedAttr.push(new Attribute({
    type: '1.2.840.113549.1.9.4',
    values: [
      new OctetString({ valueHex: arrayBufferfromHex(hash) }),
    ],
  }));

  return signedAttr;
}

export async function getSignature(
  cert,
  hash,
  hashAlgorithm = 'SHA-256',
  detached = true,
) {
  const { pki, privateKey } = cert;
  const attributes = await getSignedExtension(hash);

  const signature = new SignedData({
    version: 1,
    encapContentInfo: new EncapsulatedContentInfo({
      eContentType: '1.2.840.113549.1.7.1',
    }),
    signerInfos: [
      new SignerInfo({
        version: 1,
        sid: new IssuerAndSerialNumber({
          issuer: pki.issuer,
          serialNumber: pki.serialNumber,
        }),
        signedAttrs: new SignedAndUnsignedAttributes({
          type: 0,
          attributes,
        }),
        signatureAlgorithm: new AlgorithmIdentifier({
          algorithmId: '1.2.840.113549.1.1.1',
          algorithmParams: new Null(),
        }),
      }),
    ],
    certificates: [pki],
  });

  if (detached) {
    try {
      await signature.sign(privateKey, 0, hashAlgorithm, arrayBufferfromHex(hash));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  } else {
    const contentInfo = new EncapsulatedContentInfo({
      eContent: new OctetString({ valueHex: arrayBufferfromHex(hash) }),
    });
    signature.encapContentInfo.eContent = contentInfo.eContent;
    await signature.sign(privateKey, 0, hashAlgorithm);
  }

  /*
    signature.signerInfos[0].signatureAlgorithm = new AlgorithmIdentifier({
      algorithmId: '1.2.840.113549.1.1.1',
      algorithmParams: new Null(),
    });
  */

  return signature;
}

export async function signatureToBuffer(signature, detached = true) {
  const cmsSignedSchema = signature.toSchema(true);
  const cmsContentSimp = new ContentInfo({
    contentType: '1.2.840.113549.1.7.2',
    content: cmsSignedSchema,
  });
  const _cmsSignedSchema = cmsContentSimp.toSchema();
  _cmsSignedSchema.lenBlock.isIndefiniteForm = true;

  const block1 = _cmsSignedSchema.valueBlock.value[1];
  block1.lenBlock.isIndefiniteForm = true;
  const block2 = block1.valueBlock.value[0];
  block2.lenBlock.isIndefiniteForm = true;
  if (!detached) {
    const block3 = block2.valueBlock.value[2];
    block3.lenBlock.isIndefiniteForm = true;
    block3.valueBlock.value[1].lenBlock.isIndefiniteForm = true;
    block3.valueBlock.value[1].valueBlock.value[0].lenBlock.isIndefiniteForm = true;
  }
  return _cmsSignedSchema.toBER(false);
}

export async function verifySignature(cert, signature, hash) {
  const { pki } = cert;
  const cmsSignedVerifier = new SignedData({
    schema: new ContentInfo({ schema: fromBER(signature).result }).content,
  });
  const valid = await cmsSignedVerifier.verify({
    signer: 0,
    trustedCerts: [pki],
    data: arrayBufferfromHex(hash),
  });
  return valid;
}

export const ondropActivate = (e) => {
  e.target.classList.add('drop-active');
};
export const onDragEnter = (e) => {
  const draggableElement = e.relatedTarget;
  const dropzoneElement = e.target;
  dropzoneElement.classList.add('drop-target');
  draggableElement.classList.add('can-drop');
  draggableElement.classList.remove('dropped-out');
};
export const onDragLeave = (e) => {
  e.target.classList.remove('drop-target');
  e.relatedTarget.classList.remove('can-drop');
  e.relatedTarget.classList.add('dropped-out');
};
export const onDropDeacTivate = (e) => {
  e.target.classList.remove('drop-active');
  e.target.classList.remove('drop-target');
};
