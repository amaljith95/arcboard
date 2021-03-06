import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { DataSourceInstanceSettings } from '@grafana/data';
import { TemplateSrv } from 'app/features/templating/template_srv';
import { CustomVariable } from 'app/features/templating/all';
import { Props, QueryEditor } from './QueryEditor';
import CloudWatchDatasource from '../datasource';

const setup = () => {
  const instanceSettings = {
    jsonData: { defaultRegion: 'us-east-1' },
  } as DataSourceInstanceSettings;

  const templateSrv = new TemplateSrv();
  templateSrv.init([
    new CustomVariable(
      {
        name: 'var3',
        options: [
          { selected: true, value: 'var3-foo' },
          { selected: false, value: 'var3-bar' },
          { selected: true, value: 'var3-baz' },
        ],
        current: {
          value: ['var3-foo', 'var3-baz'],
        },
        multi: true,
      },
      {} as any
    ),
  ]);

  const datasource = new CloudWatchDatasource(instanceSettings, templateSrv as any, {} as any);
  datasource.metricFindQuery = async () => [{ value: 'test', label: 'test' }];

  const props: Props = {
    query: {
      refId: '',
      id: '',
      region: 'us-east-1',
      namespace: 'ec2',
      metricName: 'CPUUtilization',
      dimensions: { somekey: 'somevalue' },
      statistics: [],
      period: '',
      expression: '',
      alias: '',
      matchExact: true,
    },
    datasource,
    history: [],
    onChange: jest.fn(),
    onRunQuery: jest.fn(),
  };

  return props;
};

describe('QueryEditor', () => {
  it('should render component', async () => {
    const { act } = renderer;
    await act(async () => {
      const props = setup();
      const tree = renderer.create(<QueryEditor {...props} />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('should use correct default values', () => {
    it('when region is null is display default in the label', async () => {
      // @ts-ignore strict null error TS2345: Argument of type '() => Promise<void>' is not assignable to parameter of type '() => void | undefined'.
      await act(async () => {
        const props = setup();
        props.query.region = (null as unknown) as string;
        const wrapper = mount(<QueryEditor {...props} />);
        expect(
          wrapper
            .find('.gf-form-inline')
            .first()
            .find('.gf-form-label.query-part')
            .first()
            .text()
        ).toEqual('default');
      });
    });

    it('should init props correctly', async () => {
      // @ts-ignore strict null error TS2345: Argument of type '() => Promise<void>' is not assignable to parameter of type '() => void | undefined'.
      await act(async () => {
        const props = setup();
        props.query.namespace = (null as unknown) as string;
        props.query.metricName = (null as unknown) as string;
        props.query.expression = (null as unknown) as string;
        props.query.dimensions = (null as unknown) as { [key: string]: string | string[] };
        props.query.region = (null as unknown) as string;
        props.query.statistics = (null as unknown) as string[];
        const wrapper = mount(<QueryEditor {...props} />);
        const {
          query: { namespace, region, metricName, dimensions, statistics, expression },
        } = wrapper.props();
        expect(namespace).toEqual('');
        expect(metricName).toEqual('');
        expect(expression).toEqual('');
        expect(region).toEqual('default');
        expect(statistics).toEqual(['Average']);
        expect(dimensions).toEqual({});
      });
    });
  });
});
