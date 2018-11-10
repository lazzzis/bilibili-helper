/**
 * Author: Ruo
 * Create: 2018-06-12
 * Description: 设置页面
 */

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {getURL, PERMISSION_TYPE, consoleLogo} from 'Utils';
import {
    __,
    isLogin,
    createTab,
    version,
} from 'Utils';
import {
    Button,
    Icon,
    Modal,
    Radio,
} from 'Components';
import {
    Body,
    List,
    //Header,
    SubPage,
    ListItem,
    RadioButtonGroup,
    CheckBoxGroup,
    UpdateList,
} from 'Components';
import {theme} from 'Styles';
import updateData from 'Statics/json/update.json';
import 'Styles/scss/config.scss';

//const {notifications} = PERMISSION_TYPE;

const ConfigBody = styled(Body).attrs({className: 'config-body'})`
  position: absolute;
  top: ${theme.headerHeight}px;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
`;

const Cat = styled.div`
  position: fixed;
  top: -60px;
  right: 0;
  bottom: -60px;
  left: 0;
  background-image: url(${getURL('/statics/imgs/cat.svg')});
  background-repeat: no-repeat;
  background-size: auto 100%;
  background-position: calc(50% + 320px) center;
  opacity: 0.04;
  user-select: none;
  pointer-events: none;
`;

const SubPageBody = ({title, filterName, filter, handleSetSetting}) => {
    return (
        <List>
            <ListItem
                onClick={() => handleSetSetting(filterName)}
                operation={<Radio on={filter.on}/>}
                subList={{
                    children: <CheckBoxGroup
                        data={filter.types}
                        value={filter.value}
                        onClick={(value) => handleSetSetting(filterName, value)}
                    />,
                }}
            >{title}</ListItem>
        </List>
    );
};

class PageConfig extends React.Component {
    constructor(props) {
        super(props);

        this.settings = {
            video: {
                title: '主站',
                map: {},
            },
            live: {
                title: '直播',
                map: {},
            },
            popup: {
                title: '菜单栏',
                map: {},
            },
            other: {
                title: '其他',
                map: {},
            },
        };
        this.state = {
            modalTitle: null,
            modalBody: null,
            modalButtons: null,
            modalOn: false,
            // sub page state
            subPageTitle: null,
            subPageParent: null,
            subPageOn: false,
            subPageSettings: null,
            ...this.settings,
            debug: false,
        };
    }

    componentWillMount() {
        chrome.runtime.sendMessage({commend: 'getSettings', checkHide: true}, (settings) => {
            // 以kind字段来将设置分类到不同list
            _.forEach(settings, (setting) => {
                const {kind, name} = setting;
                this.settings[kind].map[_.upperFirst(name)] = setting;
            });
            this.setState(this.settings);
        });

        // 监听配置更新
        chrome.runtime.onMessage.addListener(((message) => {
            if (message.commend === 'debugMode' && message.value !== undefined) {
                this.setState({debug: message.value});
            }
        }));
        // 获取调试模式
        chrome.runtime.sendMessage({commend: 'getSetting', feature: 'Debug'}, (setting) => {
            this.setState({debug: setting.on});
        });
    }

    /**
     * 设置配置
     */
    handleSetSetting = ({kind = '', featureName, settingName, subPage = false, on}) => {
        const name = _.upperFirst(featureName);
        const thisKindOfFeatures = this.state[kind];
        if (!!thisKindOfFeatures.map[name]) { // find it (*≧∪≦)
            const settingObject = thisKindOfFeatures.map[name]; // one feature in this kind of list
            if (!settingName && !on) { // 一级开关
                settingObject.on = !settingObject.on;
            } else if (settingName && settingObject.type && !subPage) { // 二级开关
                if (settingObject.type === 'checkbox' && on !== undefined) { // 多选组的值存于选项数组中 (￣.￣)
                    const index = _.findIndex(settingObject.options, {key: settingName});
                    settingObject.options[index].on = on;
                } else if (settingObject.type === 'radio') { // 单选组的值存于选项数组外 (￣.￣)
                    settingObject.value = settingName;
                } else {
                    console.error(`Undefined type: ${settingObject.type} (⊙ˍ⊙)!`);
                    return;
                }
            } else if (settingName && settingObject.subPage && subPage) { // 二级页面
                const index = _.findIndex(settingObject.subPage.options, {key: settingName});
                settingObject.subPage.options[index].on = on;
            } else {
                console.error(`Error Setting Object Σ(oﾟдﾟoﾉ)!`);
                return;
            }
            chrome.runtime.sendMessage({
                commend: 'setSetting',
                feature: name,
                settings: settingObject,
            }, (res) => {
                if (res) {
                    thisKindOfFeatures.map[name] = settingObject;
                    this.setState({[kind]: thisKindOfFeatures});
                }
            });
        } else console.error(`Not find kind[${kind}]'s setting (*ﾟДﾟ*)!`);
    };

    createSettingDOM = () => {
        return _.map(this.settings, (e, kind) => {
            const list = this.state[kind];
            return !_.isEmpty(list.map) ? <List key={kind} title={list.title} ref={i => this[`${kind}Ref`] = i}>
                {_.map(list.map, (settings, featureName) => {
                    const {on, description, title, subPage, toggle} = settings;
                    const SubListChildren = this.createSubListComponent({kind, featureName, settings});
                    const toggleMode = toggle === undefined || subPage ? true : toggle;
                    const twoLine = description !== undefined;
                    const mainClickCallback = !subPage ? () => this.handleSetSetting({kind, featureName}) : null;
                    const operation = !!subPage
                                      ? <Button icon="arrowRight"
                                                onClick={() => this.handleSetSubPage(this[`${kind}Ref`], settings)}
                                      />
                                      : <Radio disable={!toggleMode} on={on}/>;
                    return <ListItem
                        key={featureName}
                        toggle={toggleMode}
                        onClick={on !== undefined && toggleMode !== false ? mainClickCallback : null}
                        operation={on !== undefined ? operation : null}
                        subList={SubListChildren ? {
                            hide: on === undefined ? false : !on,
                            children: SubListChildren,
                        } : null}
                        twoLine={twoLine}
                        first={twoLine ? title : ''}
                        second={twoLine ? description : ''}
                        children={twoLine ? null : title}
                    />;
                })}
            </List> : null;
        });
    };

    createSubListComponent = ({kind = '', featureName = '', settings = {}}) => {
        let SubListChildren = null;
        const {options, type, value} = settings;
        if (!!options && !!type) {
            switch (settings.type) {
                case 'checkbox':
                    SubListChildren = <CheckBoxGroup
                        data={options}
                        onClick={(settingName, on) => this.handleSetSetting({kind, featureName, settingName, on})}
                    />;
                    break;
                case 'radio':
                    SubListChildren = <RadioButtonGroup
                        value={value}
                        data={options}
                        onClick={(settingName) => this.handleSetSetting({kind, featureName, settingName})}
                    />;
                    break;
            }
        }
        return SubListChildren;
    };

    handleSetSubPage = (parent = null, settings = null) => {
        const {subPageOn, parent: currentParent} = this.state;
        const newState = {
            subPageOn: !subPageOn,
            subPageTitle: settings ? settings.title : null,
            subPageParent: (currentParent !== parent && parent && parent.ListWrapper) ? parent.ListWrapper.querySelector('.list-body') : null,
            subPageSettings: settings,
        };

        this.setState(newState);
    };

    createSubPage = () => {
        const {subPageSettings} = this.state;
        const {kind, name: featureName, on, toggle, subPage} = subPageSettings;
        const {options, title} = subPage;
        return <ListItem
            toggle={toggle}
            onClick={() => this.handleSetSetting({kind, featureName})}
            operation={<Radio on={on}/>}
            subList={{
                children: <CheckBoxGroup
                    data={options}
                    onClick={(settingName, on) => this.handleSetSetting({
                        kind, featureName, settingName, on, subPage: true,
                    })}
                />,
            }}
        >{title}</ListItem>;
    };

    render() {
        const {
            // modal state
            modalOn,
            modalTitle,
            modalBody,
            modalButtons,
            // sub page state
            subPageOn,
            subPageTitle,
            subPageParent,
            debug,
        } = this.state;
        return <React.Fragment>
            {/*<Header title="设置"/>*/}
            <ConfigBody>
                <Cat/>
                <SubPage
                    on={subPageOn}
                    title={subPageTitle}
                    parent={subPageParent}
                    onClose={() => this.handleSetSubPage(subPageParent)}
                >
                    <List>{subPageOn && this.createSubPage()}</List>
                </SubPage>
                {this.createSettingDOM()}
                <List title="关于" ref={i => this.aboutList = i}>
                    <ListItem
                        icon={<Icon icon="catSvg" image/>}
                        twoLine
                        first={chrome.i18n.getMessage('extName')}
                        second={`版本 ${version}（${debug ? '测试' : '正式'}版）`}
                        separator
                        operation={<Button disable normal>检查更新</Button>}
                    />
                    {_.map(updateData, (data, i) => <UpdateList key={i} title={data.title} data={data.list}/>)}
                </List>
            </ConfigBody>
            <Modal on={modalOn} title={modalTitle} body={modalBody} buttons={modalButtons}/>
        </React.Fragment>;
    }
}

$(document).ready(() => {
    ReactDOM.render(
        <PageConfig/>,
        document.getElementById('root'),
        consoleLogo,
    );
});

