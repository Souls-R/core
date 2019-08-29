import * as React from 'react';
import { ReactEditorComponent } from '@ali/ide-editor/lib/browser';
import { useInjectable, PreferenceSchemaProvider, PreferenceDataProperty, URI, CommandService } from '@ali/ide-core-browser';
import { PreferenceService } from './preference.service';
import { IWorkspaceService } from '@ali/ide-workspace';
import { EDITOR_COMMANDS } from '@ali/ide-core-browser';
import { FileServiceClient } from '@ali/ide-file-service/lib/browser/file-service-client';
import Tabs from 'antd/lib/tabs';
import 'antd/lib/tabs/style/index.css';
import './index.less';

const { TabPane } = Tabs;

let initView = false;
let selectedPreference;
export const PreferenceView: ReactEditorComponent<null> = (props) => {

  const preferenceService: PreferenceService  = useInjectable(PreferenceService);
  const defaultPreferenceProvider: PreferenceSchemaProvider = (preferenceService.defaultPreference as PreferenceSchemaProvider);
  const commandService = useInjectable(CommandService);
  const fileServiceClient: FileServiceClient = useInjectable(FileServiceClient);

  const defaultList = defaultPreferenceProvider.getPreferences();
  const [list, setList] = React.useState({});

  const workspaceService: IWorkspaceService = useInjectable(IWorkspaceService);

  workspaceService.whenReady.finally(() => {
    preferenceService.userPreference.ready.finally(() => {
      if (!initView) {
        initView = true;
        selectedPreference = preferenceService.userPreference;
        preferenceService.getPreferences(preferenceService.userPreference).then((list) => {
          setList(Object.assign({}, defaultList, list));
        });
      }
    });
  });

  const changeValue = (key, value) => {
    selectedPreference.setPreference(key, value).then(() => {
      preferenceService.getPreferences(selectedPreference).then( (list) => {
          setList(Object.assign({}, defaultList, list));
      });
    });
  };

  const renderPreferenceList = () => {
    const results: React.ReactNode[] = [];

    for (const key of Object.keys(list)) {
      results.push(renderPreferenceItem(key, list[key]));
    }
    return results;
  };

  const renderPreferenceItem = (key, value) => {
    const prop: PreferenceDataProperty|undefined = defaultPreferenceProvider.getPreferenceProperty(key);
    if (prop) {
      switch (prop.type) {
        case 'boolean':
          return renderBooleanValue(key, value);
          break;
        case 'integer':
        case 'number':
          return renderNumberValue(key, value);
          break;
        case 'string':
          if (prop.enum) {
            return renderEnumsValue(key, value);
          } else {
            return renderTextValue(key, value);
          }
          break;
        default:
          return renderOtherValue(key, value);
      }
    }
    return <div></div>;
  };

  const renderBooleanValue = (key, value) => {
    const prop: PreferenceDataProperty|undefined = defaultPreferenceProvider.getPreferenceProperty(key);

    return (
      <div className='preference-line' key={key}>
        <div className='key'>
          {key}
        </div>
        <div className='control-wrap'>
          <select onChange={(event) => {
              changeValue(key, event.target.value === 'true');
            }}
            className='select-control'
            value={value ? 'true' : 'false'}
          >
            <option key='true' value='true'>true</option>
            <option key='value' value='false'>false</option>
          </select>
        </div>
        {prop && prop.description && <div className='desc'>{prop.description}</div>}
      </div>
    );
  };

  const renderNumberValue = (key, value) => {
    const prop: PreferenceDataProperty|undefined = defaultPreferenceProvider.getPreferenceProperty(key);

    return (
      <div className='preference-line' key={key}>
        <div className='key'>
          {key}
        </div>
        {prop && prop.description && <div className='desc'>{prop.description}</div>}
        <div className='control-wrap'>
          <input
            type='number'
            className='number-control'
            onChange={(event) => {
              changeValue(key, parseInt(event.target.value, 10));
            }}
            defaultValue={value}
          />
        </div>
      </div>
    );
  };

  const renderTextValue = (key, value) => {
    const prop: PreferenceDataProperty|undefined = defaultPreferenceProvider.getPreferenceProperty(key);

    return (
      <div className='preference-line' key={key}>
        <div className='key'>
          {key}
        </div>
        {prop && prop.description && <div className='desc'>{prop.description}</div>}
        <div className='control-wrap'>
          <input
            type='text'
            className='text-control'
            onChange={(event) => {
              changeValue(key, event.target.value);
            }}
            defaultValue={value}
          />
        </div>
      </div>
    );
  };

  const renderEnumsValue = (key, value) => {
    const prop: PreferenceDataProperty|undefined = defaultPreferenceProvider.getPreferenceProperty(key);

    if (!prop) {
      return <div></div>;
    }

    const options = (prop as PreferenceDataProperty).enum!.map((item) => {
      return <option value={item}>{item}</option>;
    });

    return (
      <div className='preference-line' key={key}>
        <div className='key'>
          {key}
        </div>
        {prop && prop.description && <div className='desc'>{prop.description}</div>}
        <div className='control-wrap'>
          <select onChange={(event) => {
              changeValue(key, event.target.value);
            }}
            className='select-control'
            defaultValue={value}
          >
            {options}
          </select>
        </div>
      </div>
    );
  };

  const renderOtherValue = (key, value) => {
    const prop: PreferenceDataProperty|undefined = defaultPreferenceProvider.getPreferenceProperty(key);

    return (
      <div className='preference-line' key={key}>
        <div className='key'>
          {key}
        </div>
        {prop && prop.description && <div className='desc'>{prop.description}</div>}
        <div className='control-wrap'>
          <a href='#' onClick={editSettingsJson}>Edit in settings.json</a>
        </div>
      </div>
    );
  };
  const editSettingsJson = () => {
    if (selectedPreference === preferenceService.userPreference) {
      fileServiceClient.getCurrentUserHome().then((dir) => {
        if (dir) {
          const uri = dir.uri + '/.kaitian/settings.json';
          commandService.executeCommand(EDITOR_COMMANDS.OPEN_RESOURCE.id, new URI(uri));
        }
      });
    } else {
      workspaceService.roots.then( (dirs) => {
        const dir = dirs[0];
        if (dir) {
          const uri = dir.uri + '/.kaitian/settings.json';
          commandService.executeCommand(EDITOR_COMMANDS.OPEN_RESOURCE.id, new URI(uri));
        }
      });
    }
  };

  return (
    <Tabs defaultActiveKey='1'
      className='preference-tabs'
      onChange={async (key) => {

        switch (key) {
          case 'user':
            selectedPreference = preferenceService.userPreference;
            preferenceService.getPreferences(preferenceService.userPreference).then((list) => {
              setList(Object.assign({}, defaultList, list));
            });
            break;
          case 'workspace':
            selectedPreference = preferenceService.workspacePreference;
            preferenceService.getPreferences(preferenceService.workspacePreference).then((list) => {
              setList(Object.assign({}, defaultList, list));
            });
            break;
        }
      }}>
      <TabPane tab='user' key='user'>
        <div className='preference-view' key={Object.keys(list).join('-')}>
          {renderPreferenceList()}
        </div>
      </TabPane>
      <TabPane tab='workspace' key='workspace'>
        <div className='preference-view' key={Object.keys(list).join('-')}>
          {renderPreferenceList()}
        </div>
      </TabPane>
    </Tabs>
  );
};
