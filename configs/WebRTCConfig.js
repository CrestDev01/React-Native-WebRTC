export const SocketURL="https://e70e-110-227-237-101.ngrok-free.app"

export const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ]
};

export const connection = {'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true }]};

export const constraints = {
  video: true,
  audio: true,
};
