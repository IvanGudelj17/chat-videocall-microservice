import { SignalData } from "simple-peer";

export interface CreateUserReq {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserReq {
  email: string;
  password: string;
}

export interface LoginUserRes {
  id: string;
  username: string;
  email: string; // ➕ dodaj ovo
  accessToken: string;
}


export interface User {
  id: string;
  username: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface Message {
  content: string;
  username: string;
  roomId: string;
}
//videcall

export interface WSChatMessage {
  type: 'chat';
  content: string;
  username: string;
  roomId: string;
}

export interface WSNotificationMessage {
  type: 'notification';
  content: string;
  username: string;
  roomId: string;
}

export interface WSSignalMessage {
  type: 'signal';
  roomId: string;
  from: string;           // novo
  data: SignalData;
}
export interface WSCallRequestMessage {
  type: 'call-request';
  username: string;
  roomId: string;
  content: string;
}

export interface WSCallAcceptMessage {
  type: 'call-accept';
  username: string;
  roomId: string;
}
export interface WSCallEndMessage {
  type: 'call-end';
  username: string;
  roomId: string;
}

export type WSMessage =
  | WSChatMessage
  | WSNotificationMessage
  | WSSignalMessage
  | WSCallRequestMessage
  | WSCallAcceptMessage
  | WSCallEndMessage;
