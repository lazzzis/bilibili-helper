/**
 * Author: Ruo
 * Create: 2018-06-12
 * Description: 功能点打包入口
 */
// 然后再加载子类
import {DynamicCheck, DynamicCheckUI} from './dynamicCheck';
import {Video, VideoUI} from './video';
//export * from './doSign';
import {Treasure, TreasureUI} from './treasure';
import {GoogleAnalytics} from './googleAnalytics';
import {Debug} from './debug';
import {Danmu, DanmuUI} from './danmu';
import {Popup, PopupUI} from './popup';
import {Menu, MenuUI} from './menu';
import {ChatFilter, ChatFilterUI} from 'Modules/chatFilter';

export const Features = {
    Debug,
    Popup,
    Treasure,
    Menu,
    GoogleAnalytics,
    Video,
    Danmu,
    DynamicCheck,
    ChatFilter,
};

export const UIs = {
    PopupUI,
    TreasureUI,
    MenuUI,
    VideoUI,
    DanmuUI,
    DynamicCheckUI,
    ChatFilterUI,
};