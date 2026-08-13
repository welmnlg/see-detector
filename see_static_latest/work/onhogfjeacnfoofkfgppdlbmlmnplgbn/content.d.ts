/// <reference types="chrome" />
import type { Message } from '@subwallet/extension-base/types';
export declare class ContentHandler {
    port?: chrome.runtime.Port;
    isShowNotification: boolean;
    isConnected: boolean;
    getPort(): chrome.runtime.Port;
    onPortMessageHandler(data: {
        id: string;
        response: any;
    }): void;
    onDisconnectPort(port: chrome.runtime.Port, onMessage: (data: {
        id: string;
        response: any;
    }) => void, onDisconnect: () => void): void;
    onPageMessage({ data, source }: Message): void;
    redirectIfPhishingProm(): void;
    constructor();
}
