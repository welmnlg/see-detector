/// <reference types="chrome" />
import { MessageTypes, TransportRequestMessage } from '@subwallet/extension-base/background/types';
import { SWHandler } from '@subwallet/extension-base/koni/background/handlers';
export declare type HandlerMethod = <TMessageType extends MessageTypes>({ id, message, request }: TransportRequestMessage<TMessageType>, port: chrome.runtime.Port) => void;
export declare class ActionHandler {
    private mainHandler?;
    private waitMainHandler;
    private connectionMap;
    private firstTrigger;
    private waitFirstTrigger;
    waitFirstActiveMessage: Promise<void>;
    private isActive;
    private isFullActive;
    private sleepTimeout?;
    get isContentConnecting(): boolean;
    get isExtensionConnecting(): boolean;
    constructor();
    setHandler(handler: SWHandler): void;
    onInstalled(details: chrome.runtime.InstalledDetails): void;
    private _getPortId;
    private handleKeyringLock;
    private _onPortMessage;
    private _onPortDisconnect;
    handlePort(port: chrome.runtime.Port): void;
    static _instance: ActionHandler;
    static get instance(): ActionHandler;
}
