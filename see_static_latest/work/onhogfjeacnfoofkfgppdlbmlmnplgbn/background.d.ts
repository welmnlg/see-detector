import '@subwallet/extension-inject/crossenv';
import { SWHandler } from '@subwallet/extension-base/koni/background/handlers';
declare global {
    var KoniState: typeof SWHandler.instance.state;
    var KoniHandler: typeof SWHandler.instance;
}
